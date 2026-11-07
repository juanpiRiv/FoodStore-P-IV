from datetime import datetime

from app.core.clock import now
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self):
        super().__init__("El pedido pertenece a otro usuario")


class PedidoSinItems(Exception):
    def __init__(self):
        super().__init__("El pedido debe tener al menos un ítem")


class ProductoRepetido(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int, cantidad: int):
        super().__init__(f"Stock insuficiente para '{nombre}': disponible {stock}, solicitado {cantidad}")


class TransicionInvalida(Exception):
    def __init__(self, actual: EstadoPedido, nuevo: EstadoPedido):
        super().__init__(f"Transición inválida: {actual.value} -> {nuevo.value}")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        if not data.items:
            raise PedidoSinItems()
        ids = [item.producto_id for item in data.items]
        repetidos = {i for i in ids if ids.count(i) > 1}
        if repetidos:
            raise ProductoRepetido(min(repetidos))

        with self.uow as uow:
            # Se bloquean los productos por id ascendente para evitar deadlocks entre pedidos simultáneos.
            productos = {}
            for producto_id in sorted(ids):
                producto = uow.productos.get_by_id_for_update(producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(producto_id)
                productos[producto_id] = producto

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=EstadoPedido.PENDIENTE.value,
                    forma_pago=data.forma_pago.value,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = productos[item.producto_id]
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)
                producto.stock -= item.cantidad
                subtotal = producto.precio_base * item.cantidad
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = total
            uow.pedidos.flush()
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: Usuario, skip: int, limit: int, estado: EstadoPedido | None
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                pedidos, total = uow.pedidos.list_pedidos(skip, limit, estado)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(usuario.id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.combine(now().date(), datetime.min.time())
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(EstadoPedido.ENTREGADO),
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            self._transicionar(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida(EstadoPedido(pedido.estado), EstadoPedido.CANCELADO)
            self._transicionar(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> None:
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(actual, nuevo)
        if nuevo == EstadoPedido.CANCELADO:
            for item in sorted(pedido.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_by_id_for_update(item.producto_id)
                producto.stock += item.cantidad
        pedido.estado = nuevo.value
        pedido.updated_at = now()
        uow.pedidos.add(pedido)
