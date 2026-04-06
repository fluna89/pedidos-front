import { useState, useEffect, useRef } from 'react'
import {
  getCounterMenu,
  getCategories,
  getFlavors,
  adminSearchUsers,
  adminCreateOrder,
  validateCoupon,
  getPaymentMethods,
} from '@/services/handlers'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  User,
  UserCheck,
  X,
  Plus,
  Minus,
  Trash2,
  Store,
  Truck,
  ShoppingCart,
  HandCoins,
  Tag,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ComboWizard from '@/components/catalog/ComboWizard'

const fmt = (n) => `$${n.toLocaleString('es-AR')}`

// ═══════════════════════════════════════════════════════
// Product picker dialog (reuses flavor/extra/format selection)
// ═══════════════════════════════════════════════════════
function ProductPickerDialog({ product, onAdd, onClose }) {
  const [selectedFormat, setSelectedFormat] = useState(product?.formats?.[0] || null)
  const [selectedExtras, setSelectedExtras] = useState([])
  const [selectedFlavors, setSelectedFlavors] = useState([])
  const [flavorsAvailable, setFlavorsAvailable] = useState([])
  const [comment, setComment] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!product?.hasFlavors) return
    const source = product.flavorsSource || 'default'
    getFlavors(source).then(setFlavorsAvailable)
  }, [product])

  if (!product) return null

  const format = selectedFormat || product.formats[0]
  const unitCount = format?.unitCount || 0
  const isUnitPricing = product.unitPricing

  const totalFlavorQty = selectedFlavors.reduce((sum, f) => sum + (f.quantity || 1), 0)
  const canAddFlavor = unitCount === 0 || totalFlavorQty < unitCount

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + (e.price || 0), 0)
  let unitPrice
  if (isUnitPricing) {
    unitPrice = selectedFlavors.reduce((sum, f) => sum + (f.price || 0) * (f.quantity || 1), 0) + extrasTotal
  } else {
    unitPrice = (format?.price || 0) + extrasTotal
  }

  const needsFlavors = product.hasFlavors && unitCount > 0
  const canConfirm = !needsFlavors || totalFlavorQty > 0

  function toggleExtra(extra) {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id) ? prev.filter((e) => e.id !== extra.id) : [...prev, extra],
    )
  }

  function toggleFlavor(flavor) {
    setSelectedFlavors((prev) => {
      const existing = prev.find((f) => f.id === flavor.id)
      if (existing) return prev.filter((f) => f.id !== flavor.id)
      if (!canAddFlavor) return prev
      return [...prev, { ...flavor, quantity: 1 }]
    })
  }

  function setFlavorQty(flavorId, qty) {
    if (qty < 1) {
      setSelectedFlavors((prev) => prev.filter((f) => f.id !== flavorId))
      return
    }
    const otherTotal = selectedFlavors.filter((f) => f.id !== flavorId).reduce((s, f) => s + (f.quantity || 1), 0)
    if (unitCount > 0 && otherTotal + qty > unitCount) return
    setSelectedFlavors((prev) => prev.map((f) => (f.id === flavorId ? { ...f, quantity: qty } : f)))
  }

  function handleAdd() {
    onAdd({
      cartId: 'cart-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      productId: product.id,
      name: product.name,
      format,
      flavors: selectedFlavors,
      extras: selectedExtras,
      comment,
      quantity,
      unitPrice,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{product.image}</span>
            {product.name}
          </DialogTitle>
          {product.description && (
            <DialogDescription>{product.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Format selection */}
          {product.formats.length > 1 && (
            <div className="space-y-2">
              <Label>Formato</Label>
              <div className="grid gap-2">
                {product.formats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFormat(f)}
                    className={cn(
                      'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      format?.id === f.id
                        ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                        : 'border-gray-200 hover:border-gray-400 dark:border-gray-700',
                    )}
                  >
                    <span className="font-medium">{f.name}</span>
                    {f.price > 0 && <span className="ml-2 text-gray-500">{fmt(f.price)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flavor selection */}
          {product.hasFlavors && flavorsAvailable.length > 0 && (
            <div className="space-y-2">
              <Label>
                {product.flavorsSource === 'empanadas' ? 'Gustos' : 'Sabores'}
                {unitCount > 0 && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({totalFlavorQty}/{unitCount})
                  </span>
                )}
              </Label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {flavorsAvailable.filter((f) => !f.paused).map((fl) => {
                  const selected = selectedFlavors.find((f) => f.id === fl.id)
                  return (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() => toggleFlavor(fl)}
                      disabled={!selected && !canAddFlavor}
                      className={cn(
                        'rounded-md border px-2 py-1.5 text-xs transition-colors',
                        selected
                          ? 'border-gray-900 bg-gray-100 font-medium dark:border-gray-100 dark:bg-gray-800'
                          : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 disabled:opacity-40',
                      )}
                    >
                      {fl.image && <span className="mr-1">{fl.image}</span>}
                      {fl.name}
                      {fl.price > 0 && <span className="ml-1 text-gray-500">{fmt(fl.price)}</span>}
                    </button>
                  )
                })}
              </div>

              {/* Flavor quantities */}
              {selectedFlavors.length > 0 && unitCount > 1 && (
                <div className="space-y-1 rounded-md border border-gray-200 p-2 dark:border-gray-700">
                  {selectedFlavors.map((fl) => (
                    <div key={fl.id} className="flex items-center justify-between text-sm">
                      <span>{fl.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setFlavorQty(fl.id, (fl.quantity || 1) - 1)}
                          className="rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center">{fl.quantity || 1}</span>
                        <button
                          type="button"
                          onClick={() => setFlavorQty(fl.id, (fl.quantity || 1) + 1)}
                          disabled={totalFlavorQty >= unitCount}
                          className="rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Extras */}
          {product.extras?.length > 0 && (
            <div className="space-y-2">
              <Label>Extras</Label>
              <div className="space-y-1.5">
                {product.extras.map((extra) => {
                  const sel = selectedExtras.find((e) => e.id === extra.id)
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors',
                        sel
                          ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                          : 'border-gray-200 hover:border-gray-400 dark:border-gray-700',
                      )}
                    >
                      <span>{extra.name}</span>
                      <span className="text-gray-500">+{fmt(extra.price)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-1">
            <Label>Comentario (opcional)</Label>
            <Textarea
              placeholder="Ej: sin crema, agregar servilletas..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <Label>Cantidad</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="sm" onClick={() => setQuantity((q) => q + 1)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={!canConfirm}>
            Agregar · {fmt(unitPrice * quantity)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════
// Combo picker dialog — wraps existing ComboWizard
// ═══════════════════════════════════════════════════════
function ComboPickerDialog({ combo, onAdd, onClose }) {
  function handleComboAdd({ comboSteps, unitPrice }) {
    onAdd({
      cartId: 'cart-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      productId: combo.id,
      name: combo.name,
      format: { id: combo.formats?.[0]?.id || combo.id, name: combo.name, price: unitPrice },
      flavors: [],
      extras: [],
      comboSteps,
      comment: '',
      quantity: 1,
      unitPrice,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <ComboWizard combo={combo} onAdd={handleComboAdd} />
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════
export default function AdminCargarPedidoPage() {
  // ── Data loading ──
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Customer ──
  const [customerQuery, setCustomerQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [linkedUser, setLinkedUser] = useState(null) // { id, name, email }
  const [customerName, setCustomerName] = useState('')

  // ── Order type ──
  const [orderType, setOrderType] = useState('mostrador')

  // ── Address (delivery) ──
  const [address, setAddress] = useState({
    street: '',
    floor: '',
    apartment: '',
    city: '',
    comment: '',
  })

  // ── Cart ──
  const [cartItems, setCartItems] = useState([])
  const [pickingProduct, setPickingProduct] = useState(null) // product for dialog
  const [pickingCombo, setPickingCombo] = useState(null)

  // ── Coupon ──
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // ── Payment ──
  const [selectedPayment, setSelectedPayment] = useState(null)

  // ── Delivery cost (manual for admin, not distance-based) ──
  const [deliveryCost, setDeliveryCost] = useState(0)

  // ── Submit ──
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null) // order result

  // ── Catalog collapsed sections ──
  const [collapsedCats, setCollapsedCats] = useState(new Set())

  // Search debounce ref
  const searchTimeout = useRef(null)

  // ── Load initial data ──
  // TODO: Add periodic polling (or WebSocket) to keep menu/prices in sync
  //       when another admin edits products while this page is open.
  useEffect(() => {
    Promise.all([getCounterMenu(), getCategories(), getPaymentMethods()]).then(
      ([items, cats, methods]) => {
        setMenuItems(items)
        setCategories(cats)
        setPaymentMethods(methods)
        setLoading(false)
      },
    )
  }, [])

  // ── User search with debounce ──
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!customerQuery || customerQuery.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      const results = await adminSearchUsers(customerQuery)
      setSearchResults(results)
      setSearching(false)
    }, 300)
    return () => clearTimeout(searchTimeout.current)
  }, [customerQuery])

  function linkUser(user) {
    setLinkedUser(user)
    setCustomerName(user.name)
    setCustomerQuery('')
    setSearchResults([])
  }

  function unlinkUser() {
    setLinkedUser(null)
  }

  // ── Cart operations ──
  function addToCart(item) {
    setCartItems((prev) => [...prev, item])
  }

  function removeFromCart(cartId) {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId))
  }

  function updateCartQty(cartId, qty) {
    if (qty < 1) return removeFromCart(cartId)
    setCartItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, quantity: qty } : i)))
  }

  // ── Computed totals ──
  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const couponDiscount = appliedCoupon?.discount ?? 0
  const total = Math.max(0, subtotal - couponDiscount) + (orderType === 'delivery' ? deliveryCost : 0)

  // ── Coupon ──
  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponError('')
    setCouponLoading(true)
    try {
      const result = await validateCoupon(couponCode, subtotal)
      setAppliedCoupon(result)
      setCouponCode('')
    } catch (err) {
      setCouponError(err.message)
    } finally {
      setCouponLoading(false)
    }
  }

  // ── Submit order ──
  const canSubmit =
    cartItems.length > 0 &&
    selectedPayment &&
    (customerName.trim() || linkedUser) &&
    (orderType !== 'delivery' || address.street.trim()) &&
    !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)

    try {
      const order = await adminCreateOrder({
        userId: linkedUser?.id ?? null,
        customerName: customerName.trim() || linkedUser?.name || 'Mostrador',
        items: cartItems,
        orderType,
        subtotal,
        deliveryCost: orderType === 'delivery' ? deliveryCost : 0,
        coupon: appliedCoupon?.coupon?.code ?? null,
        couponDiscount,
        total,
        address: orderType === 'delivery' ? address : null,
        paymentMethodId: selectedPayment.id,
      })

      setSubmitted(order)
    } catch {
      // Error handling would go here
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setCartItems([])
    setLinkedUser(null)
    setCustomerName('')
    setCustomerQuery('')
    setOrderType('mostrador')
    setAddress({ street: '', floor: '', apartment: '', city: '', comment: '' })
    setAppliedCoupon(null)
    setCouponCode('')
    setSelectedPayment(null)
    setDeliveryCost(0)
    setSubmitted(null)
  }

  // ── Group menu items by category ──
  const visibleItems = orderType === 'mostrador'
    ? menuItems
    : menuItems.filter((p) => !p.counterOnly)
  const itemsByCategory = categories
    .map((cat) => ({
      ...cat,
      items: visibleItems.filter((p) => p.category === cat.id),
    }))
    .filter((cat) => cat.items.length > 0)

  function toggleCat(catId) {
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return next
    })
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando...
      </div>
    )
  }

  // ── Success state ──
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-bold">Pedido #{submitted.id} creado</h2>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>Cliente: {submitted.customerName}</p>
          <p>Total: {fmt(submitted.total)}</p>
          <p>Pago: {submitted.paymentMethod} — {submitted.paymentStatus === 'pagado' ? 'Pagado' : 'Pendiente de pago'}</p>
          {submitted.pointsEarned > 0 && (
            <p className="font-medium text-green-600 dark:text-green-400">
              +{submitted.pointsEarned.toLocaleString()} puntos acreditados
            </p>
          )}
          {submitted.userId && submitted.paymentStatus !== 'pagado' && (
            <p className="text-amber-600 dark:text-amber-400">
              Los puntos se acreditarán cuando se confirme el pago
            </p>
          )}
        </div>
        <Button onClick={handleReset}>Cargar otro pedido</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Cargar pedido</h1>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* ── Left column: Form ── */}
        <div className="space-y-6">
          {/* ── 1. Customer ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {linkedUser ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium">{linkedUser.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{linkedUser.email} — acumula puntos</p>
                    </div>
                  </div>
                  <button onClick={unlinkUser} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar usuario por nombre o email..."
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {/* Search results dropdown */}
                  {(searchResults.length > 0 || searching) && (
                    <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      {searching ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Buscando...
                        </div>
                      ) : (
                        searchResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => linkUser(u)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span className="font-medium">{u.name}</span>
                            <span className="text-gray-500">{u.email}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <Label>Nombre del cliente</Label>
                <Input
                  placeholder="Ej: María López"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── 2. Order type ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tipo de pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'mostrador', label: 'Mostrador', icon: HandCoins },
                  { value: 'pickup', label: 'Retiro en local', icon: Store },
                  { value: 'delivery', label: 'Delivery', icon: Truck },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOrderType(value)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                      orderType === value
                        ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                        : 'border-gray-200 hover:border-gray-400 dark:border-gray-700',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Address fields (delivery only) */}
              {orderType === 'delivery' && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="addr-street">Dirección</Label>
                    <Input
                      id="addr-street"
                      placeholder="Ej: Av. Corrientes 1234"
                      value={address.street}
                      onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="addr-floor">Piso (opcional)</Label>
                      <Input
                        id="addr-floor"
                        placeholder="3"
                        value={address.floor}
                        onChange={(e) => setAddress((p) => ({ ...p, floor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="addr-apt">Depto (opcional)</Label>
                      <Input
                        id="addr-apt"
                        placeholder="B"
                        value={address.apartment}
                        onChange={(e) => setAddress((p) => ({ ...p, apartment: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="addr-city">Ciudad</Label>
                    <Input
                      id="addr-city"
                      placeholder="CABA"
                      value={address.city}
                      onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="addr-comment">Indicaciones (opcional)</Label>
                    <Input
                      id="addr-comment"
                      placeholder="Ej: Timbre B, portón verde"
                      value={address.comment}
                      onChange={(e) => setAddress((p) => ({ ...p, comment: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="delivery-cost">Costo de envío</Label>
                    <Input
                      id="delivery-cost"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={deliveryCost || ''}
                      onChange={(e) => setDeliveryCost(Number(e.target.value) || 0)}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ingresá el costo de envío manualmente
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── 3. Product catalog ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itemsByCategory.map((cat) => {
                const isCollapsed = collapsedCats.has(cat.id)
                return (
                  <div key={cat.id}>
                    <button
                      type="button"
                      onClick={() => toggleCat(cat.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <span>
                        {cat.icon} {cat.name}
                        <span className="ml-1 text-xs text-gray-400">({cat.items.length})</span>
                      </span>
                      {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                    {!isCollapsed && (
                      <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
                        {cat.items.map((product) => {
                          const price = product.formats[0]?.price ?? 0
                          const cartQty = cartItems.filter((i) => i.productId === product.id).reduce((s, i) => s + i.quantity, 0)
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                if (product.isCombo) {
                                  setPickingCombo(product)
                                } else {
                                  setPickingProduct(product)
                                }
                              }}
                              className={cn(
                                'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:border-gray-400 dark:hover:border-gray-500',
                                cartQty > 0
                                  ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30'
                                  : 'border-gray-200 dark:border-gray-700',
                              )}
                            >
                              <span className="text-lg">{product.image}</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{product.name}</p>
                                <p className="text-xs text-gray-500">
                                  {product.isCombo
                                    ? product.comboPrice?.type === 'fixed' ? fmt(price) : 'Según selección'
                                    : price > 0 ? fmt(price) : 'Según selección'}
                                  {product.counterOnly && (
                                    <span className="ml-1 text-blue-500">· Mostrador</span>
                                  )}
                                </p>
                              </div>
                              {cartQty > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-xs font-bold text-white">
                                  {cartQty}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* ── 4. Coupon ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Cupón de descuento (opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appliedCoupon ? (
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
                  <button type="button" onClick={() => setAppliedCoupon(null)} className="rounded p-1 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código de descuento"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 uppercase"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── 5. Payment method ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Medio de pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                      selectedPayment?.id === method.id
                        ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                        : 'border-gray-200 hover:border-gray-400 dark:border-gray-700',
                    )}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: Summary ── */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                  Agregá productos para armar el pedido
                </p>
              ) : (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="flex items-start gap-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.format.name}
                          {item.flavors?.length > 0 && ' · ' + item.flavors.map((f) => f.quantity > 1 ? `${f.quantity} ${f.name}` : f.name).join(', ')}
                          {item.extras?.length > 0 && ' + ' + item.extras.map((e) => e.name).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateCartQty(item.cartId, item.quantity - 1)} className="rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.cartId, item.quantity + 1)} className="rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="shrink-0 text-sm font-medium">{fmt(item.unitPrice * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.cartId)} className="shrink-0 rounded p-0.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {cartItems.length > 0 && (
                <div className="space-y-1 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-purple-600 dark:text-purple-400">
                      <span>Cupón ({appliedCoupon.coupon.code})</span>
                      <span>-{fmt(couponDiscount)}</span>
                    </div>
                  )}
                  {orderType === 'delivery' && deliveryCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Envío</span>
                      <span>{fmt(deliveryCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 text-base font-bold">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
                  </div>
                </div>
              )}
            </CardContent>
            {cartItems.length > 0 && (
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando pedido...
                    </>
                  ) : (
                    `Crear pedido · ${fmt(total)}`
                  )}
                </Button>
                {!customerName.trim() && !linkedUser && (
                  <p className="text-xs text-amber-500">Falta el nombre del cliente</p>
                )}
                {orderType === 'delivery' && !address.street.trim() && (
                  <p className="text-xs text-amber-500">Falta la dirección de envío</p>
                )}
                {!selectedPayment && (
                  <p className="text-xs text-amber-500">Falta seleccionar medio de pago</p>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Product picker dialog */}
      {pickingProduct && (
        <ProductPickerDialog
          product={pickingProduct}
          onAdd={addToCart}
          onClose={() => setPickingProduct(null)}
        />
      )}

      {/* Combo picker dialog */}
      {pickingCombo && (
        <ComboPickerDialog
          combo={pickingCombo}
          onAdd={addToCart}
          onClose={() => setPickingCombo(null)}
        />
      )}
    </div>
  )
}
