import { axiosInstance } from '../../../shared/api/axiosInstance.ts'
import type { LoginCredenciales, UserCreate, UserPublic } from '../types/index.ts'

export async function iniciarSesion({ username, password }: LoginCredenciales): Promise<void> {
  const cuerpo = new URLSearchParams()
  cuerpo.set('username', username)
  cuerpo.set('password', password)
  await axiosInstance.post<{ message: string }>('/auth/token', cuerpo, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export async function registrarUsuario(datos: UserCreate): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>('/auth/register', datos)
  return data
}

export async function cerrarSesion(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

export async function obtenerPerfil(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>('/auth/me')
  return data
}
