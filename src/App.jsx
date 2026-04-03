import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { ThemeProvider } from '@/context/ThemeContext'
import { AddressProvider } from '@/context/AddressContext'
import { CartProvider } from '@/context/CartContext'
import { LoyaltyProvider } from '@/context/LoyaltyContext'
import { StoreStatusProvider } from '@/context/StoreStatusContext'
import AppLayout from '@/components/layout/AppLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import GuestRoute from '@/components/auth/GuestRoute'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RecoverPage from '@/pages/RecoverPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import GuestPage from '@/pages/GuestPage'
import AddressesPage from '@/pages/AddressesPage'
import CatalogPage from '@/pages/CatalogPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import UserPanelPage from '@/pages/UserPanelPage'
import AdminPedidosPage from '@/pages/admin/AdminPedidosPage'
import AdminProductosPage from '@/pages/admin/AdminProductosPage'
import AdminCombosPage from '@/pages/admin/AdminCombosPage'
import AdminListasPage from '@/pages/admin/AdminListasPage'
import AdminCargarPedidoPage from '@/pages/admin/AdminCargarPedidoPage'
import AdminHorariosPage from '@/pages/admin/AdminHorariosPage'
import AdminConfigPage from '@/pages/admin/AdminConfigPage'

function SessionExpiredRedirect() {
  const { sessionExpired } = useAuth()
  const navigate = useNavigate()

  if (sessionExpired) {
    navigate('/login', { replace: true })
  }

  return null
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreStatusProvider>
        <AddressProvider>
          <CartProvider>
            <LoyaltyProvider>
            <BrowserRouter>
              <SessionExpiredRedirect />
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<CatalogPage />} />
                  <Route path="/menu/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                  <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                  <Route path="/recover" element={<GuestRoute><RecoverPage /></GuestRoute>} />
                  <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
                  <Route path="/guest" element={<GuestRoute><GuestPage /></GuestRoute>} />
                  <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                  <Route path="/panel" element={<ProtectedRoute><UserPanelPage /></ProtectedRoute>} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<Navigate to="/admin/pedidos" replace />} />
                  <Route path="pedidos" element={<AdminPedidosPage />} />
                  <Route path="productos" element={<AdminProductosPage />} />
                  <Route path="combos" element={<AdminCombosPage />} />
                  <Route path="listas" element={<AdminListasPage />} />
                  <Route path="cargar-pedido" element={<AdminCargarPedidoPage />} />
                  <Route path="horarios" element={<AdminHorariosPage />} />
                  <Route path="config" element={<AdminConfigPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
            </LoyaltyProvider>
          </CartProvider>
        </AddressProvider>
        </StoreStatusProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
