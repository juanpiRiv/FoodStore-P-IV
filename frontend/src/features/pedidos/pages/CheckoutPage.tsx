import { Navigate, useNavigate } from 'react-router-dom'
import { formatearMoneda } from '../../../shared/formato.ts'
import { Card } from '../../../shared/ui/Card.tsx'
import { useCartStore } from '../../../store/cartStore.ts'
import { CheckoutForm } from '../components/CheckoutForm.tsx'
import { useCrearPedido } from '../hooks/useCrearPedido.ts'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
        <Card>
          <CheckoutForm
            total={total}
            enviando={crearPedido.isPending}
            error={crearPedido.error}
            onEnviar={(datos) =>
              crearPedido.mutate(
                {
                  items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
                  forma_pago: datos.forma_pago,
                  direccion_entrega: datos.direccion_entrega.trim(),
                  notas: datos.notas.trim() || null,
                },
                {
                  onSuccess: () => {
                    vaciar()
                    navigate('/mis-pedidos')
                  },
                },
              )
            }
          />
        </Card>
      </section>
      <aside>
        <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
        <Card>
          <ul className="divide-y divide-slate-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between py-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatearMoneda(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatearMoneda(total)}</span>
          </p>
        </Card>
      </aside>
    </div>
  )
}
