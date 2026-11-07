import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { ConfirmarEliminar } from '../../../shared/components/ConfirmarEliminar.tsx'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { SkeletonLista } from '../../../shared/components/Skeleton.tsx'
import { TablaDatos } from '../../../shared/components/TablaDatos.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Modal } from '../../../shared/ui/Modal.tsx'
import { CategoriaForm } from '../components/CategoriaForm.tsx'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias.ts'
import type { Categoria } from '../types/index.ts'

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; categoria: Categoria }
  | { tipo: 'eliminar'; categoria: Categoria }
  | null

const columna = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()
  const [dialogo, setDialogo] = useState<Dialogo>(null)

  const cerrar = () => {
    setDialogo(null)
    crear.reset()
    actualizar.reset()
    eliminar.reset()
  }

  const columnas = [
    columna.accessor('nombre', { header: 'Nombre' }),
    columna.accessor('descripcion', { header: 'Descripción', cell: (c) => c.getValue() ?? '—' }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variante="secundario"
            tamano="sm"
            onClick={() => setDialogo({ tipo: 'editar', categoria: row.original })}
          >
            Editar
          </Button>
          <Button
            variante="peligro"
            tamano="sm"
            onClick={() => setDialogo({ tipo: 'eliminar', categoria: row.original })}
          >
            Eliminar
          </Button>
        </div>
      ),
    }),
  ]

  const tabla = useReactTable({
    data: categorias.data ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })}>Nueva categoría</Button>
      </div>

      {categorias.isPending ? (
        <SkeletonLista />
      ) : categorias.isError ? (
        <EstadoError error={categorias.error} onReintentar={() => void categorias.refetch()} />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio titulo="No hay categorías" descripcion="Creá la primera categoría." />
      ) : (
        <TablaDatos tabla={tabla} />
      )}

      <Modal
        abierto={dialogo !== null}
        titulo={
          dialogo?.tipo === 'crear'
            ? 'Nueva categoría'
            : dialogo?.tipo === 'editar'
              ? 'Editar categoría'
              : 'Eliminar categoría'
        }
        onCerrar={cerrar}
      >
        {dialogo?.tipo === 'crear' ? (
          <CategoriaForm
            enviando={crear.isPending}
            error={crear.error}
            onCancelar={cerrar}
            onEnviar={(datos) => crear.mutate(datos, { onSuccess: cerrar })}
          />
        ) : null}
        {dialogo?.tipo === 'editar' ? (
          <CategoriaForm
            categoria={dialogo.categoria}
            enviando={actualizar.isPending}
            error={actualizar.error}
            onCancelar={cerrar}
            onEnviar={(datos) =>
              actualizar.mutate({ id: dialogo.categoria.id, datos }, { onSuccess: cerrar })
            }
          />
        ) : null}
        {dialogo?.tipo === 'eliminar' ? (
          <ConfirmarEliminar
            mensaje={`¿Seguro que querés eliminar la categoría "${dialogo.categoria.nombre}"? Se dará de baja del catálogo.`}
            enviando={eliminar.isPending}
            error={eliminar.error}
            onCancelar={cerrar}
            onConfirmar={() => eliminar.mutate(dialogo.categoria.id, { onSuccess: cerrar })}
          />
        ) : null}
      </Modal>
    </section>
  )
}
