import type { ReactNode } from 'react'
import type { WithTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface Props extends WithTranslation {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">{this.props.t('common.somethingWentWrong')}</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {this.state.error?.message || this.props.t('common.unexpectedError')}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-6"
            variant="outline"
          >
            {this.props.t('common.tryAgain')}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent)
