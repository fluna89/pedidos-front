// Mock API handlers - simulate network delay + backend responses
// Swap these for real api.js calls when backend is ready

import {
  mockMenu,
  mockCategories,
  mockFlavors,
  mockAddresses,
  mockStoreLocation,
  mockMaxDeliveryKm,
  mockDeliveryZones,
  mockPointsHistory,
  mockCoupons,
  mockPaymentMethods,
} from './data'

const MOCK_DELAY = 300 // ms

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

export async function getFlavors() {
  await delay()
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
  return {
    id: Date.now(),
    ...orderData,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  }
}

// ── Payment Methods ────────────────────────────────────

/**
 * Get available payment methods.
 * Filters out cash-only if order type is pickup.
 */
export async function getPaymentMethods(orderType = 'delivery') {
  await delay()
  return mockPaymentMethods
    .filter((m) => m.available)
    .filter((m) => !(m.onlyDelivery && orderType !== 'delivery'))
    .map((m) => ({ ...m }))
}

/**
 * Process payment for an order.
 * Mock: always succeeds after a short delay.
 * Cash payments get status 'pendiente_pago', others get 'confirmado'.
 */
export async function processPayment(orderId, paymentMethodId, amount) {
  await delay(800) // simulate payment processing
  const method = mockPaymentMethods.find((m) => m.id === paymentMethodId)
  if (!method) throw new Error('Método de pago no válido')

  const isCash = method.type === 'cash'
  return {
    success: true,
    orderId,
    paymentId: 'pay-' + Date.now(),
    method: method.name,
    amount,
    status: isCash ? 'pendiente_pago' : 'pagado',
    message: isCash
      ? 'Tené el monto exacto preparado para cuando llegue el delivery'
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
