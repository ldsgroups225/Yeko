import { IconAlertCircle, IconCircleCheck, IconLoader2 } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { z } from 'zod'
import { collectSubscription, validPayment } from '@/core/functions/payments'

const searchSchema = z.object({
  checkout_id: z.string(),
})

export const Route = createFileRoute('/_auth/app/polar/checkout/success')({
  component: RouteComponent,
  validateSearch: search => searchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    return search
  },
  loader: async (input) => {
    const isValid = await validPayment({
      data: input.context.checkout_id,
    })
    return {
      isValid,
      checkoutId: input.context.checkout_id,
    }
  },
  errorComponent: ({ error }) => {
    return (
      <div className="
        h-ful bg-background flex flex-col items-center justify-center px-6 py-12
      "
      >
        <div className="w-full max-w-lg space-y-8 text-center">
          <div className="flex justify-center">
            <IconAlertCircle className="text-destructive h-16 w-16" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Payment Error</h1>
            <p className="
              text-muted-foreground mx-auto max-w-md text-lg leading-relaxed
            "
            >
              An error occurred while processing your payment.
            </p>
          </div>

          <div className="pt-8">
            <p className="text-muted-foreground font-mono text-sm">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    )
  },
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const nav = Route.useNavigate()

  const { data, isPending, isFetching, error } = useQuery({
    queryKey: [loaderData.checkoutId],
    queryFn: collectSubscription,
    refetchInterval: (query) => {
      if (!query.state.data) {
        return 2000
      }
      return false
    },
  })

  const getStatus = () => {
    if (error)
      return 'error'
    if (data)
      return 'success'
    if (isFetching || isPending)
      return 'processing'
    return 'processing'
  }

  const status = getStatus()

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <IconCircleCheck className="text-primary h-16 w-16" />
      case 'error':
        return <IconAlertCircle className="text-destructive h-16 w-16" />
      default:
        return <IconLoader2 className="text-primary h-12 w-12 animate-spin" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Payment Successful!',
          description: 'Your subscription has been activated successfully.',
        }
      case 'error':
        return {
          title: 'Payment Processing Error',
          description:
            'There was an issue processing your payment. Please contact support.',
        }
      default:
        return {
          title: 'Processing Your Payment',
          description:
            'We\'re verifying your payment details. This may take a few moments...',
        }
    }
  }

  const { title, description } = getStatusMessage()

  return (
    <div className="
      bg-background flex h-full flex-col items-center justify-center px-6 py-12
    "
    >
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="flex justify-center">{getStatusIcon()}</div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="
            text-muted-foreground mx-auto max-w-md text-lg leading-relaxed
          "
          >
            {description}
          </p>
        </div>

        <div className="space-y-6">
          {status === 'success' && (
            <Button
              onClick={() => nav({ to: '/app' })}
              size="lg"
              className="px-8 py-3"
            >
              Continue to Dashboard
            </Button>
          )}

          {status === 'error' && (
            <div className="
              flex flex-col justify-center gap-3
              sm:flex-row
            "
            >
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="px-6"
              >
                Try Again
              </Button>
              <Button
                onClick={() => nav({ to: '/app/polar/subscriptions' })}
                size="lg"
                className="px-6"
              >
                Back to Plans
              </Button>
            </div>
          )}
        </div>

        <div className="pt-8">
          <p className="text-muted-foreground text-sm">
            Transaction ID:
            {' '}
            <span className="text-foreground font-mono">
              {loaderData.checkoutId.slice(-8)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
