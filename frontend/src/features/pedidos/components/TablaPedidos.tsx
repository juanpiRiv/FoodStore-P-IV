import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { TablaDatos } from '../../../shared/components/TablaDatos.tsx'
import { formatearFecha, formatearMoneda } from '../../../shared/formato.ts'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import type { EstadoPedido, Pedido } from '../types/index.ts'

const columna = createColumnHelper<Pedido>()

/** Máquina de estados: acciones que el administrador puede ejecutar desde cada estado. */
export const ACCIONES_POR_ESTADO: Record<
  EstadoPedido,
  { etiqueta: string; destino: EstadoPedido; peligro: boolean }[]
> = {
  PENDIENTE: [
    { etiqueta: 'Preparar', destino: 'EN_PREPARACION', peligro: false },
    { etiqueta: 'Cancelar', destino: 'CANCELADO', peligro: true },
  ],
  EN_PREPARACION: [
    { etiqueta: 'Entregar', destino: 'ENTREGADO', peligro: false },
    { etiqueta: 'Cancelar', destino: 'CANCELADO', peligro: true },
  ],
  ENTREGADO: [],
  CANCELADO: [],
}

interface TablaPedidosProps {
  pedidos: Pedido[]
  onVerDetalle: (pedido: Pedido) => void
  /** Si se define, se muestran los botones de la máquina de estados (vista admin). */
  onCambiarEstado?: (pedido: Pedido, estado: EstadoPedido) => void
  /** Si se define, se muestra «Cancelar» solo en PENDIENTE (vista cliente). */
  onCancelar?: (pedido: Pedido) => void
  puedeCancelar?: (pedido: Pedido) => boolean
  ocupado?: boolean
}

export function TablaPedidos({
  pedidos,
  onVerDetalle,
  onCambiarEstado,
  onCancelar,
  puedeCancelar = () => true,
  ocupado = false,
}: TablaPedidosProps) {
  const columnas = [
    columna.accessor('id', { header: 'N.º', cell: (c) => `#${c.getValue()}` }),
    columna.accessor('created_at', { header: 'Fecha', cell: (c) => formatearFecha(c.getValue()) }),
    columna.accessor('estado', { header: 'Estado', cell: (c) => <BadgeEstado estado={c.getValue()} /> }),
    columna.accessor('total', { header: 'Total', cell: (c) => formatearMoneda(c.getValue()) }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original
        return (
          <div className="flex flex-wrap gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => onVerDetalle(pedido)}>
              Ver detalle
            </Button>
            {onCambiarEstado
              ? ACCIONES_POR_ESTADO[pedido.estado].map((a) => (
                  <Button
                    key={a.destino}
                    variante={a.peligro ? 'peligro' : 'primario'}
                    tamano="sm"
                    disabled={ocupado}
                    onClick={() => onCambiarEstado(pedido, a.destino)}
                  >
                    {a.etiqueta}
                  </Button>
                ))
              : null}
            {onCancelar && pedido.estado === 'PENDIENTE' && puedeCancelar(pedido) ? (
              <Button variante="peligro" tamano="sm" disabled={ocupado} onClick={() => onCancelar(pedido)}>
                Cancelar
              </Button>
            ) : null}
          </div>
        )
      },
    }),
  ]

  const tabla = useReactTable({
    data: pedidos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return <TablaDatos tabla={tabla} />
}
