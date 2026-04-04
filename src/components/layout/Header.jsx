import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { CircleUserRound, IceCreamCone, LogOut, Moon, ShoppingCart, Sun, UserPen, UtensilsCrossed, UserCircle } from 'lucide-react'
import PointsBadge from '@/components/loyalty/PointsBadge'

export default function Header() {
  const { isAuthenticated, isGuest, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-4">
        <Link to="/" className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
          <IceCreamCone className="h-5 w-5 shrink-0" />
          <span className="text-base sm:text-lg">
            <span className="sm:hidden">Ainara</span>
            <span className="hidden sm:inline">Ainara Helados</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/menu">
            <Button variant="ghost" size="icon" className="sm:w-auto sm:px-3">
              <UtensilsCrossed className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Menú</span>
            </Button>
          </Link>

          {isAuthenticated && !isGuest && (
            <Link to="/addresses" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                <UserPen className="mr-1 h-4 w-4" />
                Mis datos
              </Button>
            </Link>
          )}

          <div className="hidden sm:block">
            <PointsBadge />
          </div>

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Carrito">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated ? (
            <>
              {!isGuest && (
                <Link to="/panel" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="gap-1.5 font-semibold">
                    <UserCircle className="h-4 w-4" />
                    {user?.name || 'Mi cuenta'}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" className="bg-green-200/70 text-green-700 hover:bg-green-200 hover:text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 dark:hover:text-green-300 sm:w-auto sm:px-3">
                <CircleUserRound className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Ingresar</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
