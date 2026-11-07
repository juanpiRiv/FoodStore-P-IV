import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { errorCampo } from '../../../shared/ui/errorCampo.ts'
import { Input } from '../../../shared/ui/Input.tsx'
import type { Producto, ProductoStockUpdate } from '../types/index.ts'

interface StockFormProps {
  producto: Producto
  enviando: boolean
  error: unknown
  onEnviar: (datos: ProductoStockUpdate) => void
  onCancelar: () => void
}

export function StockForm({ producto, enviando, error, onEnviar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onEnviar({ stock: Number(value.stock), disponible: value.disponible }),
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
      <p className="text-sm text-slate-600">{producto.nombre}</p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value)
            return value.trim() !== '' && Number.isInteger(n) && n >= 0
              ? undefined
              : 'El stock debe ser un entero mayor o igual a 0'
          },
        }}
      >
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
          {enviando ? 'Guardando…' : 'Actualizar stock'}
        </Button>
      </div>
    </form>
  )
}
