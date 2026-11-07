import { handleApiError } from '../api/handleApiError.ts'
import { Button } from '../ui/Button.tsx'

interface EstadoErrorProps {
  error: unknown
  onReintentar?: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center"
    >
      <p className="font-medium text-red-800">No se pudieron cargar los datos</p>
      <p className="text-sm text-red-700">{handleApiError(error)}</p>
      {onReintentar ? (
        <Button variante="secundario" onClick={onReintentar}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}
