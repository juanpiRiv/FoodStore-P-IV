export type Rol = 'admin' | 'user'

export interface UserPublic {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface LoginCredenciales {
  username: string
  password: string
}
