import { useEffect } from 'react'
import { AppRouter } from './routes/AppRouter.tsx'
import { useAuthStore } from './store/authStore.ts'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Única llamada a la API dentro de un useEffect: confirma la sesión al montar.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
