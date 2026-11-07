from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_pedidos(
        self,
        skip: int,
        limit: int,
        estado: EstadoPedido | None = None,
        usuario_id: int | None = None,
    ) -> tuple[list[Pedido], int]:
        filters = []
        if estado is not None:
            filters.append(Pedido.estado == estado.value)
        if usuario_id is not None:
            filters.append(Pedido.usuario_id == usuario_id)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filters)).one()
        statement = (
            select(Pedido)
            .where(*filters)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all()), total

    def list_by_usuario(
        self, usuario_id: int, skip: int, limit: int, estado: EstadoPedido | None = None
    ) -> tuple[list[Pedido], int]:
        return self.list_pedidos(skip, limit, estado, usuario_id)

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(statement).all()}

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(statement).one()

    def sum_total_por_estado(self, estado: EstadoPedido) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado.value)
        return float(self.session.exec(statement).one())
