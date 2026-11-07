import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { errorCampo } from '../../../shared/ui/errorCampo.ts'
import { Input } from '../../../shared/ui/Input.tsx'
import { registrarUsuario } from '../api/auth.ts'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()
  const registro = useMutation({
    mutationFn: registrarUsuario,
    onSuccess: () => navigate('/login'),
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      await registro.mutateAsync(value).catch(() => undefined)
    },
  })

  return (
    <Card className="mx-auto max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Crear cuenta</h1>
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => (value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres'),
          }}
        >
          {(field) => (
            <Input
              label="Usuario"
              autoComplete="username"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
            />
          )}
        </form.Field>
        <form.Field
          name="full_name"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}
        >
          {(field) => (
            <Input
              label="Nombre completo"
              autoComplete="name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
            />
          )}
        </form.Field>
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (REGEX_EMAIL.test(value) ? undefined : 'Ingresá un email válido'),
          }}
        >
          {(field) => (
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
            />
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres'),
          }}
        >
          {(field) => (
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.isTouched ? errorCampo(field.state.meta.errors) : null}
            />
          )}
        </form.Field>
        {registro.isError ? (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {handleApiError(registro.error)}
          </p>
        ) : null}
        <Button type="submit" disabled={registro.isPending}>
          {registro.isPending ? 'Creando cuenta…' : 'Registrarme'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-acento-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </Card>
  )
}
