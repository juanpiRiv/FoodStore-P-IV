import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { SkeletonLista } from '../../../shared/components/Skeleton.tsx'
import { TablaDatos } from '../../../shared/components/TablaDatos.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { useAuthStore } from '../../../store/authStore.ts'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios.ts'
import type { UserPublic } from '../types/index.ts'

const columna = createColumnHelper<UserPublic>()

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const sesion = useAuthStore((s) => s.usuario)
  const ocupado = activar.isPending || desactivar.isPending

  const columnas = [
    columna.accessor('username', { header: 'Usuario' }),
    columna.accessor('full_name', { header: 'Nombre' }),
    columna.accessor('email', { header: 'Email' }),
    columna.accessor('role', { header: 'Rol' }),
    columna.accessor('disabled', {
      header: 'Estado',
      cell: (c) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.getValue() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
        >
          {c.getValue() ? 'Inactivo' : 'Activo'}
        </span>
      ),
    }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const u = row.original
        if (u.disabled) {
          return (
            <Button tamano="sm" disabled={ocupado} onClick={() => activar.mutate(u.id)}>
              Activar
            </Button>
          )
        }
        if (u.id === sesion?.id) return <span className="text-xs text-slate-400">Tu cuenta</span>
        return (
          <Button variante="peligro" tamano="sm" disabled={ocupado} onClick={() => desactivar.mutate(u.id)}>
            Desactivar
          </Button>
        )
      },
    }),
  ]

  const tabla = useReactTable({
    data: usuarios.data ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const errorAccion = activar.error ?? desactivar.error

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      {errorAccion ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(errorAccion)}
        </p>
      ) : null}
      {usuarios.isPending ? (
        <SkeletonLista />
      ) : usuarios.isError ? (
        <EstadoError error={usuarios.error} onReintentar={() => void usuarios.refetch()} />
      ) : usuarios.data.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios" />
      ) : (
        <TablaDatos tabla={tabla} />
      )}
    </section>
  )
}
