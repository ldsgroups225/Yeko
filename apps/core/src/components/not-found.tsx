import {
  IconArrowLeft,
  IconHelpCircle,
  IconHome,
  IconSearch,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            {/* Icon */}
            <div className="
              bg-muted flex h-20 w-20 items-center justify-center rounded-full
            "
            >
              <IconHelpCircle className="text-muted-foreground h-10 w-10" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Page Not Found
              </h1>
              <div className="text-muted-foreground">
                {children || (
                  <p>
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="
              flex w-full flex-col gap-3
              sm:w-auto sm:flex-row
            "
            >
              <Button
                variant="default"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <IconArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Link
                to="/"
                className={buttonVariants({ variant: 'outline', className: 'flex items-center gap-2' })}
              >
                <IconHome className="h-4 w-4" />
                Home
              </Link>
            </div>

            {/* Help text */}
            <div className="w-full border-t pt-4">
              <div className="
                text-muted-foreground flex items-center justify-center gap-2
                text-sm
              "
              >
                <IconSearch className="h-4 w-4" />
                <span>
                  Try checking the URL or use the search functionality
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
