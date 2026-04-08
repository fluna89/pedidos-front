import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAddresses } from '@/hooks/useAddresses'
import { updateUserProfile } from '@/services/handlers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import AddressForm from '@/components/addresses/AddressForm'
import AddressCard from '@/components/addresses/AddressCard'
import { Plus, Loader2, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

function PersonalDataSection() {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const hasChanges =
    name !== (user?.name || '') ||
    email !== (user?.email || '') ||
    phone !== (user?.phone || '')

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
    <Card>
      <form onSubmit={handleSave}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Datos personales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="account-name" className="flex items-center gap-1.5">
              Nombre
              {user?.name && (
                <span className="flex items-center gap-0.5 text-xs font-normal text-green-600 dark:text-green-400">
                  <Check className="h-3 w-3" /> Guardado
                </span>
              )}
            </Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="account-email" className="flex items-center gap-1.5">
              Email
              {user?.email && (
                <span className="flex items-center gap-0.5 text-xs font-normal text-green-600 dark:text-green-400">
                  <Check className="h-3 w-3" /> Guardado
                </span>
              )}
            </Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="account-phone" className="flex items-center gap-1.5">
              Teléfono
              {user?.phone && (
                <span className="flex items-center gap-0.5 text-xs font-normal text-green-600 dark:text-green-400">
                  <Check className="h-3 w-3" /> Guardado
                </span>
              )}
            </Label>
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
        <CardFooter className="flex items-center justify-between">
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
          <Link
            to="/recover"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cambiar contraseña
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function AddressesPage() {
  const {
    addresses,
    activeId,
    loading,
    addAddress,
    editAddress,
    removeAddress,
    selectActive,
  } = useAddresses()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleAdd(data) {
    setSaving(true)
    try {
      await addAddress(data)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(data) {
    setSaving(true)
    try {
      await editAddress(editing.id, data)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta dirección?')) return
    await removeAddress(id)
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        Cargando...
      </div>
    )
  }

  // Show form to add or edit
  if (showForm) {
    return (
      <div className="flex justify-center pt-4">
        <AddressForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          loading={saving}
        />
      </div>
    )
  }

  if (editing) {
    return (
      <div className="flex justify-center pt-4">
        <AddressForm
          initial={editing}
          onSubmit={handleEdit}
          onCancel={() => setEditing(null)}
          loading={saving}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Mis datos</h1>

      <PersonalDataSection />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mis direcciones</h2>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>

        {addresses.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            No tenés direcciones guardadas. ¡Agregá una!
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                isActive={addr.id === activeId}
                onSelect={selectActive}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
