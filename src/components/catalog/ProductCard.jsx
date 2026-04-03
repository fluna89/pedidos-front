import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/hooks/useCart'
import useStoreStatus from '@/hooks/useStoreStatus'
import { Minus, Plus, ShoppingCart, Check, MessageSquare, Trash2 } from 'lucide-react'

function isSimpleProduct(product) {
  return (
    !product.hasFlavors &&
    !product.isCombo &&
    product.extras.length === 0 &&
    product.formats.length <= 1
  )
}

export default function ProductCard({ product }) {
  const minPrice = product.formats.length > 0
    ? Math.min(...product.formats.map((f) => f.price))
    : 0
  const hasMultipleFormats = product.formats.length > 1
  const simple = isSimpleProduct(product)
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const { isOpen: storeIsOpen } = useStoreStatus()

  // Find existing cart item for this simple product
  const cartItem = simple
    ? items.find((i) => i.productId === product.id && !i.comboSteps)
    : null
  const inCart = !!cartItem

  // Count total quantity of this product in cart (for non-simple badge)
  const cartQty = items
    .filter((i) => i.productId === product.id)
    .reduce((sum, i) => sum + i.quantity, 0)

  const [pendingQty, setPendingQty] = useState(1)
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!simple) return
    const format = product.formats[0] || { id: 'f-default', name: 'Estándar', price: minPrice }
    const newItem = addItem(product, format, [], comment, [])
    if (pendingQty > 1) updateQuantity(newItem.cartId, pendingQty)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setPendingQty(1)
      setComment('')
      setShowComment(false)
    }, 1200)
  }

  function handleCartIncrement() {
    if (!cartItem) return
    updateQuantity(cartItem.cartId, cartItem.quantity + 1)
  }

  function handleCartDecrement() {
    if (!cartItem) return
    if (cartItem.quantity <= 1) {
      removeItem(cartItem.cartId)
    } else {
      updateQuantity(cartItem.cartId, cartItem.quantity - 1)
    }
  }

  function handleRemove() {
    if (!cartItem) return
    removeItem(cartItem.cartId)
  }

  return (
    <Card
      className={`flex flex-col overflow-hidden ${
        product.isCombo
          ? 'border-2 border-amber-400 ring-1 ring-amber-200 dark:border-amber-500 dark:ring-amber-700'
          : ''
      }`}
    >
      {/* placeholder image area */}
      <div className="relative flex h-32 items-center justify-center bg-gray-100 text-4xl dark:bg-gray-800">
        {product.isCombo && (
          <span className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-500">
            COMBO
          </span>
        )}
        {product.image ?? '🍽️'}
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="flex-1 text-sm text-gray-500 dark:text-gray-400">
          {product.description}
        </p>

        {simple ? (
          <div className="space-y-2">
            {inCart ? (
              /* ── In-cart mode: adjust quantity or remove ── */
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ${minPrice.toLocaleString('es-AR')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCartDecrement}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                      disabled={!storeIsOpen}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{cartItem.quantity}</span>
                    <button
                      type="button"
                      onClick={handleCartIncrement}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                      disabled={!storeIsOpen}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-none"
                    onClick={handleRemove}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" className="flex-1" disabled>
                    <Check className="mr-1 h-3.5 w-3.5" />
                    En carrito — ${(minPrice * cartItem.quantity).toLocaleString('es-AR')}
                  </Button>
                </div>
              </>
            ) : (
              /* ── Add mode: pick quantity and add ── */
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ${minPrice.toLocaleString('es-AR')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowComment((v) => !v)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-300"
                      title="Agregar aclaración"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={pendingQty <= 1}
                      onClick={() => setPendingQty((q) => Math.max(1, q - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:hover:border-gray-500"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{pendingQty}</span>
                    <button
                      type="button"
                      onClick={() => setPendingQty((q) => q + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {showComment && (
                  <Textarea
                    placeholder="Ej: sin sal, bien cocido..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                )}

                <Button
                  size="sm"
                  className="w-full"
                  disabled={added || !storeIsOpen}
                  onClick={handleAdd}
                >
                  {added ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                      Agregar — ${(minPrice * pendingQty).toLocaleString('es-AR')}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {product.isCombo && product.comboPrice
                  ? product.comboPrice.type === 'fixed'
                    ? `Desde $${product.comboPrice.value.toLocaleString('es-AR')}`
                    : `${product.comboPrice.value}% OFF`
                  : product.unitPricing
                    ? 'Armá tu pedido'
                    : hasMultipleFormats
                      ? `Desde $${minPrice.toLocaleString('es-AR')}`
                      : `$${minPrice.toLocaleString('es-AR')}`}
              </span>
              <Link to={`/menu/${product.id}`} className={!storeIsOpen ? 'pointer-events-none' : ''}>
                <Button size="sm" disabled={!storeIsOpen}>{product.isCombo ? 'Armar combo' : 'Elegir'}</Button>
              </Link>
            </div>
            {cartQty > 0 && (
              <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                <Check className="h-3 w-3" />
                {cartQty} en el carrito
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
