import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { Skeleton } from '../../../shared/components/Skeleton.tsx'
import { formatearMoneda } from '../../../shared/formato.ts'
import { TarjetaResumen } from '../components/TarjetaResumen.tsx'
import { useResumenPedidos } from '../hooks/useResumenPedidos.ts'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Resumen</h1>
      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Cargando resumen">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError error={resumen.error} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={resumen.data.pendientes} />
          <TarjetaResumen titulo="En preparación" valor={resumen.data.en_preparacion} />
          <TarjetaResumen titulo="Entregados" valor={resumen.data.entregados} />
          <TarjetaResumen titulo="Cancelados" valor={resumen.data.cancelados} />
          <TarjetaResumen titulo="Pedidos de hoy" valor={resumen.data.pedidos_hoy} />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatearMoneda(resumen.data.ingresos_entregados)}
          />
        </div>
      )}
    </section>
  )
}
