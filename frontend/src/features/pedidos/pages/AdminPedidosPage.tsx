import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { Paginacion } from '../../../shared/components/Paginacion.tsx'
import { SkeletonLista } from '../../../shared/components/Skeleton.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Modal } from '../../../shared/ui/Modal.tsx'
import { DetallePedidoView } from '../components/DetallePedidoView.tsx'
import { TablaPedidos } from '../components/TablaPedidos.tsx'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido.ts'
import { usePedidos } from '../hooks/usePedidos.ts'
import type { EstadoPedido, Pedido } from '../types/index.ts'

const LIMITE = 10
const ESTADOS: { valor: EstadoPedido; etiqueta: string }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'EN_PREPARACION', etiqueta: 'En preparación' },
  { valor: 'ENTREGADO', etiqueta: 'Entregado' },
  { valor: 'CANCELADO', etiqueta: 'Cancelado' },
]

function esEstado(valor: string): valor is EstadoPedido {
  return ESTADOS.some((e) => e.valor === valor)
}

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const pedidos = usePedidos({ skip: pagina * LIMITE, limit: LIMITE, estado }, 'admin')
  const cambiar = useCambiarEstadoPedido()

  const seleccionado: Pedido | undefined = pedidos.data?.items.find((p) => p.id === seleccionadoId)

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="flex max-w-xs flex-col gap-1">
        <label htmlFor="filtro-estado" className="text-sm font-medium text-slate-700">
          Filtrar por estado
        </label>
        <select
          id="filtro-estado"
          value={estado ?? ''}
          onChange={(e) => {
            setEstado(esEstado(e.target.value) ? e.target.value : undefined)
            setPagina(0)
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-acento-500"
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {cambiar.isError ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(cambiar.error)}
        </p>
      ) : null}

      {pedidos.isPending ? (
        <SkeletonLista />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos" descripcion="No se encontraron pedidos con ese filtro." />
      ) : (
        <>
          <TablaPedidos
            pedidos={pedidos.data.items}
            onVerDetalle={(p) => setSeleccionadoId(p.id)}
            onCambiarEstado={(p, nuevo) => cambiar.mutate({ id: p.id, estado: nuevo })}
            ocupado={cambiar.isPending}
          />
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.ceil(pedidos.data.total / LIMITE)}
            onCambiar={setPagina}
          />
        </>
      )}

      <Modal
        abierto={seleccionado !== undefined}
        titulo={seleccionado ? `Pedido #${seleccionado.id}` : 'Pedido'}
        onCerrar={() => setSeleccionadoId(null)}
      >
        {seleccionado ? (
          <div className="flex flex-col gap-4">
            <DetallePedidoView pedido={seleccionado} />
            <div className="flex justify-end">
              <Button variante="secundario" onClick={() => setSeleccionadoId(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
