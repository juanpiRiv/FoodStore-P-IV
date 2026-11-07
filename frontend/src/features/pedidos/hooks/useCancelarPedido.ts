import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarPedido } from '../api/pedidos.ts'

export function useCancelarPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pedidos'] })
      void qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
