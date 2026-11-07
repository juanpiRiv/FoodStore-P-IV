import { isAxiosError } from 'axios'

interface ErrorValidacion {
  loc?: unknown
  msg?: unknown
}

function esErrorValidacion(valor: unknown): valor is ErrorValidacion {
  return typeof valor === 'object' && valor !== null
}

/** Convierte el `detail` de FastAPI (texto o arreglo de 422) en un mensaje legible. */
export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá tu conexión.'
    }
    const data: unknown = error.response.data
    if (typeof data === 'object' && data !== null && 'detail' in data) {
      const { detail } = data as { detail: unknown }
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) {
        const mensajes = detail.filter(esErrorValidacion).map((d) => {
          const campo = Array.isArray(d.loc) ? String(d.loc[d.loc.length - 1]) : ''
          const msg = typeof d.msg === 'string' ? d.msg : 'Valor inválido'
          return campo ? `${campo}: ${msg}` : msg
        })
        if (mensajes.length > 0) return mensajes.join('. ')
      }
    }
    return `Error inesperado del servidor (${error.response.status}).`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}
