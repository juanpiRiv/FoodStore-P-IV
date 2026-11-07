import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo?: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({
  titulo = 'No hay resultados',
  descripcion,
  accion,
}: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-slate-700">{titulo}</p>
      {descripcion ? <p className="text-sm text-slate-500">{descripcion}</p> : null}
      {accion}
    </div>
  )
}
