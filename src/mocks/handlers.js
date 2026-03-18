// Mock API handlers - simulate network delay + backend responses
// Swap these for real api.js calls when backend is ready

import {
  mockMenu,
  mockCategories,
  mockFlavors,
  mockEmpanadaFlavors,
  mockGaseosaFlavors,
  mockAddresses,
  mockStoreLocation,
  mockMaxDeliveryKm,
  mockDeliveryZones,
  mockPointsHistory,
  mockCoupons,
  mockPaymentMethods,
  mockOrders,
  orderStatusLabels,
} from './data'

const MOCK_DELAY = 300 // ms

// ── In-memory order store (session persistence) ───────────────────
// Starts with mockOrders from data.js, new orders are appended at runtime.
const orders = [...mockOrders]

// ── In-memory product store ───────────────────────────────────────
const products = [...mockMenu]
let nextProductId =
  Math.max(...products.map((p) => p.id)) + 1

// ── In-memory flavor stores ──────────────────────────────────────
const flavorStores = {
  default: mockFlavors.map((f) => ({ ...f })),
  empanadas: mockEmpanadaFlavors.map((f) => ({ ...f })),
  gaseosas: mockGaseosaFlavors.map((f) => ({ ...f })),
}
let nextFlavorId = 100

// ── Flavor source metadata (label + description) ─────────────────
const flavorSourcesMeta = {
  default: { id: 'default', label: 'Sabores de helado', desc: 'Sabores artesanales', hasItemPrices: false },
  empanadas: { id: 'empanadas', label: 'Gustos de empanadas', desc: 'Con precio individual por gusto', hasItemPrices: true },
  gaseosas: { id: 'gaseosas', label: 'Opciones de gaseosa', desc: 'Bebidas disponibles', hasItemPrices: false },
}
let nextSourceId = 1

// Status progression timers (configurable seconds per step)
const STATUS_INTERVAL = 15_000 // 15 s per step

const deliveryFlow = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'listo',
  'en_camino',
  'entregado',
]
const pickupFlow = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'listo',
  'entregado',
]

/** Automatically advance an order through its status flow. */
function simulateStatusProgression(order) {
  const flow = order.orderType === 'pickup' ? pickupFlow : deliveryFlow
  let idx = flow.indexOf(order.status)
  if (idx === -1) return

  function advance() {
    idx++
    if (idx >= flow.length) return
    order.status = flow[idx]
    order.updatedAt = new Date().toISOString()
    if (idx < flow.length - 1) {
      setTimeout(advance, STATUS_INTERVAL)
    }
  }

  // Start after one interval
  if (idx < flow.length - 1) {
    setTimeout(advance, STATUS_INTERVAL)
  }
}

