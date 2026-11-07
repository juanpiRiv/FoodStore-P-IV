import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: 'sm' | 'md'
}

const estilos: Record<Variante, string> = {
  primario: 'bg-acento-600 text-white hover:bg-acento-700 focus-visible:outline-acento-600',
  secundario:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 focus-visible:outline-slate-500',
  peligro: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  fantasma: 'text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  className = '',
  type = 'button',
  ...resto
}: ButtonProps) {
  const medida = tamano === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${medida} ${estilos[variante]} ${className}`}
      {...resto}
    />
  )
}
