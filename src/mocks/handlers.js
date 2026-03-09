// Mock API handlers - simulate network delay + backend responses
// Swap these for real api.js calls when backend is ready

import {
  mockMenu,
  mockCategories,
  mockFlavors,
  mockEmpanadaFlavors,
  mockPizzaFlavors,
  mockGaseosaFlavors,
  mockAddresses,
  mockStoreLocation,
  mockMaxDeliveryKm,
  mockDeliveryZones,
  mockPointsHistory,
  mockCoupons,
  mockPaymentMethods,
  mockOrders,
} from './data'

const MOCK_DELAY = 300 // ms

// ── In-memory order store (session persistence) ───────────────────
// Starts with mockOrders from data.js, new orders are appended at runtime.
const orders = [...mockOrders]

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
  return mockMenu.filter((item) => item.available).map((item) => ({ ...item }))
}

export async function getMenuByCategory(categoryId) {
  await delay()
  return mockMenu
    .filter((item) => item.category === categoryId && item.available)
    .map((item) => ({ ...item }))
}

export async function getCategories() {
  await delay()
  return [...mockCategories]
}

export async function getFlavors(source) {
  await delay()
  if (source === 'empanadas') return [...mockEmpanadaFlavors]
  if (source === 'pizzas') return [...mockPizzaFlavors]
  if (source === 'gaseosas') return [...mockGaseosaFlavors]
  return [...mockFlavors]
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
    flavors: item.comboSelections
      ? item.comboSelections
          .map(
            (cs) =>
              `${cs.label}: ${cs.flavors.map((f) => (f.quantity > 1 ? `${f.quantity} ${f.name}` : f.name)).join(', ')}`,
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
