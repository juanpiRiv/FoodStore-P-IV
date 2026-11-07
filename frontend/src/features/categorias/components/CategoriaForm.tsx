import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { errorCampo } from '../../../shared/ui/errorCampo.ts'
import { Input } from '../../../shared/ui/Input.tsx'
import type { Categoria, CategoriaCreate } from '../types/index.ts'

interface CategoriaFormProps {
  categoria?: Categoria
  enviando: boolean
  error: unknown
  onEnviar: (datos: CategoriaCreate) => void
  onCancelar: () => void
}

export function CategoriaForm({ categoria, enviando, error, onEnviar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: ({ value }) =>
      onEnviar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
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
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo >= 2 && largo <= 100 ? undefined : 'El nombre debe tener entre 2 y 100 caracteres'
          },
        }}
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
