// Mock API handlers - simulate network delay + backend responses
// Swap these for real api.js calls when backend is ready

import {
  mockMenu,
  mockCategories,
  mockAddresses,
  mockStoreLocation,
  mockMaxDeliveryKm,
} from './data'

const MOCK_DELAY = 300 // ms

function delay(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getMenu() {
  await delay()
  return [...mockMenu]
}

export async function getMenuByCategory(categoryId) {
  await delay()
  return mockMenu.filter((item) => item.category === categoryId)
}

export async function getCategories() {
  await delay()
  return [...mockCategories]
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
