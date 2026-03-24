import { useState } from 'react'
import { validateCoupon } from '@/services/handlers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tag, X, Loader2 } from 'lucide-react'

/**
 * Input for entering a discount coupon code.
 * Props:
 *  - subtotal: number — current order subtotal (for validation)
 *  - appliedCoupon: object | null — currently applied coupon
 *  - onApply(couponResult) — called when a coupon is validated successfully
 *  - onRemove() — called when coupon is removed
 */
export default function CouponInput({ subtotal, appliedCoupon, onApply, onRemove }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    if (!code.trim()) return
    setError('')
    setLoading(true)
    try {
      const result = await validateCoupon(code, subtotal)
      onApply(result)
      setCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between rounded-md bg-purple-50 px-3 py-2 dark:bg-purple-950">
        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-purple-700 dark:text-purple-300">
            {appliedCoupon.coupon.code}
          </span>
          <span className="text-purple-600 dark:text-purple-400">
            — {appliedCoupon.coupon.description}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900"
          aria-label="Quitar cupón"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Input
          placeholder="Código de descuento"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="flex-1 uppercase"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleApply}
          disabled={loading || !code.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Aplicar'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
