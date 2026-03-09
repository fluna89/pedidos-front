import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

const HIDDEN_PATHS = ['/cart', '/checkout', '/order-confirmation']

export default function FloatingCartBar() {
  const { itemCount, subtotal } = useCart()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (itemCount === 0) return null
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/cart')}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-green-600 px-4 py-3 text-white shadow-lg shadow-green-600/30 transition-all hover:bg-green-700 active:scale-[0.98] dark:bg-green-600 dark:shadow-green-900/40 dark:hover:bg-green-700 sm:px-6 sm:py-3.5"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-green-700">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            </div>
            <span className="text-sm font-semibold sm:text-base">Ver carrito</span>
          </div>
          <span className="text-sm font-bold sm:text-base">
            ${subtotal.toLocaleString('es-AR')}
          </span>
        </button>
      </div>
    </div>
  )
}
