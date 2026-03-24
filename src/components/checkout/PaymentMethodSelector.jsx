import { useState, useEffect } from 'react'
import { getPaymentMethods } from '@/services/handlers'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Loader2, Copy, Check } from 'lucide-react'

/**
 * Payment method selector for checkout.
 * Props:
 *  - orderType: 'delivery' | 'pickup'
 *  - selectedId: string | null — id of currently selected method
 *  - onSelect(method) — called when a method is chosen
 */
export default function PaymentMethodSelector({
  selectedId,
  onSelect,
}) {
  const [methods, setMethods] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  useEffect(() => {
    let cancelled = false
    getPaymentMethods().then((result) => {
      if (!cancelled) {
        setMethods(result)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const loading = !loaded

  // Reset selection when order type changes and current method is no longer available
  useEffect(() => {
    if (!loading && selectedId) {
      const stillAvailable = methods.some((m) => m.id === selectedId)
      if (!stillAvailable) onSelect(null)
    }
  }, [methods, loading, selectedId, onSelect])

  async function handleCopy(text, fieldName) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // clipboard API might not be available
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-400 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando medios de pago...
      </div>
    )
  }

  const selected = methods.find((m) => m.id === selectedId)

  return (
    <div className="space-y-3">
      <Label>Medio de pago</Label>
      <div className="grid gap-2">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            className={cn(
              'flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors',
              selectedId === method.id
                ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500',
            )}
            onClick={() => onSelect(method)}
          >
            <span className="text-xl">{method.icon}</span>
            <div className="min-w-0 flex-1">
              <span className="font-medium">{method.name}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {method.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Bank transfer details */}
      {selected?.id === 'transfer' && selected.bankInfo && (
        <div className="rounded-md bg-blue-50 p-4 text-sm dark:bg-blue-950">
          <p className="mb-2 font-medium text-blue-800 dark:text-blue-200">
            Datos para la transferencia
          </p>
          <dl className="space-y-1.5 text-blue-700 dark:text-blue-300">
            {[
              { label: 'Banco', value: selected.bankInfo.bank, key: 'bank' },
              { label: 'CBU', value: selected.bankInfo.cbu, key: 'cbu' },
              {
                label: 'Alias',
                value: selected.bankInfo.alias,
                key: 'alias',
              },
              {
                label: 'Titular',
                value: selected.bankInfo.holder,
                key: 'holder',
              },
              { label: 'CUIT', value: selected.bankInfo.cuit, key: 'cuit' },
            ].map(({ label, value, key }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <dt className="text-xs text-blue-500 dark:text-blue-400">
                    {label}
                  </dt>
                  <dd className="font-mono">{value}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(value, key)}
                  className="rounded p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
                  aria-label={`Copiar ${label}`}
                >
                  {copiedField === key ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-blue-500 dark:text-blue-400">
            Enviá el comprobante por WhatsApp para agilizar la confirmación
          </p>
        </div>
      )}

      {/* Cash note */}
      {selected?.id === 'cash' && (
        <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          💵 Tené el monto exacto preparado. El pedido queda pendiente hasta
          confirmar el cobro.
        </div>
      )}
    </div>
  )
}
