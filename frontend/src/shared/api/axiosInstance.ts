import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../../store/authStore.ts'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

const URLS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']

function detalleComoTexto(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const { detail } = data as { detail: unknown }
    return typeof detail === 'string' ? detail : null
  }
  return null
}

axiosInstance.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const esUrlDeSesion = URLS_SIN_LIMPIEZA.some((u) => url.includes(u))
      const sesionExpirada = status === 401 && !esUrlDeSesion
      const cuentaDesactivada =
        status === 400 && detalleComoTexto(data) === 'Cuenta de usuario desactivada'
      if (sesionExpirada || cuentaDesactivada) {
        // ProtectedRoute redirige a /login al quedar sin usuario.
        useAuthStore.getState().limpiarSesion()
      }
    }
    return Promise.reject(error)
  },
)
