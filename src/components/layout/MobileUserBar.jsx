import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLoyalty } from '@/hooks/useLoyalty'
import { MapPin, Star, UserCircle } from 'lucide-react'

/**
 * Thin contextual bar shown ONLY on mobile (< sm) for registered users.
 * Displays: panel link, points badge, and quick link to Addresses.
 * On sm+ this is hidden because Header already shows those elements.
 * Hidden for guests — guest status is shown on HomePage instead.
 */
export default function MobileUserBar() {
  const { isAuthenticated, isGuest, user } = useAuth()
  const { balance, eligible } = useLoyalty()

  // Only show for registered (non-guest) authenticated users
  if (!isAuthenticated || isGuest) return null

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5 sm:hidden dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Left: panel link */}
        <Link
          to="/panel"
          className="flex items-center gap-1.5 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:active:bg-gray-600"
        >
          <UserCircle className="h-3.5 w-3.5" />
          {user?.name || 'Mi cuenta'}
        </Link>

        {/* Right: points + addresses shortcut */}
        <div className="flex items-center gap-3">
          {eligible && balance > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-200">
              <Star className="h-3 w-3" />
              {balance.toLocaleString('es-AR')} pts
            </div>
          )}
          <Link
            to="/addresses"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <MapPin className="h-3 w-3" />
            Mis datos
          </Link>
        </div>
      </div>
    </div>
  )
}
