import { useState, useCallback, useEffect } from 'react'
import { CartContext } from '@/context/cart-context'

/**
 * Cart item shape:
 * {
 *   cartId:    string,       // unique per cart line
 *   productId: number,
 *   name:      string,
 *   format:    { id, name, price },
 *   flavors:   [{ id, name, quantity?, price? }],
 *   extras:    [{ id, name, price }],
 *   comment:   string,
 *   quantity:  number,
 *   unitPrice: number,       // format.price + sum(extras.price)
 *   comboSteps?: [{ label, productId, productName, format, extras, flavors }]
 * }
 */

function calcUnitPrice(format, extras) {
  return format.price + extras.reduce((sum, e) => sum + e.price, 0)
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [orderComment, setOrderComment] = useState('')

  const addItem = useCallback((product, format, extras = [], comment = '', flavors = [], comboSteps = null) => {
    const unitPrice = comboSteps ? format.price : calcUnitPrice(format, extras)
    const newItem = {
      cartId: 'cart-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      productId: product.id,
      name: product.name,
      format: { id: format.id, name: format.name, price: format.price },
      flavors: flavors.map((f) => ({
        id: f.id,
        name: f.name,
        ...(f.quantity && { quantity: f.quantity }),
        ...(f.price != null && { price: f.price }),
      })),
      ...(comboSteps && { comboSteps }),
      extras: extras.map((e) => ({ id: e.id, name: e.name, price: e.price })),
      comment,
      quantity: 1,
      unitPrice,
    }
    setItems((prev) => [...prev, newItem])
    return newItem
  }, [])

  const removeItem = useCallback((cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId))
  }, [])

  const updateQuantity = useCallback((cartId, quantity) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i)),
    )
  }, [])

  const replaceItem = useCallback((cartId, product, format, extras = [], comment = '', flavors = [], comboSteps = null) => {
    const unitPrice = comboSteps ? format.price : calcUnitPrice(format, extras)
    setItems((prev) =>
      prev.map((i) => {
        if (i.cartId !== cartId) return i
        return {
          ...i,
          productId: product.id,
          name: product.name,
          format: { id: format.id, name: format.name, price: format.price },
          flavors: flavors.map((f) => ({
            id: f.id,
            name: f.name,
            ...(f.quantity && { quantity: f.quantity }),
            ...(f.price != null && { price: f.price }),
          })),
          extras: extras.map((e) => ({ id: e.id, name: e.name, price: e.price })),
          ...(comboSteps ? { comboSteps } : {}),
          comment,
          unitPrice,
        }
      }),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setOrderComment('')
  }, [])

  // Clear cart on logout or session expiry
  useEffect(() => {
    window.addEventListener('auth:expired', clearCart)
    window.addEventListener('auth:logout', clearCart)
    return () => {
      window.removeEventListener('auth:expired', clearCart)
      window.removeEventListener('auth:logout', clearCart)
    }
  }, [clearCart])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const value = {
    items,
    orderComment,
    setOrderComment,
    addItem,
    replaceItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
