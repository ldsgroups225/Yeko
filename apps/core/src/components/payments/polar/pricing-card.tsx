import type { Price, Product, Subscription } from './types'
import { IconCheck } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'

interface PricingCardProps {
  product: Product
  subscription: Subscription
  onCheckout: (productId: string) => void
  isCheckoutPending: boolean
}

export function PricingCard({
  product,
  subscription,
  onCheckout,
  isCheckoutPending,
}: PricingCardProps) {
  const price = product.prices[0]

  if (!price) {
    return (
      <Card key={product.id} className="relative opacity-50">
        <CardHeader>
          <CardTitle className="text-xl">{product.name}</CardTitle>
          {product.description && (
            <CardDescription>{product.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-3xl font-bold">Price unavailable</div>
          </div>
          <Button disabled className="w-full" size="lg">
            Unavailable
          </Button>
        </CardContent>
      </Card>
    )
  }

  const formatPrice = (price: Price) => {
    if (!price) {
      return 'Price unavailable'
    }

    if (price.amountType === 'fixed' && price.priceAmount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.priceCurrency.toUpperCase(),
      }).format(price.priceAmount / 100)
    }

    if (price.amountType === 'custom') {
      const min = price.minimumAmount ? price.minimumAmount / 100 : 0
      const max = price.maximumAmount ? price.maximumAmount / 100 : null
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.priceCurrency.toUpperCase(),
      })

      if (max) {
        return `${formatter.format(min)} - ${formatter.format(max)}`
      }
      return `From ${formatter.format(min)}`
    }

    return 'Custom pricing'
  }

  const getFeatures = (metadata: Record<string, any>) => {
    return Object.entries(metadata)
      .filter(([key]) => key.includes('feature'))
      .map(([, value]) => value)
  }

  const features = getFeatures(product.metadata)

  const renderButton = () => {
    if (subscription) {
      if (subscription.productId === price.productId) {
        return (
          <div className="space-y-2">
            <div className="text-center">
              <Badge variant="default" className="mb-2">
                Current Plan
              </Badge>
              <p className="text-muted-foreground text-sm">
                Status:
                {' '}
                {subscription.status}
              </p>
            </div>
            <Link
              to="/app/polar/portal"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full' })}
            >
              Manage Subscription
            </Link>
          </div>
        )
      }
      else {
        return (
          <div className="text-center">
            <p className="text-muted-foreground mb-4 text-sm">
              Manage your subscription in the portal
            </p>
            <Link
              to="/app/polar/portal"
              className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'w-full' })}
            >
              Go to Portal
            </Link>
          </div>
        )
      }
    }

    return (
      <Button
        disabled={isCheckoutPending}
        onClick={() => onCheckout(price.productId)}
        className="w-full"
        size="lg"
      >
        Get Started
      </Button>
    )
  }

  return (
    <Card key={product.id} className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{product.name}</CardTitle>
          {product.isRecurring && (
            <Badge variant="secondary">{product.recurringInterval}</Badge>
          )}
        </div>
        {product.description && (
          <CardDescription>{product.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="text-3xl font-bold">{formatPrice(price)}</div>
          {product.isRecurring && (
            <div className="text-muted-foreground text-sm">
              per
              {' '}
              {product.recurringInterval}
            </div>
          )}
        </div>

        {features.length > 0 && (
          <div className="mb-6 space-y-3">
            {features.map(feature => (
              <div
                key={`feature-${feature
                  .toString()
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')}`}
                className="flex items-start gap-2"
              >
                <IconCheck className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {renderButton()}
      </CardContent>
    </Card>
  )
}
