import type { ReactNode } from 'react'
import type { TranslationFunctions } from '@/i18n'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Component } from 'react'
import { useTranslations } from '@/i18n'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  t: TranslationFunctions
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

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="
          flex min-h-[400px] flex-col items-center justify-center p-8
          text-center
        "
        >
          <div className="
            bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center
            rounded-full
          "
          >
            <IconAlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">{this.props.t.common.somethingWentWrong()}</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            {this.state.error?.message || this.props.t.common.unexpectedError()}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-6"
            variant="outline"
          >
            {this.props.t.common.tryAgain()}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component to inject translations
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const t = useTranslations()
  return (
    <ErrorBoundaryComponent t={t} fallback={fallback}>
      {children}
    </ErrorBoundaryComponent>
  )
}
