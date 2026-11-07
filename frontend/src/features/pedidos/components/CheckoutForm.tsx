import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { formatearMoneda } from '../../../shared/formato.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { errorCampo } from '../../../shared/ui/errorCampo.ts'
import { Input } from '../../../shared/ui/Input.tsx'
import type { FormaPago } from '../types/index.ts'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  total: number
  enviando: boolean
  error: unknown
  onEnviar: (datos: DatosCheckout) => void
}

export function CheckoutForm({ total, enviando, error, onEnviar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) => onEnviar(value),
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            autoComplete="street-address"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="forma_pago" className="text-sm font-medium text-slate-700">
              Forma de pago
            </label>
            <select
              id="forma_pago"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO')}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-acento-500"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="notas" className="text-sm font-medium text-slate-700">
              Notas (opcional)
            </label>
            <textarea
              id="notas"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-acento-500"
            />
          </div>
        )}
      </form.Field>

      {error ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(error)}
        </p>
      ) : null}

      <Button type="submit" disabled={enviando}>
        {enviando ? 'Enviando pedido…' : `Confirmar pedido · ${formatearMoneda(total)}`}
      </Button>
    </form>
  )
}
