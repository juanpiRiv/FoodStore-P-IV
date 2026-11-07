/** Convierte los errores de un campo de TanStack Form en un único texto (o null). */
export function errorCampo(errores: unknown[]): string | null {
  const primero = errores.find((e) => e !== undefined && e !== null)
  if (primero === undefined) return null
  if (typeof primero === 'string') return primero
  if (typeof primero === 'object' && primero !== null && 'message' in primero) {
    const { message } = primero as { message: unknown }
    if (typeof message === 'string') return message
  }
  return 'Valor inválido'
}
