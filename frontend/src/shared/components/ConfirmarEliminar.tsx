import { handleApiError } from '../api/handleApiError.ts'
import { Button } from '../ui/Button.tsx'

interface ConfirmarEliminarProps {
  mensaje: string
  enviando: boolean
  error: unknown
  onConfirmar: () => void
  onCancelar: () => void
}

/** Confirmación de baja lógica; se renderiza dentro de un Modal (sin window.confirm). */
export function ConfirmarEliminar({
  mensaje,
  enviando,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmarEliminarProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-700">{mensaje}</p>
      {error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(error)}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Volver
        </Button>
        <Button variante="peligro" disabled={enviando} onClick={onConfirmar}>
          {enviando ? 'Eliminando…' : 'Sí, eliminar'}
        </Button>
      </div>
    </div>
  )
}
