// API service layer - all API calls go through here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Error ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}
