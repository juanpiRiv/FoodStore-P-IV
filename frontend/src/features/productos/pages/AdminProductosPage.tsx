import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { ConfirmarEliminar } from '../../../shared/components/ConfirmarEliminar.tsx'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { SkeletonLista } from '../../../shared/components/Skeleton.tsx'
import { TablaDatos } from '../../../shared/components/TablaDatos.tsx'
import { formatearMoneda } from '../../../shared/formato.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { Modal } from '../../../shared/ui/Modal.tsx'
import { useCategorias } from '../../categorias/hooks/useCategorias.ts'
import { ProductoForm } from '../components/ProductoForm.tsx'
import { StockForm } from '../components/StockForm.tsx'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos.ts'
import type { Producto } from '../types/index.ts'

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }
  | null

const columna = createColumnHelper<Producto>()

export function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente.
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const stock = useActualizarStock()
  const eliminar = useEliminarProducto()
  const [dialogo, setDialogo] = useState<Dialogo>(null)

  const cerrar = () => {
    setDialogo(null)
    crear.reset()
    actualizar.reset()
    stock.reset()
    eliminar.reset()
  }

  const columnas = [
    columna.accessor('nombre', { header: 'Nombre' }),
    columna.accessor((p) => p.categoria?.nombre ?? '—', { id: 'categoria', header: 'Categoría' }),
    columna.accessor('precio_base', { header: 'Precio', cell: (c) => formatearMoneda(c.getValue()) }),
    columna.accessor('stock', { header: 'Stock' }),
    columna.accessor('disponible', {
      header: 'Disponible',
      cell: (c) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.getValue() ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}
        >
          {c.getValue() ? 'Sí' : 'No'}
        </span>
      ),
    }),
    columna.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variante="secundario"
            tamano="sm"
            onClick={() => setDialogo({ tipo: 'editar', producto: row.original })}
          >
            Editar
          </Button>
          <Button
            variante="secundario"
            tamano="sm"
            onClick={() => setDialogo({ tipo: 'stock', producto: row.original })}
          >
            Stock
          </Button>
          <Button
            variante="peligro"
            tamano="sm"
            onClick={() => setDialogo({ tipo: 'eliminar', producto: row.original })}
          >
            Eliminar
          </Button>
        </div>
      ),
    }),
  ]

  const tabla = useReactTable({
    data: productos.data?.items ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const titulo =
    dialogo?.tipo === 'crear'
      ? 'Nuevo producto'
      : dialogo?.tipo === 'editar'
        ? 'Editar producto'
        : dialogo?.tipo === 'stock'
          ? 'Stock y disponibilidad'
          : 'Eliminar producto'

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setDialogo({ tipo: 'crear' })}>Nuevo producto</Button>
      </div>

      {productos.isPending ? (
        <SkeletonLista />
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio titulo="No hay productos" descripcion="Creá el primer producto." />
      ) : (
        <TablaDatos tabla={tabla} />
      )}

      <Modal abierto={dialogo !== null} titulo={titulo} onCerrar={cerrar}>
        {dialogo?.tipo === 'crear' ? (
          <ProductoForm
            categorias={categorias.data ?? []}
            enviando={crear.isPending}
            error={crear.error}
            onCancelar={cerrar}
            onEnviar={(datos) => crear.mutate(datos, { onSuccess: cerrar })}
          />
        ) : null}
        {dialogo?.tipo === 'editar' ? (
          <ProductoForm
            producto={dialogo.producto}
            categorias={categorias.data ?? []}
            enviando={actualizar.isPending}
            error={actualizar.error}
            onCancelar={cerrar}
            onEnviar={(datos) =>
              actualizar.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })
            }
          />
        ) : null}
        {dialogo?.tipo === 'stock' ? (
          <StockForm
            producto={dialogo.producto}
            enviando={stock.isPending}
            error={stock.error}
            onCancelar={cerrar}
            onEnviar={(datos) => stock.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })}
          />
        ) : null}
        {dialogo?.tipo === 'eliminar' ? (
          <ConfirmarEliminar
            mensaje={`¿Seguro que querés eliminar el producto "${dialogo.producto.nombre}"? Se dará de baja del catálogo.`}
            enviando={eliminar.isPending}
            error={eliminar.error}
            onCancelar={cerrar}
            onConfirmar={() => eliminar.mutate(dialogo.producto.id, { onSuccess: cerrar })}
          />
        ) : null}
      </Modal>
    </section>
  )
}
