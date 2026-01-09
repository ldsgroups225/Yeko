import type { ErrorInfo, ReactNode } from 'react'
import { IconAlertCircle } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Component } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconAlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Une erreur s'est produite</CardTitle>
              </div>
              <CardDescription>
                Nous sommes désolés, quelque chose s'est mal passé.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <Alert variant="destructive">
                  <AlertTitle>Détails de l'erreur</AlertTitle>
                  <AlertDescription className="mt-2 font-mono text-xs">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline">
                  Réessayer
                </Button>
                <Button onClick={this.handleReload}>
                  Recharger la page
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Si le problème persiste, veuillez contacter le support technique.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Analytics-specific Error Boundary
 * Provides a more specific error message for analytics failures
 */
export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AnalyticsErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconAlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Erreur de chargement des analytiques</CardTitle>
              </div>
              <CardDescription>
                Impossible de charger les données analytiques.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <Alert variant="destructive">
                  <AlertTitle>Détails de l'erreur</AlertTitle>
                  <AlertDescription className="mt-2 font-mono text-xs">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={this.handleReload} className="w-full">
                Recharger la page
              </Button>

              <p className="text-sm text-muted-foreground">
                Les données analytiques peuvent être temporairement indisponibles.
                Veuillez réessayer dans quelques instants.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
