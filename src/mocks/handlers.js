// Mock API handlers - simulate network delay + backend responses
// Swap these for real api.js calls when backend is ready

import { mockMenu, mockCategories } from './data'

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
