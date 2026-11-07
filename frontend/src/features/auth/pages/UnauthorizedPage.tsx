import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card.tsx'

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md text-center">
      <h1 className="mb-2 text-xl font-semibold">Sin permiso</h1>
      <p className="mb-4 text-slate-600">No tenés permisos para acceder a esta sección.</p>
      <Link to="/" className="font-medium text-acento-600 hover:underline">
        Volver al inicio
      </Link>
    </Card>
  )
}
