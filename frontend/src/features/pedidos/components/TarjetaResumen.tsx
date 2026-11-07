import { Card } from '../../../shared/ui/Card.tsx'

interface TarjetaResumenProps {
  titulo: string
  valor: string | number
}

export function TarjetaResumen({ titulo, valor }: TarjetaResumenProps) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{valor}</p>
    </Card>
  )
}
