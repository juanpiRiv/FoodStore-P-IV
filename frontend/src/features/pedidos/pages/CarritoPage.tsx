import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { formatearMoneda } from '../../../shared/formato.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { useCartStore } from '../../../store/cartStore.ts'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="font-medium text-acento-600 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <ul className="flex flex-col gap-3">
        {items.map((i) => (
          <li key={i.producto_id}>
            <Card className="flex flex-wrap items-center gap-4">
              <div className="min-w-40 flex-1">
                <p className="font-medium">{i.nombre}</p>
                <p className="text-sm text-slate-500">{formatearMoneda(i.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${i.nombre}`}>
                <Button
                  variante="secundario"
                  tamano="sm"
                  aria-label={`Disminuir cantidad de ${i.nombre}`}
                  onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center" aria-live="polite">
                  {i.cantidad}
                </span>
                <Button
                  variante="secundario"
                  tamano="sm"
                  aria-label={`Aumentar cantidad de ${i.nombre}`}
                  onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}
                >
                  +
                </Button>
              </div>
              <p className="w-28 text-right font-semibold">
                {formatearMoneda(i.precio_unitario * i.cantidad)}
              </p>
              <Button variante="fantasma" tamano="sm" onClick={() => quitar(i.producto_id)}>
                Quitar
              </Button>
            </Card>
          </li>
        ))}
      </ul>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg">
          Total: <span className="font-bold">{formatearMoneda(total)}</span>
        </p>
        <div className="flex gap-2">
          <Button variante="secundario" onClick={vaciar}>
            Vaciar carrito
          </Button>
          <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
        </div>
      </Card>
    </section>
  )
}
