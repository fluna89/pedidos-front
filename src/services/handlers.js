// Real API handlers — drop-in replacements for src/mocks/handlers.js
// Each function keeps the same signature so consumer code stays unchanged.

import { api } from './api'

// ── MENU & CATALOG ─────────────────────────────────────────────

export async function getMenu() {
  return api.get('/menu')
}

export async function getMenuByCategory(categoryId) {
  return api.get(`/menu?category=${encodeURIComponent(categoryId)}`)
}

export async function getMenuItemsByIds(ids) {
  return api.post('/menu/by-ids', { ids })
}

export async function getCategories() {
  return api.get('/categories')
}

export async function getMenuItem(id) {
  return api.get(`/menu/${encodeURIComponent(id)}`)
}

export async function getCounterMenu() {
  return api.get('/counter-menu')
}

// ── FLAVORS ────────────────────────────────────────────────────

export async function getFlavors(source) {
  const src = source || 'default'
  return api.get(`/flavors?source=${encodeURIComponent(src)}`)
}

// ── ORDERS ────────────────────────────────────────────────────

export async function createOrder(orderData) {
  return api.post('/orders', orderData)
}

export async function getUserOrders(userId) {
  return api.get(`/orders?userId=${encodeURIComponent(userId)}`)
}

export async function getActiveOrders(userId) {
  return api.get(`/orders/active?userId=${encodeURIComponent(userId)}`)
}

// ── User Profile ──────────────────────────────────────────────

export async function updateUserProfile(_userId, data) {
  return api.put('/auth/profile', data)
}

// ── Payment Methods ───────────────────────────────────────────

export async function getPaymentMethods() {
  return api.get('/payment-methods')
}

export async function processPayment(orderId, paymentMethodId, amount) {
  return api.post('/payments', { orderId, paymentMethodId, amount })
}

// ── Delivery ──────────────────────────────────────────────────

export async function calcDeliveryCost(lat, lng) {
  if (lat == null || lng == null) {
    return { inCoverage: false, distanceKm: null, zone: null, cost: 0 }
  }
  return api.post('/delivery/calc', { lat, lng })
}

// ── Addresses ─────────────────────────────────────────────────

export async function getAddresses() {
  return api.get('/addresses')
}

export async function createAddress(data) {
  return api.post('/addresses', data)
}

export async function updateAddress(id, data) {
  return api.put(`/addresses/${encodeURIComponent(id)}`, data)
}

export async function deleteAddress(id) {
  return api.delete(`/addresses/${encodeURIComponent(id)}`)
}

// ── Loyalty / Points ──────────────────────────────────────────

export async function getPointsBalance(userId) {
  return api.get(`/points/balance?userId=${encodeURIComponent(userId)}`)
}

export async function getPointsHistory(userId) {
  return api.get(`/points/history?userId=${encodeURIComponent(userId)}`)
}

export async function redeemPoints(userId, points) {
  return api.post('/points/redeem', { userId, points })
}

export async function earnPoints(userId, subtotal, orderId) {
  return api.post('/points/earn', { userId, subtotal, orderId })
}

// ── Coupons ───────────────────────────────────────────────────

export async function validateCoupon(code, subtotal = 0) {
  return api.post('/coupons/validate', { code, subtotal })
}

// ── Store Status ──────────────────────────────────────────────

export async function getStoreStatus() {
  return api.get('/store/status')
}

// ── Admin: Store Config ───────────────────────────────────────

export async function adminGetStoreHours() {
  return api.get('/admin/store/hours')
}

export async function adminUpdateStoreHours(data) {
  return api.put('/admin/store/hours', data)
}

export async function adminToggleEmergency(emergencyShutdown, emergencyMessage = '') {
  return api.put('/admin/store/emergency', { emergencyShutdown, emergencyMessage })
}

// ── Admin: User Search ────────────────────────────────────────

export async function adminSearchUsers(query) {
  if (!query || query.trim().length < 2) return []
  return api.get(`/admin/users?q=${encodeURIComponent(query)}`)
}

