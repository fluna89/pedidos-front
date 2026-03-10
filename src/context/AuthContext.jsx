import { useState } from 'react'
import { AuthContext } from '@/context/auth-context'

// Mock: simula autenticación. Reemplazar con llamadas reales al backend.
const MOCK_USERS = [
  { id: 1, name: 'Juan Pérez', email: 'juan@test.com', password: '1234', role: 'customer' },
  { id: 2, name: 'Admin Ainara', email: 'admin@ainara.com', password: 'admin', role: 'admin' },
]

function generateToken() {
  return 'mock-token-' + Date.now()
}

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

  function persistUser(userData) {
    setUser(userData)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  async function login(email, password) {
    // Mock delay
    await new Promise((r) => setTimeout(r, 500))

    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    )
    if (!found) {
      throw new Error('Email o contraseña incorrectos')
    }

    const userData = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role || 'customer',
      token: generateToken(),
    }
    persistUser(userData)
    return userData
  }

  async function register(name, email, password) {
    await new Promise((r) => setTimeout(r, 500))

    const exists = MOCK_USERS.find((u) => u.email === email)
    if (exists) {
      throw new Error('Ya existe una cuenta con ese email')
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    }
    MOCK_USERS.push(newUser)

    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(),
    }
    persistUser(userData)
    return userData
  }

  async function loginAsGuest(guestData) {
    await new Promise((r) => setTimeout(r, 300))

    const userData = {
      id: 'guest-' + Date.now(),
      name: guestData.name,
      email: guestData.email || null,
      phone: guestData.phone,
      isGuest: true,
      token: generateToken(),
    }
    persistUser(userData)
    return userData
  }

  async function loginWithGoogle() {
    // Mock: simula el flujo OAuth con Google
    // En producción esto abriría el popup de Google y el backend validaría el token
    await new Promise((r) => setTimeout(r, 800))

    const userData = {
      id: 'google-' + Date.now(),
      name: 'Usuario Google',
      email: 'usuario@gmail.com',
      provider: 'google',
      token: generateToken(),
    }
    persistUser(userData)
    return userData
  }

  async function recoverPassword(email) {
    await new Promise((r) => setTimeout(r, 500))

    const found = MOCK_USERS.find((u) => u.email === email)
    if (!found) {
      throw new Error('No se encontró una cuenta con ese email')
    }

    // Mock: en producción enviaría un email
    return { message: 'Se envió un email de recuperación a ' + email }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false,
    isAdmin: user?.role === 'admin',
    login,
    loginWithGoogle,
    register,
    loginAsGuest,
    recoverPassword,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
