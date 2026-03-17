import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/hooks/useCart'
import { Minus, Plus, ShoppingCart, Check, MessageSquare } from 'lucide-react'

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
  const { addItem, updateQuantity } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!simple) return
    const format = product.formats[0] || { id: 'f-default', name: 'Estándar', price: minPrice }
    const newItem = addItem(product, format, [], comment, [])
    if (quantity > 1) updateQuantity(newItem.cartId, quantity)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setQuantity(1)
      setComment('')
      setShowComment(false)
    }, 1200)
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
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:hover:border-gray-500"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
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
              disabled={added}
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
                  Agregar — ${(minPrice * quantity).toLocaleString('es-AR')}
                </>
              )}
            </Button>
          </div>
        ) : (
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
            <Link to={`/menu/${product.id}`}>
              <Button size="sm">{product.isCombo ? 'Armar combo' : 'Elegir'}</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
