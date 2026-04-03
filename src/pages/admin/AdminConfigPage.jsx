import { useState, useEffect } from 'react'
import { adminGetStoreHours, adminUpdateStoreHours } from '@/services/handlers'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Save, Loader2, MessageSquare } from 'lucide-react'

export default function AdminConfigPage() {
  const [comandaMessage, setComandaMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      setLoading(true)
      const data = await adminGetStoreHours()
      setComandaMessage(data.comandaMessage || '')
    } catch {
      setError('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await adminUpdateStoreHours({ comandaMessage })
      setSuccess('Configuración guardada correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
          {success}
        </p>
      )}

      {/* Comanda message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensaje de comanda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Este mensaje se imprimirá en todas las comandas. Dejalo vacío para no incluir mensaje adicional.
          </p>
          <div className="space-y-2">
            <Label htmlFor="comandaMessage">Mensaje</Label>
            <Textarea
              id="comandaMessage"
              value={comandaMessage}
              onChange={(e) => setComandaMessage(e.target.value)}
              placeholder='Ej: "Felices Pascuas ❤️", "¡Gracias por tu compra!"'
              rows={3}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
