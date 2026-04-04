// API service layer - all API calls go through here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/** Read the JWT token from localStorage (set by AuthContext). */
function getToken() {
  try {
    const saved = localStorage.getItem('auth_user')
    if (!saved) return null
    const token = JSON.parse(saved).token
    if (!token) return null
    // Check expiry before using
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      window.dispatchEvent(new CustomEvent('auth:expired'))
      return null
    }
    return token
  } catch {
    return null
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const config = { ...options, headers }

  const response = await fetch(url, config)

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))

    // Session expired — notify AuthContext to auto-logout
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    throw new Error(body.error || body.message || `Error ${response.status}`)
  }

  // Backend wraps successful payloads in { data: ... }
  const json = await response.json()
  return json.data !== undefined ? json.data : json
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}
