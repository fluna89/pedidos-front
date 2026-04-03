import { useState, useEffect } from 'react'
import { adminGetStoreHours, adminUpdateStoreHours, adminToggleEmergency } from '@/services/handlers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Clock,
  AlertTriangle,
  Save,
  Loader2,
  Power,
  PowerOff,
  Plus,
  Trash2,
} from 'lucide-react'

const DOW_ORDER = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
const DOW_NAMES = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miércoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sábado',
  dom: 'Domingo',
}

function migrateSchedule(schedule) {
  const out = {}
  for (const day of DOW_ORDER) {
    const entry = schedule?.[day] || { ranges: [{ open: '16:00', close: '23:00' }], active: true }
    if (entry.ranges) {
      out[day] = entry
    } else {
      out[day] = {
        ranges: [{ open: entry.open || '16:00', close: entry.close || '23:00' }],
        active: entry.active !== false,
      }
    }
  }
  return out
}

export default function AdminHorariosPage() {
  const [schedule, setSchedule] = useState(null)
  const [closedMessage, setClosedMessage] = useState('')
  const [emergencyShutdown, setEmergencyShutdown] = useState(false)
  const [emergencyMessage, setEmergencyMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingEmergency, setTogglingEmergency] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      setLoading(true)
      const data = await adminGetStoreHours()
      setSchedule(migrateSchedule(data.schedule))
      setClosedMessage(data.closedMessage || '')
      setEmergencyShutdown(data.emergencyShutdown || false)
      setEmergencyMessage(data.emergencyMessage || '')
    } catch {
      setError('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  function toggleDay(day) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }))
  }

  function updateRange(day, rangeIdx, field, value) {
    setSchedule((prev) => {
      const ranges = [...prev[day].ranges]
      ranges[rangeIdx] = { ...ranges[rangeIdx], [field]: value }
      return { ...prev, [day]: { ...prev[day], ranges } }
    })
  }

  function addRange(day) {
    setSchedule((prev) => {
      const ranges = [...prev[day].ranges, { open: '09:00', close: '13:00' }]
      return { ...prev, [day]: { ...prev[day], ranges } }
    })
  }

  function removeRange(day, rangeIdx) {
    setSchedule((prev) => {
      const ranges = prev[day].ranges.filter((_, i) => i !== rangeIdx)
      return { ...prev, [day]: { ...prev[day], ranges } }
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await adminUpdateStoreHours({ schedule, closedMessage, emergencyMessage })
      setSuccess('Horarios guardados correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleEmergency() {
    const newValue = !emergencyShutdown
    setTogglingEmergency(true)
    setError('')
    setSuccess('')
    try {
      await adminToggleEmergency(newValue, emergencyMessage)
      setEmergencyShutdown(newValue)
      setSuccess(newValue ? 'Cierre de emergencia ACTIVADO' : 'Local REABIERTO')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al cambiar estado')
    } finally {
      setTogglingEmergency(false)
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
      <h1 className="text-2xl font-bold">Horarios y estado del local</h1>

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

      {/* Emergency shutdown */}
      <Card
        className={cn(
          'border-2',
          emergencyShutdown
            ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
            : 'border-gray-200 dark:border-gray-700',
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle
              className={cn('h-5 w-5', emergencyShutdown ? 'text-red-500' : 'text-gray-400')}
            />
            Cierre de emergencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {emergencyShutdown
              ? 'El local está CERRADO. No se aceptan nuevos pedidos.'
              : 'Activar para cerrar el local inmediatamente.'}
          </p>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="emergencyMessage">Mensaje de cierre</Label>
              <Input
                id="emergencyMessage"
                value={emergencyMessage}
                onChange={(e) => setEmergencyMessage(e.target.value)}
                placeholder="Ej: Cerrado por corte de luz"
              />
            </div>
            <Button
              variant={emergencyShutdown ? 'default' : 'destructive'}
              className={cn(
                'shrink-0',
                emergencyShutdown && 'bg-green-600 hover:bg-green-700 text-white',
              )}
              onClick={handleToggleEmergency}
              disabled={togglingEmergency}
            >
              {togglingEmergency ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : emergencyShutdown ? (
                <Power className="mr-2 h-4 w-4" />
              ) : (
                <PowerOff className="mr-2 h-4 w-4" />
              )}
              {emergencyShutdown ? 'Reabrir local' : 'Cerrar local ahora'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business hours — desktop table layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de atención
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="pb-2 pr-4 font-medium">Día</th>
                <th className="pb-2 pr-4 font-medium">Activo</th>
                <th className="pb-2 font-medium">Rangos horarios</th>
              </tr>
            </thead>
            <tbody>
              {DOW_ORDER.map((day) => {
                const cfg = schedule?.[day] || { ranges: [{ open: '16:00', close: '23:00' }], active: true }
                return (
                  <tr
                    key={day}
                    className={cn(
                      'border-b last:border-0',
                      cfg.active
                        ? 'bg-green-50/50 dark:bg-green-950/10'
                        : 'bg-gray-50/50 dark:bg-gray-900/30',
                    )}
                  >
                    <td className="py-3 pr-4 text-sm font-medium">{DOW_NAMES[day]}</td>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={cn(
                          'h-5 w-9 rounded-full transition-colors relative',
                          cfg.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
                            cfg.active ? 'left-4.5' : 'left-0.5',
                          )}
                        />
                      </button>
                    </td>
                    <td className="py-3">
                      {cfg.active ? (
                        <div className="flex flex-col gap-2">
                          {cfg.ranges.map((range, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={range.open}
                                onChange={(e) => updateRange(day, idx, 'open', e.target.value)}
                                className="w-32"
                              />
                              <span className="text-sm text-gray-400">a</span>
                              <Input
                                type="time"
                                value={range.close}
                                onChange={(e) => updateRange(day, idx, 'close', e.target.value)}
                                className="w-32"
                              />
                              {cfg.ranges.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRange(day, idx)}
                                  className="text-red-400 hover:text-red-600 p-1"
                                  title="Eliminar rango"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addRange(day)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 w-fit"
                          >
                            <Plus className="h-3 w-3" />
                            Agregar rango
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Cerrado</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Closed message */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="closedMessage">Mensaje cuando el local está cerrado</Label>
            <Textarea
              id="closedMessage"
              value={closedMessage}
              onChange={(e) => setClosedMessage(e.target.value)}
              placeholder="Ej: Estamos cerrados. ¡Te esperamos pronto!"
              rows={2}
            />
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar horarios
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
