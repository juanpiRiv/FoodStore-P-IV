import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearPedido } from '../api/pedidos.ts'
import type { PedidoCreate } from '../types/index.ts'

export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pedidos'] })
      // El stock cambió: el catálogo debe volver a consultarse.
      void qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
