import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import useStoreStatus from '@/hooks/useStoreStatus'
import { Textarea } from '@/components/ui/textarea'
import { Minus, Plus, ShoppingCart, Check, Trash2, MessageSquare } from 'lucide-react'
import ProductCardShell from './ProductCardShell'

function isImageKey(image) {
  return image && image.startsWith('products/')
}

function isSimpleProduct(product) {
  return (
    !product.hasFlavors &&
    !product.isCombo &&
    product.extras.length === 0 &&
    product.formats.length <= 1
  )
}

function ProductCardImage({ image }) {
  const [broken, setBroken] = useState(false)
  if (isImageKey(image) && !broken) {
    return (
      <img
        src={`/${image}`}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    )
  }
  return <span className="text-4xl">{broken ? '🍽️' : (image || '🍽️')}</span>
}

/* ── Quantity controls (top-right of card) ────────────── */
function QtyControls({ qty, onIncrement, onDecrement, disabled }) {
  return (
    <div className="flex items-center gap-1">
      {qty > 0 && (
        <button
          type="button"
          onClick={onDecrement}
          disabled={disabled}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
        >
          <Minus className="h-3 w-3" />
        </button>
      )}
      {qty > 0 && (
        <span className="w-4 text-center text-xs font-semibold">{qty}</span>
      )}
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
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
  const navigate = useNavigate()

  // Find existing cart item for this simple product
  const cartItem = simple
    ? items.find((i) => i.productId === product.id && !i.comboSteps)
    : null
  const inCart = !!cartItem

  // Count total quantity of this product in cart (all variants)
  const cartQty = items
    .filter((i) => i.productId === product.id)
    .reduce((sum, i) => sum + i.quantity, 0)

  const [added, setAdded] = useState(false)
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)

  function handleSimpleAdd() {
    if (!simple) return
    const format = product.formats[0] || { id: 'f-default', name: 'Estándar', price: minPrice }
    addItem(product, format, [], comment, [])
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
    }, 1200)
  }

  function handleSimpleIncrement() {
    if (inCart) {
      updateQuantity(cartItem.cartId, cartItem.quantity + 1)
    } else {
      handleSimpleAdd()
    }
  }

  function handleSimpleDecrement() {
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

  function handleNonSimpleIncrement() {
    navigate(`/menu/${product.id}`)
  }

  function handleNonSimpleDecrement() {
    // Remove the last-added item for this product
    const productItems = items.filter((i) => i.productId === product.id)
    if (productItems.length > 0) {
      const last = productItems[productItems.length - 1]
      if (last.quantity > 1) {
        updateQuantity(last.cartId, last.quantity - 1)
      } else {
        removeItem(last.cartId)
      }
    }
  }

  // ── Price label logic ──────────────────────────────
  function getPriceLabel() {
    if (product.isCombo) {
      if (product.comboPrice?.type === 'fixed') {
        return `Armar — $${product.comboPrice.value.toLocaleString('es-AR')}`
      }
      return `Armar — ${product.comboPrice?.value}% dto.`
    }
    if (product.unitPricing && product.minItemPrice) {
      return `Agregar — desde $${product.minItemPrice.toLocaleString('es-AR')} c/u`
    }
    if (hasMultipleFormats) {
      return `Agregar — desde $${minPrice.toLocaleString('es-AR')}`
    }
    return `Agregar — $${minPrice.toLocaleString('es-AR')}`
  }

  // ── Top-right controls ─────────────────────────────
  const topActions = (
    <div className="flex items-center gap-1">
      {simple && (
        <button
          type="button"
          onClick={() => setShowComment(!showComment)}
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
            showComment || comment
              ? 'border-primary text-primary'
              : 'border-gray-200 text-gray-400 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'
          }`}
        >
          <MessageSquare className="h-3 w-3" />
        </button>
      )}
      {simple ? (
        <QtyControls
          qty={inCart ? cartItem.quantity : 0}
          onIncrement={handleSimpleIncrement}
          onDecrement={handleSimpleDecrement}
          disabled={!storeIsOpen}
        />
      ) : (
        <QtyControls
          qty={cartQty}
          onIncrement={handleNonSimpleIncrement}
          onDecrement={handleNonSimpleDecrement}
          disabled={!storeIsOpen}
        />
      )}
    </div>
  )

  return (
    <ProductCardShell
      image={<ProductCardImage image={product.image} />}
      name={product.name}
      description={product.description}
      isCombo={product.isCombo}
      actions={topActions}
    >
        {showComment && simple && (
          <Textarea
            placeholder="Aclaraciones..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="text-sm"
          />
        )}
        {simple ? (
          <div className="space-y-2">
            {inCart ? (
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
            ) : (
              <Button
                size="sm"
                className="w-full"
                disabled={added || !storeIsOpen}
                onClick={handleSimpleAdd}
              >
                {added ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5" />
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                    Agregar — ${minPrice.toLocaleString('es-AR')}
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            {cartQty > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="flex-none"
                onClick={handleNonSimpleDecrement}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Link to={`/menu/${product.id}`} className={`flex-1 ${!storeIsOpen ? 'pointer-events-none' : ''}`}>
              <Button size="sm" className="w-full" disabled={!storeIsOpen}>
                <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                {getPriceLabel()}
              </Button>
            </Link>
          </div>
        )}
    </ProductCardShell>
  )
}
