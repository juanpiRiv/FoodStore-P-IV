import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { errorCampo } from '../../../shared/ui/errorCampo.ts'
import { Input } from '../../../shared/ui/Input.tsx'
import type { Categoria } from '../../categorias/types/index.ts'
import type { Producto, ProductoCreate } from '../types/index.ts'

interface ProductoFormProps {
  producto?: Producto
  categorias: Categoria[]
  enviando: boolean
  error: unknown
  onEnviar: (datos: ProductoCreate) => void
  onCancelar: () => void
}

function validarNumero(minimo: number, entero: boolean) {
  return ({ value }: { value: string }): string | undefined => {
    if (value.trim() === '' || Number.isNaN(Number(value))) return 'Ingresá un número válido'
    const n = Number(value)
    if (n < minimo) return `El valor debe ser mayor o igual a ${minimo}`
    if (entero && !Number.isInteger(n)) return 'Debe ser un número entero'
    return undefined
  }
}

export function ProductoForm({
  producto,
  categorias,
  enviando,
  error,
  onEnviar,
  onCancelar,
}: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      categoria_id: producto ? String(producto.categoria_id) : '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
    },
    onSubmit: ({ value }) =>
      onEnviar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        categoria_id: Number(value.categoria_id),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
      }),
  })

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Input
            label="Descripción (opcional)"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="categoria_id" className="text-sm font-medium text-slate-700">
              Categoría
            </label>
            <select
              id="categoria_id"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-acento-500"
            >
              <option value="">Seleccionar…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {field.state.meta.isTouched && errorCampo(field.state.meta.errors) ? (
              <p role="alert" className="text-xs text-red-600">
                {errorCampo(field.state.meta.errors)}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="precio_base" validators={{ onChange: validarNumero(0, false) }}>
          {(field) => (
            <Input
              label="Precio base"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
            />
          )}
        </form.Field>
        <form.Field name="stock" validators={{ onChange: validarNumero(0, true) }}>
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
            />
          )}
        </form.Field>
      </div>
      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            type="url"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 accent-acento-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(error)}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
