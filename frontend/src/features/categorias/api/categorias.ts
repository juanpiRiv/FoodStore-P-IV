import { axiosInstance } from '../../../shared/api/axiosInstance.ts'
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/index.ts'

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(datos: CategoriaCreate): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', datos)
  return data
}

export async function actualizarCategoria(id: number, datos: CategoriaUpdate): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}
