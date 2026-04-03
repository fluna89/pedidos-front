import { useState, useEffect, useCallback } from 'react'
import { StoreStatusContext } from '@/context/store-status-context'
import { getStoreStatus } from '@/services/handlers'

export function StoreStatusProvider({ children }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await getStoreStatus()
      setStatus(data)
    } catch {
      setStatus({ isOpen: true, reason: 'error', message: '', nextOpen: null })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 60_000)
    return () => clearInterval(interval)
  }, [refresh])

  const value = {
    isOpen: status?.isOpen ?? true,
    reason: status?.reason ?? '',
    message: status?.message ?? '',
    nextOpen: status?.nextOpen ?? null,
    loading,
    refresh,
  }

  return (
    <StoreStatusContext.Provider value={value}>
      {children}
    </StoreStatusContext.Provider>
  )
}
