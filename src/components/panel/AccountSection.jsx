import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateUserProfile } from '@/services/handlers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Loader2, Check, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AccountSection() {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const hasChanges = name !== (user?.name || '') || email !== (user?.email || '') || phone !== (user?.phone || '')

  async function handleSave(e) {
    e.preventDefault()
    if (!hasChanges || saving) return
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const updated = await updateUserProfile(user.id, { name, email, phone })
      updateUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Profile form */}
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="account-name">Nombre</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="account-email">Email</Label>
              <Input
                id="account-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="account-phone">Teléfono</Label>
              <Input
                id="account-phone"
                type="tel"
                placeholder="11-2345-6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {success && (
              <p className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                Guardado correctamente
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!hasChanges || saving} size="sm">
              {saving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </CardFooter>
        </form>
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
            Gestionar direcciones
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