function delay(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getMenu() {
  await delay()
  return mockMenu
    .filter((item) => !item.paused && !item.counterOnly && !item.comboOnly)
    .map((item) => ({ ...item }))
}

export async function getMenuByCategory(categoryId) {
  await delay()
  return mockMenu
    .filter((item) => item.category === categoryId && !item.paused && !item.counterOnly && !item.comboOnly)
    .map((item) => ({ ...item }))
}

export async function getMenuItemsByIds(ids) {
  await delay()
  return ids
    .map((id) => mockMenu.find((i) => i.id === id))
    .filter((item) => item && !item.paused)
    .map((item) => ({ ...item }))
}

export async function getCategories() {
  await delay()
  return [...mockCategories]
}

export async function getFlavors(source) {
  await delay()
  const key = source || 'default'
  return (flavorStores[key] || flavorStores.default).map((f) => ({ ...f }))
}

export async function adminGetFlavors(source) {
  await delay()
  const key = source || 'default'
  return (flavorStores[key] || flavorStores.default).map((f) => ({ ...f }))
}

export async function adminAddFlavor(source, data) {
  await delay()
  const key = source || 'default'
  if (!flavorStores[key]) throw new Error('Unknown flavor source')
  const flavor = { id: `fl-${nextFlavorId++}`, name: data.name, ...(data.price != null && { price: data.price }), ...(data.image && { image: data.image }) }
  flavorStores[key].push(flavor)
  return { ...flavor }
}

export async function adminDeleteFlavor(source, flavorId) {
  await delay()
  const key = source || 'default'
  if (!flavorStores[key]) throw new Error('Unknown flavor source')
  const idx = flavorStores[key].findIndex((f) => f.id === flavorId)
  if (idx === -1) throw new Error('Flavor not found')
  flavorStores[key].splice(idx, 1)
  return { ok: true }
}

export async function adminUpdateFlavor(source, flavorId, data) {
  await delay()
  const key = source || 'default'
  if (!flavorStores[key]) throw new Error('Unknown flavor source')
  const flavor = flavorStores[key].find((f) => f.id === flavorId)
  if (!flavor) throw new Error('Flavor not found')
  if (data.price !== undefined) flavor.price = data.price
  if (data.paused !== undefined) flavor.paused = data.paused
  return { ...flavor }
}

// ── Flavor source CRUD ───────────────────────────────────────────

export async function adminGetFlavorSources() {
  await delay()
  return Object.keys(flavorStores).map((key) => {
    // Find products that reference this flavor source
    const usedBy = products.filter((p) => {
      const directMatch = p.hasFlavors && (p.flavorsSource || 'default') === key
      // For combos, check if any step references a product that uses this flavor source
      const comboMatch = p.steps?.some((step) =>
        step.productIds.some((pid) => {
          const sp = products.find((pp) => pp.id === pid)
          return sp?.hasFlavors && (sp.flavorsSource || 'default') === key
        }),
      )
      return directMatch || comboMatch
    }).map((p) => ({ id: p.id, name: p.name }))
    return {
      ...flavorSourcesMeta[key],
      count: flavorStores[key].length,
      usedBy,
    }
  })
}

export async function adminUpdateFlavorSource(id, data) {
  await delay()
  if (!flavorSourcesMeta[id]) throw new Error('Unknown flavor source')
  if (data.label != null) flavorSourcesMeta[id].label = data.label
  if (data.desc != null) flavorSourcesMeta[id].desc = data.desc
  if (data.hasItemPrices != null) flavorSourcesMeta[id].hasItemPrices = data.hasItemPrices
  return { ...flavorSourcesMeta[id], count: flavorStores[id].length }
}

export async function adminCreateFlavorSource(data) {
  await delay()
  const id = `source-${nextSourceId++}`
  flavorSourcesMeta[id] = { id, label: data.label || 'Nueva lista', desc: data.desc || '', hasItemPrices: data.hasItemPrices || false }
  flavorStores[id] = []
  return { ...flavorSourcesMeta[id], count: 0 }
}

export async function adminDeleteFlavorSource(id) {
  await delay()
  if (!flavorSourcesMeta[id]) throw new Error('Unknown flavor source')
  delete flavorSourcesMeta[id]
  delete flavorStores[id]
  return { ok: true }
}

export async function getMenuItem(id) {
  await delay()
  const item = mockMenu.find((i) => i.id === id)
  if (!item) throw new Error('Item not found')
  return { ...item }
}

export async function createOrder(orderData) {
  await delay(500)

  const method = mockPaymentMethods.find((m) => m.id === orderData.paymentMethodId)
  const isPendingPayment = method && (method.type === 'cash' || method.type === 'manual')

  // Normalize cart items to the flat format used by the panel / history views
  const normalizedItems = (orderData.items || []).map((item) => ({
    name: item.name,
    format: typeof item.format === 'object' ? item.format.name : item.format,
    flavors: item.comboSteps
      ? item.comboSteps
          .map(
            (cs) => {
              const parts = [cs.productName]
              if (cs.format) parts[0] += ` (${cs.format.name})`
              if (cs.flavors?.length > 0)
                parts.push(cs.flavors.map((f) => (f.quantity > 1 ? `${f.quantity} ${f.name}` : f.name)).join(', '))
              if (cs.extras?.length > 0)
                parts.push('+ ' + cs.extras.map((e) => e.name).join(', '))
              return `${cs.label}: ${parts.join(' — ')}`
            },
          )
          .join(' | ')
      : Array.isArray(item.flavors)
        ? item.flavors
            .map((f) => {
              if (typeof f === 'object')
                return f.quantity ? `${f.quantity} ${f.name}` : f.name
              return f
            })
            .join(', ')
        : item.flavors || '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }))

  const order = {
    id: Date.now(),
    userId: orderData.userId ?? 1, // default mock user
    ...orderData,
    items: normalizedItems,
    status: 'pendiente',
    paymentMethod: method?.name ?? 'Desconocido',
    paymentStatus: 'pendiente_pago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  orders.push(order)

  // Only start status progression if payment is already confirmed
  if (!isPendingPayment) {
    simulateStatusProgression(order)
  }

  return { ...order }
}

// ── User Panel ────────────────────────────────────────

/** Get all orders for a user, sorted newest first. */
export async function getUserOrders(userId) {
  await delay()
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((o) => ({ ...o }))
}

/** Get all active (non-terminal) orders for a user, newest first. */
export async function getActiveOrders(userId) {
  await delay()
  const terminalStatuses = ['entregado', 'cancelado']
  return orders
    .filter(
      (o) => o.userId === userId && !terminalStatuses.includes(o.status),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((o) => ({ ...o }))
}

/** Update user account data (name, email). */
export async function updateUserProfile(userId, data) {
  await delay(400)
  // Mock: just return merged data
  return { id: userId, ...data }
}

// ── Payment Methods ────────────────────────────────────

/**
 * Get available payment methods.
 */
export async function getPaymentMethods() {
  await delay()
  return mockPaymentMethods
    .filter((m) => m.available)
    .map((m) => ({ ...m }))
}

/**
 * Process payment for an order.
 * Mock: always succeeds after a short delay.
 * Cash and manual (transfer) payments get status 'pendiente_pago', online payments get 'pagado'.
 */
export async function processPayment(orderId, paymentMethodId, amount) {
  await delay(800) // simulate payment processing
  const method = mockPaymentMethods.find((m) => m.id === paymentMethodId)
  if (!method) throw new Error('Método de pago no válido')

  const isPending = method.type === 'cash' || method.type === 'manual'
  const paymentStatus = isPending ? 'pendiente_pago' : 'pagado'

  // Update the order in the in-memory store
  const stored = orders.find((o) => o.id === orderId)
  if (stored) {
    stored.paymentStatus = paymentStatus
    stored.updatedAt = new Date().toISOString()
    // If payment just got confirmed, kick off status progression
    if (paymentStatus === 'pagado') {
      simulateStatusProgression(stored)
    }
  }

  const messages = {
    cash: 'Tené el monto exacto preparado para cuando llegue el delivery',
    manual:
      'Realizá la transferencia y enviá el comprobante para confirmar tu pedido',
  }
  return {
    success: true,
    orderId,
    paymentId: 'pay-' + Date.now(),
    method: method.name,
    amount,
    status: paymentStatus,
    message: isPending
      ? messages[method.type]
      : 'Pago procesado correctamente',
  }
}

// ── Delivery ───────────────────────────────────────────

/**
 * Calculate delivery cost for given coordinates.
 * Returns { inCoverage, distanceKm, zone, cost }
 */
export async function calcDeliveryCost(lat, lng) {
  await delay()
  if (lat == null || lng == null) {
    return { inCoverage: false, distanceKm: null, zone: null, cost: 0 }
  }
  const km = distanceKm(
    mockStoreLocation.lat,
    mockStoreLocation.lng,
    lat,
    lng,
  )
  if (km > mockMaxDeliveryKm) {
    return { inCoverage: false, distanceKm: Math.round(km * 10) / 10, zone: null, cost: 0 }
  }
  const zone = mockDeliveryZones.find((z) => km <= z.maxKm) ?? mockDeliveryZones.at(-1)
  return {
    inCoverage: true,
    distanceKm: Math.round(km * 10) / 10,
    zone: { id: zone.id, name: zone.name },
    cost: zone.cost,
  }
}

// ── Addresses ──────────────────────────────────────────

let addresses = [...mockAddresses]

function distanceKm(lat1, lng1, lat2, lng2) {
  // Haversine formula (simplified)
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function checkCoverage(lat, lng) {
  if (lat == null || lng == null) return true // no coordinates → assume in coverage
  const km = distanceKm(
    mockStoreLocation.lat,
    mockStoreLocation.lng,
    lat,
    lng,
  )
  return km <= mockMaxDeliveryKm
}

export async function getAddresses() {
  await delay()
  return addresses.map((a) => ({ ...a }))
}

export async function createAddress(data) {
  await delay()
  const inCoverage = checkCoverage(data.lat, data.lng)
  const newAddr = {
    id: 'addr-' + Date.now(),
    alias: data.alias || '',
    street: data.street,
    floor: data.floor || '',
    apartment: data.apartment || '',
    neighborhood: data.neighborhood || '',
    city: data.city || '',
    comment: data.comment || '',
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    inCoverage,
  }
  addresses.push(newAddr)
  return { ...newAddr }
}

export async function updateAddress(id, data) {
  await delay()
  const idx = addresses.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('Dirección no encontrada')
  const inCoverage = checkCoverage(
    data.lat ?? addresses[idx].lat,
    data.lng ?? addresses[idx].lng,
  )
  addresses[idx] = { ...addresses[idx], ...data, inCoverage }
  return { ...addresses[idx] }
}

export async function deleteAddress(id) {
  await delay()
  const idx = addresses.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('Dirección no encontrada')
  addresses.splice(idx, 1)
  return { success: true }
}

// ── Loyalty / Points ───────────────────────────────────

let pointsHistory = [...mockPointsHistory]

/**
 * Return available (non-expired) points balance for a user.
 */
export async function getPointsBalance(userId) {
  await delay()
  const now = new Date()
  let balance = 0
  for (const entry of pointsHistory) {
    if (entry.userId !== userId) continue
    if (entry.type === 'earn') {
      const expires = new Date(entry.expiresAt)
      if (expires > now) {
        balance += entry.points
      }
    } else if (entry.type === 'redeem') {
      balance += entry.points // negative number
    }
  }
  return { balance: Math.max(0, balance), userId }
}

/**
 * Return full points history for a user (sorted newest first).
 */
export async function getPointsHistory(userId) {
  await delay()
  return pointsHistory
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((e) => ({ ...e }))
}

/**
 * Redeem points as discount. Creates a negative entry.
 * Returns the updated balance.
 */
export async function redeemPoints(userId, points) {
  await delay()
  if (points <= 0) throw new Error('Los puntos a canjear deben ser mayor a 0')
  const { balance } = await getPointsBalance(userId)
  if (points > balance) throw new Error('No tenés suficientes puntos')
  const entry = {
    id: 'pts-' + Date.now(),
    userId,
    type: 'redeem',
    points: -points,
    description: 'Canje en pedido',
    date: new Date().toISOString(),
    expiresAt: null,
  }
  pointsHistory.push(entry)
  return { balance: balance - points, redeemed: points }
}

/**
 * Earn points after completing an order.
 * 1 peso = 1 point (subtotal only, excluding shipping).
 */
export async function earnPoints(userId, subtotal, orderId) {
  await delay()
  const points = Math.floor(subtotal) // 1 peso = 1 punto
  if (points <= 0) return { earned: 0 }
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + 3)
  const entry = {
    id: 'pts-' + Date.now(),
    userId,
    type: 'earn',
    points,
    description: `Pedido #${orderId}`,
    date: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
  pointsHistory.push(entry)
  return { earned: points }
}

// ── Coupons ────────────────────────────────────────────

/**
 * Validate a coupon code. Returns coupon info + calculated discount for the given subtotal.
 */
export async function validateCoupon(code, subtotal = 0) {
  await delay()
  const coupon = mockCoupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase(),
  )
  if (!coupon) throw new Error('Código de descuento no válido')
  if (!coupon.active) throw new Error('Este cupón ya no está activo')
  if (new Date(coupon.expiresAt) < new Date())
    throw new Error('Este cupón ha expirado')
  if (subtotal < coupon.minOrder)
    throw new Error(
      `Pedido mínimo de $${coupon.minOrder.toLocaleString('es-AR')} para este cupón`,
    )

  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.round((subtotal * coupon.value) / 100)
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  } else {
    discount = coupon.value
  }
  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal)

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
    },
    discount,
  }
}

// ── Admin Handlers ────────────────────────────────────

const adminOrderFlow = [
  'pendiente',
  'en_preparacion',
  'listo',
  'en_camino',
  'entregado',
]

/** Get all orders, newest first (admin). */
export async function adminGetAllOrders() {
  await delay()
  return orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((o) => ({ ...o }))
}

/** Advance an order to the next status (admin). */
export async function adminAdvanceOrder(orderId) {
  await delay()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Pedido no encontrado')

  const flow = order.orderType === 'pickup'
    ? adminOrderFlow.filter((s) => s !== 'en_camino')
    : adminOrderFlow
  const idx = flow.indexOf(order.status)
  if (idx === -1 || idx >= flow.length - 1) {
    throw new Error('El pedido ya está en su estado final')
  }
  order.status = flow[idx + 1]
  order.updatedAt = new Date().toISOString()
  return { ...order }
}

/** Move an order back to the previous status (admin). */
export async function adminRevertOrder(orderId) {
  await delay()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Pedido no encontrado')

  // Revert from cancelled → restore to pendiente
  if (order.status === 'cancelado') {
    order.status = 'pendiente'
    order.updatedAt = new Date().toISOString()
    return { ...order }
  }

  const flow = order.orderType === 'pickup'
    ? adminOrderFlow.filter((s) => s !== 'en_camino')
    : adminOrderFlow
  const idx = flow.indexOf(order.status)
  if (idx <= 0) {
    throw new Error('El pedido ya está en su primer estado')
  }
  order.status = flow[idx - 1]
  order.updatedAt = new Date().toISOString()
  return { ...order }
}

/** Cancel an order (admin). Accepts reason and optional image. */
export async function adminCancelOrder(orderId, { reason, imageUrl } = {}) {
  await delay()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Pedido no encontrado')
  if (order.status === 'entregado') throw new Error('No se puede cancelar un pedido entregado')
  order.status = 'cancelado'
  order.cancelReason = reason || ''
  order.cancelImageUrl = imageUrl || null
  order.updatedAt = new Date().toISOString()
  return { ...order }
}

/** Set an order to an arbitrary status (admin — used for drag & drop). */
export async function adminSetOrderStatus(orderId, newStatus) {
  await delay()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Pedido no encontrado')
  const validStatuses = [...adminOrderFlow, 'cancelado']
  if (!validStatuses.includes(newStatus)) throw new Error('Estado inválido')
  order.status = newStatus
  order.updatedAt = new Date().toISOString()
  return { ...order }
}

/** Get status labels for display. */
export function getOrderStatusLabels() {
  return { ...orderStatusLabels }
}

// ── Mock: simulate new incoming order ─────────────────

const mockCustomerNames = [
  'Lucía Fernández', 'Martín Gómez', 'Valentina Pérez', 'Santiago Rodríguez',
  'Camila Martínez', 'Facundo López', 'Sofía Díaz', 'Matías González',
]
const mockStreets = [
  'Av. Corrientes 1500', 'Av. Rivadavia 4200', 'Tucumán 900', 'Maipú 350',
  'Av. Córdoba 2800', 'Beruti 3100', 'Thames 1600', 'Av. Las Heras 1900',
]
const mockItemSets = [
  [{ name: 'Helado 1/4 kg', format: '1/4 kg', flavors: 'Dulce de leche, Chocolate', quantity: 1, unitPrice: 3500 }],
  [{ name: 'Pizza muzzarella', format: 'Pizza entera', flavors: '', quantity: 1, unitPrice: 5500 }, { name: 'Coca-Cola', format: 'Lata 354ml', flavors: '', quantity: 2, unitPrice: 800 }],
  [{ name: 'Empanadas', format: 'Empanadas', flavors: '6 Carne, 6 Pollo', quantity: 1, unitPrice: 10600 }],
  [{ name: 'Helado 1 kg', format: '1 kg', flavors: 'Frutilla, Limón, Sambayón, Tramontana', quantity: 1, unitPrice: 9000 }],
  [{ name: 'Combo Pizza + 2 Gaseosas', format: 'Combo Pizza + 2 Gaseosas', flavors: 'Gaseosa: Coca-Cola, Sprite', quantity: 1, unitPrice: 6500 }],
]

let nextOrderId = 4000

/** Simulate a new incoming order (admin mock). */
export async function adminSimulateNewOrder() {
  await delay()
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const isPickup = Math.random() < 0.3
  const items = pick(mockItemSets)
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const deliveryCost = isPickup ? 0 : [500, 800, 1200][Math.floor(Math.random() * 3)]
  const newOrder = {
    id: nextOrderId++,
    userId: `guest-${200 + nextOrderId}`,
    status: 'pendiente',
    orderType: isPickup ? 'pickup' : 'delivery',
    customerName: pick(mockCustomerNames),
    items,
    subtotal,
    deliveryCost,
    total: subtotal + deliveryCost,
    paymentMethod: pick(['Mercado Pago', 'Efectivo', 'Transferencia bancaria', 'Tarjeta']),
    paymentStatus: Math.random() < 0.5 ? 'pagado' : 'pendiente_pago',
    address: isPickup ? null : { alias: 'Casa', street: pick(mockStreets) },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  orders.unshift(newOrder)
  return { ...newOrder }
}

// ── Admin Product Handlers ────────────────────────────

/** Get all products (admin). */
export async function adminGetAllProducts() {
  await delay()
  return products.map((p) => {
    const copy = { ...p }
    if (p.hasFlavors) {
      const srcKey = p.flavorsSource || 'default'
      const meta = flavorSourcesMeta[srcKey]
      if (meta) copy.unitPricing = meta.hasItemPrices || false
    }
    return copy
  })
}

/** Get all categories (admin). */
export async function adminGetCategories() {
  await delay()
  return [...mockCategories]
}

/** Create a new product (admin). */
export async function adminCreateProduct(data) {
  await delay()
  const product = { ...data, id: nextProductId++ }
  products.push(product)
  return { ...product }
}

/** Update an existing product (admin). */
export async function adminUpdateProduct(id, data) {
  await delay()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Producto #${id} no encontrado`)
  products[idx] = { ...products[idx], ...data, id }
  return { ...products[idx] }
}

/** Delete a product (admin). */
export async function adminDeleteProduct(id) {
  await delay()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Producto #${id} no encontrado`)
  products.splice(idx, 1)
  return { success: true }
}

/** Toggle product paused state (admin). */
export async function adminToggleProduct(id) {
  await delay()
  const product = products.find((p) => p.id === id)
  if (!product) throw new Error(`Producto #${id} no encontrado`)
  product.paused = !product.paused
  return { ...product }
}

/** Get non-combo products for combo step picker (admin). */
export async function adminGetBaseProducts() {
  await delay()
  return products.filter((p) => !p.isCombo).map((p) => ({ id: p.id, name: p.name, category: p.category, paused: p.paused, comboOnly: p.comboOnly }))
}
