import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/auth-context'
import { api } from '@/services/api'

function loadSavedUser() {
  try {
    const saved = localStorage.getItem('auth_user')
    return saved ? JSON.parse(saved) : null
  } catch {
    localStorage.removeItem('auth_user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedUser)
  const [sessionExpired, setSessionExpired] = useState(false)

  function persistUser(userData) {
    setUser(userData)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }, [])

  // Auto-logout on expired token (401 from API)
  useEffect(() => {
    function handleExpired() {
      logout()
      setSessionExpired(true)
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [logout])

  function clearSessionExpired() {
    setSessionExpired(false)
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    const userData = { ...res.user, token: res.token }
    persistUser(userData)
    return userData
  }

  async function register(name, email, password, phone) {
    const res = await api.post('/auth/register', { name, email, password, phone })
    const userData = { ...res.user, token: res.token }
    persistUser(userData)
    return userData
  }

  async function loginAsGuest(guestData) {
    const res = await api.post('/auth/guest', {
      name: guestData.name,
      email: guestData.email || undefined,
      phone: guestData.phone || undefined,
    })
    const userData = { ...res.user, isGuest: true, token: res.token }
    persistUser(userData)
    return userData
  }

  async function loginWithGoogle() {
    // In production the front would get a Google ID token first;
    // for now we send a placeholder so the backend mock-creates the user.
    const res = await api.post('/auth/google', { token: 'google-id-placeholder' })
    const userData = { ...res.user, provider: 'google', token: res.token }
    persistUser(userData)
    return userData
  }

  async function recoverPassword(email) {
    const res = await api.post('/auth/recover', { email })
    return res
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || user?.role === 'guest' || false,
    isAdmin: user?.role === 'admin',
    login,
    loginWithGoogle,
    register,
    loginAsGuest,
    recoverPassword,
    logout,
    updateUser: (data) => persistUser({ ...user, ...data }),
    sessionExpired,
    clearSessionExpired,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
