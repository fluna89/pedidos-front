import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AccountSection() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mi cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-gray-500 dark:text-gray-400">Nombre:</span> {user?.name}</p>
          <p><span className="text-gray-500 dark:text-gray-400">Email:</span> {user?.email}</p>
          {user?.phone && (
            <p><span className="text-gray-500 dark:text-gray-400">Teléfono:</span> {user.phone}</p>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            to="/addresses"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <LinkIcon className="h-4 w-4 text-gray-400" />
            Mis datos y direcciones
          </Link>
          <Link
            to="/recover"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <LinkIcon className="h-4 w-4 text-gray-400" />
            Cambiar contraseña
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
