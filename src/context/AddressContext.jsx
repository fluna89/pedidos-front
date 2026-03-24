import { useState, useCallback, useEffect } from 'react'
import { AddressContext } from '@/context/address-context'
import { useAuth } from '@/hooks/useAuth'
import {
  getAddresses,
  createAddress as apiCreate,
  updateAddress as apiUpdate,
  deleteAddress as apiDelete,
} from '@/services/handlers'

export function AddressProvider({ children }) {
  const { isAuthenticated, isGuest } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAddresses = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAddresses()
      setAddresses(data)
      // restore active from localStorage or pick first
      const savedActive = localStorage.getItem('active_address')
      if (savedActive && data.some((a) => a.id === savedActive)) {
        setActiveId(savedActive)
      } else if (data.length > 0) {
        setActiveId(data[0].id)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      fetchAddresses()
    } else {
      setAddresses([])
      setActiveId(null)
    }
  }, [isAuthenticated, isGuest, fetchAddresses])

  const addAddress = useCallback(async (data) => {
    const created = await apiCreate(data)
    setAddresses((prev) => [...prev, created])
    return created
  }, [])

  const editAddress = useCallback(async (id, data) => {
    const updated = await apiUpdate(id, data)
    setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)))
    return updated
  }, [])

  const removeAddress = useCallback(
    async (id) => {
      await apiDelete(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      if (activeId === id) {
        setActiveId(() => {
          const remaining = addresses.filter((a) => a.id !== id)
          return remaining.length > 0 ? remaining[0].id : null
        })
      }
    },
    [activeId, addresses],
  )

  const selectActive = useCallback((id) => {
    setActiveId(id)
    localStorage.setItem('active_address', id)
  }, [])

  const activeAddress = addresses.find((a) => a.id === activeId) || null

  const value = {
    addresses,
    activeId,
    activeAddress,
    loading,
    addAddress,
    editAddress,
    removeAddress,
    selectActive,
    refresh: fetchAddresses,
  }

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  )
}
