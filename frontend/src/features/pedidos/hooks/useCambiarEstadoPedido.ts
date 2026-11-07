import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido } from '../api/pedidos.ts'
import type { EstadoPedido } from '../types/index.ts'

export function useCambiarEstadoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pedidos'] })
      void qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
