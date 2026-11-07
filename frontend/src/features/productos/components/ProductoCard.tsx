import { formatearMoneda } from '../../../shared/formato.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import type { Producto } from '../types/index.ts'

interface ProductoCardProps {
  producto: Producto
  onAgregar: (producto: Producto) => void
}

export function ProductoCard({ producto, onAgregar }: ProductoCardProps) {
  const sinStock = !producto.disponible || producto.stock <= 0
  return (
    <Card className="flex flex-col gap-3 p-0">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          className="h-40 w-full rounded-t-lg object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-40 w-full items-center justify-center rounded-t-lg bg-acento-50 text-4xl"
        >
          🍽️
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 px-4">
        {producto.categoria ? (
          <span className="text-xs font-medium uppercase text-acento-700">
            {producto.categoria.nombre}
          </span>
        ) : null}
        <h3 className="font-semibold">{producto.nombre}</h3>
        {producto.descripcion ? (
          <p className="line-clamp-2 text-sm text-slate-600">{producto.descripcion}</p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <div>
          <p className="font-bold">{formatearMoneda(producto.precio_base)}</p>
          <p className="text-xs text-slate-500">
            {sinStock ? 'No disponible' : `Stock: ${producto.stock}`}
          </p>
        </div>
        <Button disabled={sinStock} onClick={() => onAgregar(producto)}>
          Agregar al carrito
        </Button>
      </div>
    </Card>
  )
}
