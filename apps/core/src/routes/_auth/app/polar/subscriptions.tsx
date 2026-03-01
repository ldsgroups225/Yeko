import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PricingGrid, useCheckout } from '@/components/payments/polar'
import { collectSubscription, getProducts } from '@/core/functions/payments'

export const Route = createFileRoute('/_auth/app/polar/subscriptions')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: getProducts,
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['subscription'],
        queryFn: collectSubscription,
      }),
    ])
  },
})

function RouteComponent() {
  const { data: products } = useSuspenseQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    refetchOnWindowFocus: true,
  })

  const { data: subscription } = useSuspenseQuery({
    queryKey: ['subscription'],
    queryFn: collectSubscription,
    refetchOnWindowFocus: true,
  })

  const { redirectToCheckout, isCheckoutPending } = useCheckout()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the perfect plan for your needs
        </p>
      </div>

      <PricingGrid
        products={products}
        subscription={subscription}
        onCheckout={redirectToCheckout}
        isCheckoutPending={isCheckoutPending}
      />
    </div>
  )
}
