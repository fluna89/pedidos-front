import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLoyalty } from '@/hooks/useLoyalty'
import { MapPin, Star, User } from 'lucide-react'

/**
 * Thin contextual bar shown ONLY on mobile (< sm) for authenticated users.
 * Displays: user greeting, points badge, and quick link to Addresses.
 * On sm+ this is hidden because Header already shows those elements.
 */
export default function MobileUserBar() {
  const { user, isAuthenticated, isGuest } = useAuth()
  const { balance, eligible } = useLoyalty()

  if (!isAuthenticated) return null

  const displayName = isGuest ? 'Invitado' : user?.name?.split(' ')[0] || 'Usuario'

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5 sm:hidden dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Left: user greeting */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <User className="h-3 w-3" />
          <span>Hola, <span className="font-medium text-gray-800 dark:text-gray-200">{displayName}</span></span>
        </div>

        {/* Right: points + addresses shortcut */}
        <div className="flex items-center gap-3">
          {eligible && balance > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-200">
              <Star className="h-3 w-3" />
              {balance.toLocaleString('es-AR')} pts
            </div>
          )}
          {!isGuest && (
            <Link
              to="/addresses"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <MapPin className="h-3 w-3" />
              Direcciones
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
