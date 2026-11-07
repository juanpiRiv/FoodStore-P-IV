import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.ts'
import { useCartStore } from '../../store/cartStore.ts'
import { Button } from '../ui/Button.tsx'

const enlaceBase = 'rounded px-2 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-acento-600'
const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `${enlaceBase} ${isActive ? 'bg-acento-100 text-acento-700' : 'text-slate-600 hover:bg-slate-100'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  const alCerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
      >
        <Link to="/" className="text-lg font-bold text-acento-600">
          Food Store
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace}>
            Carrito ({cantidad})
          </NavLink>
          {usuario ? (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              Mis pedidos
            </NavLink>
          ) : null}
          {usuario?.role === 'admin' ? (
            <>
              <NavLink to="/admin/resumen" className={claseEnlace}>
                Resumen
              </NavLink>
              <NavLink to="/admin/categorias" className={claseEnlace}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={claseEnlace}>
                Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={claseEnlace}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/usuarios" className={claseEnlace}>
                Usuarios
              </NavLink>
            </>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-slate-600">
                {usuario.full_name}{' '}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium uppercase">
                  {usuario.role}
                </span>
              </span>
              <Button variante="secundario" tamano="sm" onClick={() => void alCerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseEnlace}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className={claseEnlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
