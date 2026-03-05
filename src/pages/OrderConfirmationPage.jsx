import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { CheckCircle2, Clock, ShoppingBag, Home } from 'lucide-react'

/**
 * Order confirmation page.
 * Receives order + payment info via React Router location state.
 * Clears cart and earns points on mount.
 */
export default function OrderConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isGuest } = useAuth()

  const orderData = location.state?.order
  const paymentData = location.state?.payment
  const pointsEarned = location.state?.pointsEarned ?? 0

  // Redirect to home if no order data (e.g. manual navigation)
  useEffect(() => {
    if (!orderData) navigate('/', { replace: true })
  }, [orderData, navigate])

  if (!orderData) return null

  const isPending = paymentData?.status === 'pendiente_pago'

  return (
    <div className="mx-auto max-w-md pt-8">
      <Card>
        <CardHeader className="text-center">
          {isPending ? (
            <Clock className="mx-auto mb-2 h-12 w-12 text-amber-500" />
          ) : (
            <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-500" />
          )}
          <CardTitle className="text-xl">
            {isPending ? '¡Pedido registrado!' : '¡Pedido confirmado!'}
          </CardTitle>
          <CardDescription>
            {isPending
              ? 'Tu pedido queda pendiente hasta confirmar el pago'
              : 'Tu pago fue procesado correctamente'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order number */}
          <div className="rounded-md bg-gray-50 px-4 py-3 text-center dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Número de pedido
            </p>
            <p className="text-lg font-bold">#{orderData.id}</p>
          </div>

          {/* Payment info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Medio de pago
              </span>
              <span className="font-medium">{paymentData?.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total</span>
              <span className="font-medium">
                ${paymentData?.amount?.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Estado</span>
              <span
                className={
                  isPending
                    ? 'font-medium text-amber-600 dark:text-amber-400'
                    : 'font-medium text-green-600 dark:text-green-400'
                }
              >
                {isPending ? 'Pendiente de pago' : 'Pagado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Tipo de pedido
              </span>
              <span className="font-medium">
                {orderData.orderType === 'delivery'
                  ? 'Delivery'
                  : 'Retiro en local'}
              </span>
            </div>
          </div>

          {/* Payment message */}
          {paymentData?.message && (
            <div
              className={
                isPending
                  ? 'rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300'
              }
            >
              {paymentData.message}
            </div>
          )}

          {/* Points earned */}
          {pointsEarned > 0 && (
            <div className="rounded-md bg-amber-50 px-4 py-3 text-center text-sm dark:bg-amber-950">
              <span className="text-amber-700 dark:text-amber-300">
                🎉 Ganaste{' '}
                <span className="font-bold">
                  {pointsEarned.toLocaleString('es-AR')}
                </span>{' '}
                puntos con esta compra
              </span>
            </div>
          )}

          {/* Guest prompt */}
          {isGuest && (
            <div className="rounded-md border border-gray-200 px-4 py-3 text-center text-sm dark:border-gray-700">
              <p className="mb-1 text-gray-500 dark:text-gray-400">
                Creá una cuenta para acumular puntos en tus próximas compras
              </p>
              <Link to="/register">
                <Button variant="outline" size="sm">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Link to="/menu" className="w-full">
            <Button className="w-full">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Seguir comprando
            </Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="ghost" className="w-full" size="sm">
              <Home className="mr-1 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
