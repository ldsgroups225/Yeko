import {
  IconAlertCircle,
  IconBolt,
  IconCircleCheck,
  IconCode,
  IconLoader2,
  IconPlayerPlay,
  IconServer,
} from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { useState } from 'react'
import { examplefunction } from '@/core/functions/example-functions'

export function MiddlewareDemo() {
  const [inputValue, setInputValue] = useState('Hello TanStack Start!')

  const mutation = useMutation({
    mutationFn: examplefunction,
    onSuccess: (data) => {
      console.warn('Client: Server function executed successfully:', data)
    },
    onError: (error) => {
      console.error('Client: Server function failed:', error)
    },
  })

  const handleExecute = () => {
    mutation.mutate({
      data: {
        exampleKey: 'exampleValue',
      },
    })
  }

  return (
    <section className="from-background to-muted/20 bg-linear-to-b py-24">
      <div className="
        container mx-auto px-4
        sm:px-6
        lg:px-8
      "
      >
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            <IconServer className="mr-2 h-4 w-4" />
            Server Functions & Middleware
          </Badge>
          <h2 className="
            mb-4 text-3xl font-bold tracking-tight
            lg:text-4xl
          "
          >
            Server-Side Data Flow
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            See TanStack Start's middleware and server functions in action with
            TanStack Query. Check your server logs to see the execution flow!
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="
            grid gap-8
            lg:grid-cols-2
          "
          >
            {/* Demo Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconPlayerPlay className="text-primary mr-2 h-5 w-5" />
                  Interactive Demo
                </CardTitle>
                <CardDescription>
                  Execute a server function with middleware through TanStack
                  Query
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="input-value"
                    className="mb-2 block text-sm font-medium"
                  >
                    Message to Send
                  </label>
                  <input
                    id="input-value"
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="
                      border-border bg-background
                      focus:ring-primary
                      w-full rounded-lg border px-3 py-2 transition-colors
                      focus:border-transparent focus:ring-2
                    "
                    placeholder="Enter a message..."
                  />
                </div>

                <Button
                  onClick={handleExecute}
                  disabled={mutation.isPending || !inputValue.trim()}
                  className="w-full"
                >
                  {mutation.isPending
                    ? (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      )
                    : (
                        <IconBolt className="mr-2 h-4 w-4" />
                      )}
                  Execute Server Function
                </Button>

                {/* Status Display */}
                <div className="space-y-2">
                  {mutation.isPending && (
                    <Alert>
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Executing server function with middleware...
                      </AlertDescription>
                    </Alert>
                  )}

                  {mutation.isSuccess && (
                    <Alert className="border-primary/50 bg-primary/10">
                      <IconCircleCheck className="text-primary h-4 w-4" />
                      <AlertDescription className="text-primary">
                        <strong>Success!</strong>
                        {' '}
                        Response: "
                        {mutation.data}
                        "
                      </AlertDescription>
                    </Alert>
                  )}

                  {mutation.isError && (
                    <Alert className="border-destructive/50 bg-destructive/10">
                      <IconAlertCircle className="text-destructive h-4 w-4" />
                      <AlertDescription className="text-destructive">
                        <strong>Error:</strong>
                        {' '}
                        {mutation.error?.message || 'Something went wrong'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Architecture Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconCode className="text-primary mr-2 h-5 w-5" />
                  What's Happening
                </CardTitle>
                <CardDescription>
                  The execution flow and server-side processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="
                      text-muted-foreground text-sm font-semibold tracking-wide
                      uppercase
                    "
                    >
                      Execution Flow
                    </h4>
                    <ol className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <span className="
                          bg-primary text-primary-foreground mt-0.5 mr-3 flex
                          h-6 w-6 shrink-0 items-center justify-center
                          rounded-full text-xs font-medium
                        "
                        >
                          1
                        </span>
                        <span>
                          Client sends request via TanStack Query mutation
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="
                          bg-primary text-primary-foreground mt-0.5 mr-3 flex
                          h-6 w-6 shrink-0 items-center justify-center
                          rounded-full text-xs font-medium
                        "
                        >
                          2
                        </span>
                        <span>
                          Middleware executes first (adds context data)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="
                          bg-primary text-primary-foreground mt-0.5 mr-3 flex
                          h-6 w-6 shrink-0 items-center justify-center
                          rounded-full text-xs font-medium
                        "
                        >
                          3
                        </span>
                        <span>Input validation with Zod schema</span>
                      </li>
                      <li className="flex items-start">
                        <span className="
                          bg-primary text-primary-foreground mt-0.5 mr-3 flex
                          h-6 w-6 shrink-0 items-center justify-center
                          rounded-full text-xs font-medium
                        "
                        >
                          4
                        </span>
                        <span>Server function handler executes</span>
                      </li>
                      <li className="flex items-start">
                        <span className="
                          bg-primary text-primary-foreground mt-0.5 mr-3 flex
                          h-6 w-6 shrink-0 items-center justify-center
                          rounded-full text-xs font-medium
                        "
                        >
                          5
                        </span>
                        <span>Response sent back to client</span>
                      </li>
                    </ol>
                  </div>

                  <div className="border-border border-t pt-4">
                    <Alert>
                      <IconServer className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Check your server logs!</strong>
                        {' '}
                        You'll see
                        console output from both the middleware and server
                        function execution.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="text-muted-foreground space-y-2 text-xs">
                    <p>
                      <strong>Files involved:</strong>
                    </p>
                    <ul className="ml-4 space-y-1">
                      <li>
                        •
                        {' '}
                        <code>src/core/middleware/example-middleware.ts</code>
                      </li>
                      <li>
                        •
                        {' '}
                        <code>src/core/functions/example-functions.ts</code>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="bg-muted/50 mt-8 rounded-xl p-6">
            <h3 className="mb-3 flex items-center text-lg font-semibold">
              <IconBolt className="text-primary mr-2 h-5 w-5" />
              Key Benefits
            </h3>
            <div className="
              grid gap-4 text-sm
              md:grid-cols-3
            "
            >
              <div>
                <strong className="text-foreground">Type-Safe</strong>
                <p className="text-muted-foreground">
                  Full TypeScript support with Zod validation
                </p>
              </div>
              <div>
                <strong className="text-foreground">Server-First</strong>
                <p className="text-muted-foreground">
                  Execute secure server-side logic seamlessly
                </p>
              </div>
              <div>
                <strong className="text-foreground">Middleware Ready</strong>
                <p className="text-muted-foreground">
                  Composable middleware for authentication, logging, etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
