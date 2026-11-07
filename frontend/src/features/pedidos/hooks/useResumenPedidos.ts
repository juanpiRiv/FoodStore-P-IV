import { useQuery } from '@tanstack/react-query'
import { obtenerResumenPedidos } from '../api/pedidos.ts'

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: obtenerResumenPedidos })
}
