import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

const EMPTY = {
  alias: '',
  street: '',
  floor: '',
  apartment: '',
  neighborhood: '',
  city: '',
  comment: '',
}

function buildInitial(initial) {
  return initial ? { ...EMPTY, ...initial } : EMPTY
}

export default function AddressForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(() => buildInitial(initial))
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.street.trim()) {
      setError('La dirección es obligatoria')
      return
    }

    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message)
    }
  }

  const isEdit = !!initial

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {isEdit ? 'Editar dirección' : 'Nueva dirección'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              name="alias"
              placeholder="Ej: Casa, Trabajo"
              value={form.alias}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Dirección *</Label>
            <Input
              id="street"
              name="street"
              placeholder="Av. Corrientes 1234"
              value={form.street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="floor">Piso</Label>
              <Input
                id="floor"
                name="floor"
                placeholder="3"
                value={form.floor}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment">Depto</Label>
              <Input
                id="apartment"
                name="apartment"
                placeholder="B"
                value={form.apartment}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Barrio</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              placeholder="San Nicolás"
              value={form.neighborhood}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              placeholder="CABA"
              value={form.city}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Timbre, referencias..."
              value={form.comment}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Guardar' : 'Agregar'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
