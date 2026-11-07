import { Navigate, Outlet } from 'react-router-dom'
import type { Rol } from '../features/auth/types/index.ts'
import { useAuthStore } from '../store/authStore.ts'

interface ProtectedRouteProps {
  roles?: Rol[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)

  if (cargando) {
    return (
      <p role="status" className="py-16 text-center text-slate-500">
        Verificando sesión…
      </p>
    )
  }
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
