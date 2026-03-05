import { useState, useEffect } from 'react'
import { getActiveOrders } from '@/mocks/handlers'
import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Loader2, Package, Truck, Store, Clock } from 'lucide-react'

// Status progress steps for delivery / pickup
const deliverySteps = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'listo',
  'en_camino',
  'entregado',
]
const pickupSteps = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'listo',
  'entregado',
]

// Short labels for the compact progress bar (avoid layout overflow)
const shortLabels = {
  pendiente: 'Pend.',
  confirmado: 'Conf.',
  en_preparacion: 'Prep.',
  listo: 'Listo',
  en_camino: 'Envío',
  entregado: 'Entreg.',
}

function StatusProgress({ status, orderType }) {
  const steps = orderType === 'pickup' ? pickupSteps : deliverySteps
  const currentIdx = steps.indexOf(status)

  return (
    <div className="flex items-start gap-1">
      {steps.map((step, i) => {
        const done = i <= currentIdx
        return (
          <div key={step} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className={
                done
                  ? 'h-2 w-full rounded-full bg-green-500'
                  : 'h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'
              }
            />
            <span
              className={`w-full text-center text-[10px] leading-tight ${
                done
                  ? 'font-medium text-green-700 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {shortLabels[step] || step}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ActiveOrderSection() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(undefined) // undefined = loading
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    function fetchOrders() {
      getActiveOrders(user.id)
        .then((result) => {
          if (!cancelled) setOrders(result)
        })
        .catch((err) => {
          if (!cancelled) setError(err.message)
        })
    }

    fetchOrders()

    // Poll every 10 s so simulated status progression is visible
    const interval = setInterval(fetchOrders, 10_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user?.id])

  if (orders === undefined) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-400 dark:text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando pedidos activos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md bg-gray-50 px-4 py-6 text-center dark:bg-gray-800">
        <Package className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tenés pedidos activos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

function OrderCard({ order }) {
  const isDelivery = order.orderType === 'delivery'
  const isPendingPayment = order.paymentStatus === 'pendiente_pago'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pedido #{order.id}</CardTitle>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
            {isDelivery ? (
              <Truck className="h-3 w-3" />
            ) : (
              <Store className="h-3 w-3" />
            )}
            {isDelivery ? 'Delivery' : 'Retiro'}
          </span>
        </div>
        <CardDescription>
          {new Date(order.createdAt).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {isDelivery &&
            order.address &&
            ` · ${order.address.alias || order.address.street}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending payment notice */}
        {isPendingPayment && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            Pendiente de pago — el pedido avanzará cuando se confirme el pago
          </div>
        )}

        {/* Status progress bar */}
        <StatusProgress status={order.status} orderType={order.orderType} />

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

        {/* Total */}
        <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold dark:border-gray-700">
          <span>Total</span>
          <span>${order.total.toLocaleString('es-AR')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
