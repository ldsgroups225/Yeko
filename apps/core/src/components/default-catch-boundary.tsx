import type { ErrorComponentProps } from '@tanstack/react-router'
import { IconAlertTriangle, IconArrowLeft, IconBug, IconChevronDown, IconHome, IconMail, IconRefresh } from '@tabler/icons-react'
import { Link, rootRouteId, useMatch, useRouter } from '@tanstack/react-router'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { useState } from 'react'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: state => state.id === rootRouteId,
  })
  const [showDetails, setShowDetails] = useState(false)

  console.error(error)

  // Format error details for display
  const errorMessage = error?.message || 'An unexpected error occurred'
  const errorStack = error?.stack || ''
  const hasStack = errorStack.length > 0

  const handleReportError = () => {
    const subject = encodeURIComponent('Error Report')
    const body = encodeURIComponent(
      `An error occurred in the application:\n\nError: ${errorMessage}\n\nStack Trace:\n${errorStack}\n\nPlease describe what you were doing when this error occurred:`,
    )
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="
              bg-destructive/10 flex h-10 w-10 items-center justify-center
              rounded-full
            "
            >
              <IconAlertTriangle className="text-destructive h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <p className="text-muted-foreground text-sm">
                We encountered an unexpected error. Please try again.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {errorMessage}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="
            flex flex-col gap-3
            sm:flex-row
          "
          >
            <Button
              onClick={() => router.invalidate()}
              className="flex items-center gap-2"
            >
              <IconRefresh className="h-4 w-4" />
              Try Again
            </Button>

            {isRoot
              ? (
                  <Link
                    to="/"
                    className={buttonVariants({ variant: 'outline', className: 'flex items-center gap-2' })}
                  >
                    <IconHome className="h-4 w-4" />
                    Go to Home
                  </Link>
                )
              : (
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                )}
          </div>

          {/* Error Details (Collapsible) */}
          {hasStack && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger
                render={triggerProps => (
                  <button
                    {...triggerProps}
                    type="button"
                    className="
                      text-muted-foreground
                      hover:text-foreground hover:bg-accent
                      flex items-center gap-2 rounded-md px-3 py-2 text-sm
                      font-medium transition-colors
                    "
                  >
                    <IconBug className="h-4 w-4" />
                    Technical Details
                    <IconChevronDown
                      className={`
                        h-4 w-4 transition-transform duration-200
                        ${showDetails
                    ? `rotate-180`
                    : ''}
                      `}
                    />
                  </button>
                )}
              />
              <CollapsibleContent className="space-y-2">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="mb-2 text-sm font-medium">
                    Error Stack Trace:
                  </h4>
                  <pre className="
                    bg-muted border-border/50 mt-4 overflow-x-auto rounded-lg
                    border p-4 font-mono text-xs wrap-break-word
                    whitespace-pre-wrap
                  "
                  >
                    {errorStack}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Help Section */}
          <div className="border-t pt-4">
            <div className="
              flex flex-col items-start justify-between gap-3
              sm:flex-row sm:items-center
            "
            >
              <div className="text-muted-foreground text-sm">
                If this error persists, please report it to our support team.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReportError}
                className="flex items-center gap-2"
              >
                <IconMail className="h-4 w-4" />
                Report Error
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
