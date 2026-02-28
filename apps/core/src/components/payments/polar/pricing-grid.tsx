import type { Product, Products, Subscription } from './types'
import { PricingCard } from './pricing-card'

interface PricingGridProps {
  products: Products
  subscription: Subscription
  onCheckout: (productId: string) => void
  isCheckoutPending: boolean
}

export function PricingGrid({
  products,
  subscription,
  onCheckout,
  isCheckoutPending,
}: PricingGridProps) {
  const sortedProducts = products.sort((a, b) => {
    const aAmount
      = a.prices[0]?.amountType === 'fixed' ? a.prices[0].priceAmount : 0
    const bAmount
      = b.prices[0]?.amountType === 'fixed' ? b.prices[0].priceAmount : 0
    return aAmount - bAmount
  })

  return (
    <div className="
      grid grid-cols-1 gap-6
      md:grid-cols-2
      lg:grid-cols-3
    "
    >
      {sortedProducts.map(product => (
        <PricingCard
          key={product.id}
          product={product}
          subscription={subscription}
          onCheckout={onCheckout}
          isCheckoutPending={isCheckoutPending}
        />
      ))}
    </div>
  )
}
