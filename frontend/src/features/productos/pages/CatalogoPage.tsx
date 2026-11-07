import { useRef, useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { Paginacion } from '../../../shared/components/Paginacion.tsx'
import { Skeleton } from '../../../shared/components/Skeleton.tsx'
import { useCartStore } from '../../../store/cartStore.ts'
import { useCategorias } from '../../categorias/hooks/useCategorias.ts'
import { ProductoCard } from '../components/ProductoCard.tsx'
import { useProductos } from '../hooks/useProductos.ts'
import type { Producto } from '../types/index.ts'

const LIMITE = 12
const RETARDO_BUSQUEDA_MS = 400

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const agregar = useCartStore((s) => s.agregar)
  const [aviso, setAviso] = useState<string | null>(null)

  const categorias = useCategorias()
  const productos = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  })

  // Debounce por estado: el texto se refleja al instante, la consulta se actualiza tras una pausa.
  const alBuscar = (valor: string) => {
    setTexto(valor)
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      setBusqueda(valor.trim())
      setPagina(0)
    }, RETARDO_BUSQUEDA_MS)
  }

  const alAgregar = (p: Producto) => {
    agregar({
      producto_id: p.id,
      nombre: p.nombre,
      precio_unitario: p.precio_base,
      imagen_url: p.imagen_url,
    })
    setAviso(`"${p.nombre}" se agregó al carrito`)
  }

  const totalPaginas = Math.ceil((productos.data?.total ?? 0) / LIMITE)

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Catálogo</h1>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="busqueda" className="text-sm font-medium text-slate-700">
            Buscar producto
          </label>
          <input
            id="busqueda"
            type="search"
            value={texto}
            onChange={(e) => alBuscar(e.target.value)}
            placeholder="Nombre del producto"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-acento-500"
          />
        </div>
        <div className="flex flex-col gap-1 sm:w-64">
          <label htmlFor="categoria" className="text-sm font-medium text-slate-700">
            Categoría
          </label>
          <select
            id="categoria"
            value={categoriaId ?? ''}
            onChange={(e) => {
              setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
              setPagina(0)
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-acento-500"
          >
            <option value="">Todas</option>
            {categorias.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p role="status" className="min-h-5 text-sm text-green-700">
        {aviso}
      </p>

      {productos.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Cargando productos">
          {Array.from({ length: LIMITE }, (_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError error={productos.error} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion="Probá con otra búsqueda o categoría."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} onAgregar={alAgregar} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}
