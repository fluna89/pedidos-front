import { useState, useEffect } from 'react'
import { getUserOrders } from '@/services/handlers'
import { orderStatusLabels } from '@/services/handlers'
import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Loader2, ClipboardList, Truck, Store, ChevronDown, ChevronUp } from 'lucide-react'

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const isDelivery = order.orderType === 'delivery'
  // Customer label mapping: pendiente → "Confirmado", confirmado → "En preparación"
  const customerLabels = { pendiente: 'Confirmado', confirmado: 'En preparación' }
  const statusLabel = customerLabels[order.status] || orderStatusLabels[order.status] || order.status

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        className="w-full px-4 py-3 text-left"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">#{order.id}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {statusLabel}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {new Date(order.createdAt).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-0.5">
                {isDelivery ? (
                  <Truck className="h-3 w-3" />
                ) : (
                  <Store className="h-3 w-3" />
                )}
                {isDelivery ? 'Delivery' : 'Retiro'}
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                ${order.total.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <CardContent className="space-y-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          {/* Items */}
          <div className="space-y-1 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}{' '}
                  <span className="text-gray-500 dark:text-gray-400">
                    ({item.format}
                    {item.flavors && ` · ${item.flavors}`})
                  </span>
                </span>
                <span className="font-medium">
                  ${(item.unitPrice * item.quantity).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-1 border-t border-gray-200 pt-2 text-xs dark:border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Subtotal
              </span>
              <span>${order.subtotal.toLocaleString('es-AR')}</span>
            </div>
            {order.pointsRedeemed > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>Puntos canjeados</span>
                <span>-${order.pointsRedeemed.toLocaleString('es-AR')}</span>
              </div>
            )}
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-purple-600 dark:text-purple-400">
                <span>Cupón ({order.coupon})</span>
                <span>-${order.couponDiscount.toLocaleString('es-AR')}</span>
              </div>
            )}
            {order.deliveryCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Envío</span>
                <span>${order.deliveryCost.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>${order.total.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Extra info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Pago: {order.paymentMethod}</span>
            {isDelivery && order.address && (
              <span>
                Dirección: {order.address.alias || order.address.street}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function OrderHistorySection() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(undefined)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    getUserOrders(user.id).then((result) => {
      if (!cancelled) setOrders(result)
    })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  if (orders === undefined) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-400 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando historial...
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-md bg-gray-50 px-4 py-6 text-center dark:bg-gray-800">
        <ClipboardList className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todavía no hiciste ningún pedido
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
