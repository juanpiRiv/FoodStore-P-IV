import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cerrarSesion, iniciarSesion, obtenerPerfil } from '../features/auth/api/auth.ts'
import type { LoginCredenciales, UserPublic } from '../features/auth/types/index.ts'

interface AuthState {
  usuario: UserPublic | null
  cargando: boolean
  login: (credenciales: LoginCredenciales) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (credenciales) => {
        await iniciarSesion(credenciales)
        const usuario = await obtenerPerfil()
        set({ usuario })
      },
      logout: async () => {
        try {
          await cerrarSesion()
        } finally {
          set({ usuario: null })
        }
      },
      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await obtenerPerfil()
          set({ usuario, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'food-store-auth',
      // Solo se guarda el usuario; el token vive en la cookie HttpOnly y nunca se lee.
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
)
