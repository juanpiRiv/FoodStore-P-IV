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
import { useCancelarPedido } from '../hooks/useCancelarPedido.ts'
import { usePedidos } from '../hooks/usePedidos.ts'
import { useAuthStore } from '../../../store/authStore.ts'
import type { Pedido } from '../types/index.ts'

const LIMITE = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const pedidos = usePedidos({ skip: pagina * LIMITE, limit: LIMITE })
  const cancelar = useCancelarPedido()
  const usuario = useAuthStore((estado) => estado.usuario)

  // Un admin recibe todos los pedidos: solo puede cancelar desde acá los propios.
  const esPropio = (pedido: Pedido) => pedido.usuario_id === usuario?.id

  // El detalle se deriva de la lista vigente para reflejar el estado tras cancelar.
  const seleccionado: Pedido | undefined = pedidos.data?.items.find((p) => p.id === seleccionadoId)

  const cerrar = () => {
    setSeleccionadoId(null)
    cancelar.reset()
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>

      {cancelar.isError && seleccionadoId === null ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(cancelar.error)}
        </p>
      ) : null}

      {pedidos.isPending ? (
        <SkeletonLista />
      ) : pedidos.isError ? (
        <EstadoError error={pedidos.error} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio titulo="Todavía no hiciste pedidos" descripcion="Tus pedidos aparecerán acá." />
      ) : (
        <>
          <TablaPedidos
            pedidos={pedidos.data.items}
            onVerDetalle={(p) => setSeleccionadoId(p.id)}
            onCancelar={(p) => cancelar.mutate(p.id)}
            puedeCancelar={esPropio}
            ocupado={cancelar.isPending}
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
        onCerrar={cerrar}
      >
        {seleccionado ? (
          <div className="flex flex-col gap-4">
            <DetallePedidoView pedido={seleccionado} />
            {cancelar.isError ? (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {handleApiError(cancelar.error)}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              {seleccionado.estado === 'PENDIENTE' && esPropio(seleccionado) ? (
                <Button
                  variante="peligro"
                  disabled={cancelar.isPending}
                  onClick={() => cancelar.mutate(seleccionado.id)}
                >
                  Cancelar pedido
                </Button>
              ) : null}
              <Button variante="secundario" onClick={cerrar}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
