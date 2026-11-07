import { formatearFecha, formatearMoneda } from '../../../shared/formato.ts'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado.tsx'
import type { Pedido } from '../types/index.ts'

export function DetallePedidoView({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="font-medium text-slate-500">Estado</dt>
        <dd>
          <BadgeEstado estado={pedido.estado} />
        </dd>
        <dt className="font-medium text-slate-500">Fecha</dt>
        <dd>{formatearFecha(pedido.created_at)}</dd>
        <dt className="font-medium text-slate-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="font-medium text-slate-500">Forma de pago</dt>
        <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        {pedido.notas ? (
          <>
            <dt className="font-medium text-slate-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        ) : null}
      </dl>
      <table className="w-full">
        <caption className="sr-only">Líneas del pedido</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th scope="col" className="py-1 font-medium">Producto</th>
            <th scope="col" className="py-1 text-right font-medium">Cant.</th>
            <th scope="col" className="py-1 text-right font-medium">Precio</th>
            <th scope="col" className="py-1 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((l) => (
            <tr key={l.producto_id} className="border-b border-slate-100">
              <td className="py-1">{l.nombre_producto}</td>
              <td className="py-1 text-right">{l.cantidad}</td>
              <td className="py-1 text-right">{formatearMoneda(l.precio_unitario)}</td>
              <td className="py-1 text-right">{formatearMoneda(l.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3} className="py-2 text-right">Total</th>
            <td className="py-2 text-right font-bold">{formatearMoneda(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
