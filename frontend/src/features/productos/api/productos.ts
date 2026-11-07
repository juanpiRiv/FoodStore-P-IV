import { axiosInstance } from '../../../shared/api/axiosInstance.ts'
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/index.ts'

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const params: Record<string, string | number | boolean> = {
    skip: filtros.skip,
    limit: filtros.limit,
  }
  if (filtros.search) params.search = filtros.search
  if (filtros.categoria_id !== undefined) params.categoria_id = filtros.categoria_id
  if (filtros.disponible !== undefined) params.disponible = filtros.disponible
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', { params })
  return data
}

export async function crearProducto(datos: ProductoCreate): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', datos)
  return data
}

export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, datos)
  return data
}

export async function actualizarStockProducto(
  id: number,
  datos: ProductoStockUpdate,
): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, datos)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}
