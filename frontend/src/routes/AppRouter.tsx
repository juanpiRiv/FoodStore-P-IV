import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage.tsx'
import { RegisterPage } from '../features/auth/pages/RegisterPage.tsx'
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage.tsx'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage.tsx'
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage.tsx'
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage.tsx'
import { CarritoPage } from '../features/pedidos/pages/CarritoPage.tsx'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage.tsx'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage.tsx'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage.tsx'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage.tsx'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage.tsx'
import { MainLayout } from '../shared/layout/MainLayout.tsx'
import { ProtectedRoute } from './ProtectedRoute.tsx'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
