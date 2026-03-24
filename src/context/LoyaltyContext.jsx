import { useState, useEffect, useCallback } from 'react'
import { LoyaltyContext } from '@/context/loyalty-context'
import { useAuth } from '@/hooks/useAuth'
import {
  getPointsBalance,
  getPointsHistory,
  redeemPoints as redeemPointsApi,
  earnPoints as earnPointsApi,
} from '@/services/handlers'

export function LoyaltyProvider({ children }) {
  const { user, isAuthenticated, isGuest } = useAuth()

  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // Only registered (non-guest) users accumulate points
  const eligible = isAuthenticated && !isGuest

  const loadPoints = useCallback(async () => {
    if (!eligible || !user?.id) return
    setLoading(true)
    try {
      const [balRes, histRes] = await Promise.all([
        getPointsBalance(user.id),
        getPointsHistory(user.id),
      ])
      setBalance(balRes.balance)
      setHistory(histRes)
    } catch {
      // silently fail on mock errors
    } finally {
      setLoading(false)
    }
  }, [eligible, user?.id])

  useEffect(() => {
    if (eligible) {
      loadPoints()
    } else {
      setBalance(0)
      setHistory([])
    }
  }, [eligible, loadPoints])

  async function redeemPoints(points) {
    if (!eligible || !user?.id) throw new Error('No elegible para canjear puntos')
    const result = await redeemPointsApi(user.id, points)
    setBalance(result.balance)
    await loadPoints() // refresh history
    return result
  }

  async function earnAfterOrder(subtotal, orderId) {
    if (!eligible || !user?.id) return { earned: 0 }
    const result = await earnPointsApi(user.id, subtotal, orderId)
    await loadPoints() // refresh
    return result
  }

  const value = {
    balance,
    history,
    loading,
    eligible,
    redeemPoints,
    earnAfterOrder,
    refreshPoints: loadPoints,
  }

  return (
    <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
  )
}
