import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, User } from 'lucide-react'
import ActiveOrderSection from '@/components/panel/ActiveOrderSection'

export default function HomePage() {
  const { isAuthenticated, isGuest, user } = useAuth()

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      {/* Guest status banner */}
      {isAuthenticated && isGuest && (
        <div className="w-full max-w-md rounded-md bg-blue-50 px-4 py-3 text-left text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <User className="mr-1 inline h-4 w-4" />
          Estás navegando como <span className="font-semibold">{user?.name || 'invitado'}</span>.{' '}
          <Link to="/register" className="font-medium underline hover:text-blue-900 dark:hover:text-blue-100">
            Creá una cuenta
          </Link>{' '}
          para ver el estado de tus pedidos, acumular puntos y guardar direcciones.
        </div>
      )}

      {/* Active order (visible for registered users) */}
      {isAuthenticated && !isGuest && (
        <div className="w-full max-w-md text-left">
          <ActiveOrderSection />
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Bienvenido a Ainara Helados
      </h1>
      <p className="max-w-md text-gray-500 dark:text-gray-400">
        Helado artesanal para delivery o retiro en local. Explorá nuestros
        sabores y armá tu pedido.
      </p>
      <Link to="/menu">
        <Button size="lg">
          <UtensilsCrossed className="mr-2 h-5 w-5" />
          Ver menú
        </Button>
      </Link>
    </div>
  )
}