// ── Admin: Orders ─────────────────────────────────────────────

export async function adminGetAllOrders() {
  return api.get('/admin/orders')
}

export async function adminAdvanceOrder(orderId) {
  return api.put(`/admin/orders/${encodeURIComponent(orderId)}/advance`)
}

export async function adminRevertOrder(orderId) {
  return api.put(`/admin/orders/${encodeURIComponent(orderId)}/revert`)
}

export async function adminCancelOrder(orderId, { reason, imageUrl } = {}) {
  return api.put(`/admin/orders/${encodeURIComponent(orderId)}/cancel`, {
    reason,
    imageUrl,
  })
}

export async function adminSetOrderStatus(orderId, newStatus) {
  return api.put(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
    status: newStatus,
  })
}

export async function adminCreateOrder(orderData) {
  return api.post('/admin/orders', orderData)
}

// Mock simulate — no backend equivalent; kept as no-op for admin dev UI
export async function adminSimulateNewOrder() {
  throw new Error('Simulación no disponible con backend real')
}

// ── Admin: Products ───────────────────────────────────────────

export async function adminGetAllProducts() {
  return api.get('/admin/products')
}

export async function adminGetCategories() {
  return api.get('/categories')
}

export async function adminCreateProduct(data) {
  return api.post('/admin/products', data)
}

export async function adminUpdateProduct(id, data) {
  return api.put(`/admin/products/${encodeURIComponent(id)}`, data)
}

export async function adminDeleteProduct(id) {
  return api.delete(`/admin/products/${encodeURIComponent(id)}`)
}

export async function adminToggleProduct(id) {
  return api.put(`/admin/products/${encodeURIComponent(id)}/toggle`)
}

export async function adminGetProductUsage(id) {
  return api.get(`/admin/products/${encodeURIComponent(id)}/usage`)
}

export async function adminGetBaseProducts() {
  return api.get('/admin/products/base')
}

export async function adminGetUploadUrl(productId, contentType = 'image/webp') {
  return api.get(
    `/admin/products/upload-url?productId=${encodeURIComponent(productId)}&contentType=${encodeURIComponent(contentType)}`,
  )
}

export async function uploadImageToS3(uploadUrl, file, contentType) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  })
  if (!res.ok) throw new Error('Error subiendo imagen')
}

// ── Admin: Flavor Sources ─────────────────────────────────────

export async function adminGetFlavorSources() {
  return api.get('/admin/flavor-sources')
}

export async function adminCreateFlavorSource(data) {
  return api.post('/admin/flavor-sources', data)
}

export async function adminUpdateFlavorSource(id, data) {
  return api.put(`/admin/flavor-sources/${encodeURIComponent(id)}`, data)
}

export async function adminDeleteFlavorSource(id) {
  return api.delete(`/admin/flavor-sources/${encodeURIComponent(id)}`)
}

// ── Admin: Flavors ────────────────────────────────────────────

export async function adminGetFlavors(source) {
  const src = source || 'default'
  return api.get(`/admin/flavors?source=${encodeURIComponent(src)}`)
}

export async function adminAddFlavor(source, data) {
  return api.post('/admin/flavors', { ...data, source: source || 'default' })
}

export async function adminUpdateFlavor(source, flavorId, data) {
  return api.put(`/admin/flavors/${encodeURIComponent(flavorId)}`, {
    ...data,
    source: source || 'default',
  })
}

export async function adminDeleteFlavor(source, flavorId) {
  const src = source || 'default'
  return api.delete(
    `/admin/flavors/${encodeURIComponent(flavorId)}?source=${encodeURIComponent(src)}`,
  )
}

// ── Order Status Labels (static, no API call needed) ──────────

export function getOrderStatusLabels() {
  return { ...orderStatusLabels }
}

export const orderStatusLabels = {
  pendiente: 'Pendiente',
  pendiente_pago: 'Pendiente de pago',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
