import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AddressProvider } from '@/context/AddressContext'
import { CartProvider } from '@/context/CartContext'
import { LoyaltyProvider } from '@/context/LoyaltyContext'
import AppLayout from '@/components/layout/AppLayout'
import GuestRoute from '@/components/auth/GuestRoute'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RecoverPage from '@/pages/RecoverPage'
import GuestPage from '@/pages/GuestPage'
import AddressesPage from '@/pages/AddressesPage'
import CatalogPage from '@/pages/CatalogPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AddressProvider>
          <CartProvider>
            <LoyaltyProvider>
            <BrowserRouter>
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
                  <Route path="/guest" element={<GuestRoute><GuestPage /></GuestRoute>} />
                  <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                </Route>
              </Routes>
            </BrowserRouter>
            </LoyaltyProvider>
          </CartProvider>
        </AddressProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
