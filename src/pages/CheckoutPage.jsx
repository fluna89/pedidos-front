import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useAddresses } from '@/hooks/useAddresses'
import { useLoyalty } from '@/hooks/useLoyalty'
import { calcDeliveryCost, createOrder, processPayment } from '@/mocks/handlers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  LogIn,
  User,
  ShoppingCart,
  ArrowLeft,
  MapPin,
  Truck,
  Store,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import CouponInput from '@/components/loyalty/CouponInput'
import RedeemPoints from '@/components/loyalty/RedeemPoints'
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector'

export default function CheckoutPage() {
  const { isAuthenticated, isGuest } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const { addresses, activeId, selectActive, activeAddress } = useAddresses()
  const { eligible: loyaltyEligible, earnAfterOrder, redeemPoints } = useLoyalty()
  const navigate = useNavigate()

  const [orderType, setOrderType] = useState('delivery') // 'delivery' | 'pickup'
  const [deliveryResult, setDeliveryResult] = useState(null)

  // Loyalty state
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState(null) // { coupon, discount }

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handlePaymentSelect = useCallback((method) => {
    setPaymentMethod(method)
  }, [])

  // Guest address fields
  const [guestAddress, setGuestAddress] = useState({
    street: '',
    city: '',
    lat: -34.6055,
    lng: -58.3888,
  })

  // Resolve delivery coordinates
  const deliveryLat =
    orderType === 'delivery'
      ? isGuest
        ? guestAddress.lat
        : activeAddress?.lat ?? null
      : null
  const deliveryLng =
    orderType === 'delivery'
      ? isGuest
        ? guestAddress.lng
        : activeAddress?.lng ?? null
      : null

  // Calculate delivery cost when coordinates change
  useEffect(() => {
    if (deliveryLat == null || deliveryLng == null) return

    let cancelled = false

    calcDeliveryCost(deliveryLat, deliveryLng).then((result) => {
      if (!cancelled) {
        setDeliveryResult({ ...result, lat: deliveryLat, lng: deliveryLng })
      }
    })

    return () => {
      cancelled = true
    }
  }, [deliveryLat, deliveryLng])

  // Derive loading & delivery info from result + current coordinates
  const resultFresh =
    deliveryResult &&
    deliveryResult.lat === deliveryLat &&
    deliveryResult.lng === deliveryLng
  const loadingCost =
    deliveryLat != null && deliveryLng != null && !resultFresh
  const deliveryInfo = resultFresh ? deliveryResult : null

  const showDeliveryInfo =
    orderType === 'delivery' && deliveryLat != null && deliveryLng != null

  const deliveryCost =
    showDeliveryInfo && deliveryInfo?.inCoverage ? deliveryInfo.cost : 0
  const couponDiscount = appliedCoupon?.discount ?? 0
  const totalDiscount = pointsToRedeem + couponDiscount
  const total = Math.max(0, subtotal - totalDiscount) + deliveryCost
  const outOfCoverage =
    orderType === 'delivery' && deliveryInfo && !deliveryInfo.inCoverage
  const noAddress =
    orderType === 'delivery' && !isGuest && addresses.length === 0
  const canSubmit =
    !outOfCoverage && !noAddress && paymentMethod && !submitting

  // ── Confirm order handler ──
  async function handleConfirmOrder() {
    if (!canSubmit) return
    setSubmitError('')
    setSubmitting(true)

    try {
      // 1. Redeem points if any
      if (pointsToRedeem > 0 && loyaltyEligible) {
        await redeemPoints(pointsToRedeem)
      }

      // 2. Create the order
      const order = await createOrder({
        items,
        orderType,
        subtotal,
        deliveryCost,
        pointsRedeemed: pointsToRedeem,
        coupon: appliedCoupon?.coupon?.code ?? null,
        couponDiscount,
        total,
        address:
          orderType === 'delivery'
            ? isGuest
              ? guestAddress
              : activeAddress
            : null,
        paymentMethodId: paymentMethod.id,
      })

      // 3. Process payment
      const payment = await processPayment(
        order.id,
        paymentMethod.id,
        total,
      )

      // 4. Earn points (registered users only, on subtotal excl. shipping)
      let pointsEarned = 0
      if (loyaltyEligible) {
        const earnResult = await earnAfterOrder(
          Math.max(0, subtotal - pointsToRedeem - couponDiscount),
          order.id,
        )
        pointsEarned = earnResult.earned
      }

      // 5. Clear cart & navigate to confirmation
      clearCart()
      navigate('/order-confirmation', {
        replace: true,
        state: { order, payment, pointsEarned },
      })
    } catch (err) {
      setSubmitError(err.message || 'Error al procesar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Empty cart ──
  if (items.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">
          Tu carrito está vacío
        </p>
        <Link to="/menu">
          <Button variant="outline">Ver menú</Button>
        </Link>
      </div>
    )
  }

  // ── Login gate ──
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center pt-8">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Para continuar, ingresá</CardTitle>
            <CardDescription>
              Necesitás una cuenta o ingresar como invitado para confirmar tu
              pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/login" state={{ from: '/checkout' }}>
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/register" state={{ from: '/checkout' }}>
              <Button variant="outline" className="w-full">
                Crear cuenta
              </Button>
            </Link>
            <Link to="/guest" state={{ from: '/checkout' }}>
              <Button variant="secondary" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Continuar como invitado
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/cart')}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver al carrito
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // ── Authenticated checkout ──
  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      {/* Order type toggle */}
      <div className="space-y-2">
        <Label>Tipo de pedido</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={cn(
              'flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
              orderType === 'delivery'
                ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500',
            )}
            onClick={() => setOrderType('delivery')}
          >
            <Truck className="h-4 w-4" />
            Delivery
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
              orderType === 'pickup'
                ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500',
            )}
            onClick={() => setOrderType('pickup')}
          >
            <Store className="h-4 w-4" />
            Retiro en local
          </button>
        </div>
      </div>

      {/* Address selection (delivery only) */}
      {orderType === 'delivery' && (
        <div className="space-y-3">
          <Label className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            Dirección de entrega
          </Label>

          {isGuest ? (
            /* Guest inline address */
            <Card>
              <CardContent className="space-y-3 pt-4">
                <div className="space-y-1">
                  <Label htmlFor="guest-street">Dirección</Label>
                  <Input
                    id="guest-street"
                    placeholder="Ej: Av. Corrientes 1234"
                    value={guestAddress.street}
                    onChange={(e) =>
                      setGuestAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="guest-city">Ciudad</Label>
                  <Input
                    id="guest-city"
                    placeholder="Ej: CABA"
                    value={guestAddress.city}
                    onChange={(e) =>
                      setGuestAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  En una versión futura se geolocalizará la dirección
                  automáticamente
                </p>
              </CardContent>
            </Card>
          ) : addresses.length === 0 ? (
            /* No addresses */
            <Card>
              <CardContent className="py-6 text-center">
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  No tenés direcciones guardadas
                </p>
                <Link to="/addresses">
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-1 h-4 w-4" />
                    Agregar dirección
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            /* Address list */
            <div className="grid gap-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  className={cn(
                    'rounded-md border px-4 py-3 text-left text-sm transition-colors',
                    activeId === addr.id
                      ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                      : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500',
                    !addr.inCoverage && 'opacity-60',
                  )}
                  onClick={() => selectActive(addr.id)}
                >
                  <span className="font-medium">{addr.alias || addr.street}</span>
                  {addr.alias && (
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      {addr.street}
                    </span>
                  )}
                  {!addr.inCoverage && (
                    <span className="ml-2 text-xs text-red-500">
                      Fuera de cobertura
                    </span>
                  )}
                </button>
              ))}
              <Link
                to="/addresses"
                className="text-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Gestionar direcciones
              </Link>
            </div>
          )}

          {/* Delivery cost info */}
          {loadingCost && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Calculando costo de envío...
            </p>
          )}
          {!loadingCost && deliveryInfo && deliveryInfo.inCoverage && (
            <div className="flex items-center justify-between rounded-md bg-green-50 px-4 py-2 text-sm dark:bg-green-950">
              <span className="text-green-700 dark:text-green-300">
                Envío ({deliveryInfo.zone.name} · {deliveryInfo.distanceKm} km)
              </span>
              <span className="font-medium text-green-800 dark:text-green-200">
                ${deliveryInfo.cost.toLocaleString('es-AR')}
              </span>
            </div>
          )}
          {outOfCoverage && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span className="text-red-700 dark:text-red-300">
                La dirección seleccionada está fuera de la zona de cobertura
                ({deliveryInfo.distanceKm} km). Podés elegir otra dirección o
                retirar en el local.
              </span>
            </div>
          )}
        </div>
      )}

      {orderType === 'pickup' && (
        <div className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Store className="mr-1 inline h-4 w-4" />
          Retirás tu pedido en el local. Sin costo de envío.
        </div>
      )}

      {/* Loyalty — Points & Coupons */}
      <div className="space-y-3">
        <Label>Descuentos</Label>
        {loyaltyEligible && (
          <RedeemPoints
            subtotal={subtotal}
            pointsToRedeem={pointsToRedeem}
            onChangePoints={setPointsToRedeem}
          />
        )}
        <CouponInput
          subtotal={subtotal}
          appliedCoupon={appliedCoupon}
          onApply={(result) => setAppliedCoupon(result)}
          onRemove={() => setAppliedCoupon(null)}
        />
      </div>

      {/* Payment method selection */}
      <PaymentMethodSelector
        orderType={orderType}
        selectedId={paymentMethod?.id ?? null}
        onSelect={handlePaymentSelect}
      />

      {/* Order summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen del pedido</CardTitle>
          <CardDescription>
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <div key={item.cartId} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}{' '}
                <span className="text-gray-500 dark:text-gray-400">
                  ({item.format.name}
                  {item.flavors.length > 0 &&
                    ' · ' + item.flavors.map((f) => f.name).join(', ')}
                  )
                </span>
              </span>
              <span className="font-medium">
                ${(item.unitPrice * item.quantity).toLocaleString('es-AR')}
              </span>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-AR')}</span>
            </div>
            {pointsToRedeem > 0 && (
              <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                <span>Puntos canjeados</span>
                <span>-${pointsToRedeem.toLocaleString('es-AR')}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-purple-600 dark:text-purple-400">
                <span>Cupón ({appliedCoupon.coupon.code})</span>
                <span>-${couponDiscount.toLocaleString('es-AR')}</span>
              </div>
            )}
            {orderType === 'delivery' && deliveryInfo?.inCoverage && (
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>${deliveryCost.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {submitError && (
            <div className="w-full rounded-md bg-red-50 px-4 py-2 text-center text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {submitError}
            </div>
          )}
          <Button
            className="w-full"
            disabled={!canSubmit}
            onClick={handleConfirmOrder}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              `Confirmar y pagar · $${total.toLocaleString('es-AR')}`
            )}
          </Button>
          {isGuest && (
            <div className="w-full rounded-md border border-gray-200 px-4 py-3 text-center dark:border-gray-700">
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                ¿Querés guardar tu pedido y acumular puntos?
              </p>
              <div className="flex gap-2">
                <Link to="/login" state={{ from: '/checkout' }} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <LogIn className="mr-1 h-3.5 w-3.5" />
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/register" state={{ from: '/checkout' }} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al carrito
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
