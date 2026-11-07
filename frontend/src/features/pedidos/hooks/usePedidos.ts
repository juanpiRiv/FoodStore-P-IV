import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarPedidos } from '../api/pedidos.ts'
import type { FiltrosPedidos } from '../types/index.ts'

export function usePedidos(filtros: FiltrosPedidos, ambito: 'propios' | 'admin' = 'propios') {
  return useQuery({
    queryKey: ['pedidos', ambito, filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}
