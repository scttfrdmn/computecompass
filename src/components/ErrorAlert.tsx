import { useState } from 'react'

interface ErrorAlertProps {
  error: Error | string | null
  title?: string
  onRetry?: () => void
  onDismiss?: () => void
  showRetry?: boolean
  showDismiss?: boolean
  variant?: 'error' | 'warning' | 'info'
}

export function ErrorAlert({
  error,
  title = 'Error',
  onRetry,
  onDismiss,
  showRetry = false,
  showDismiss = false,
  variant = 'error',
}: ErrorAlertProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  if (!error) return null

  const errorMessage = error instanceof Error ? error.message : error

  const handleRetry = async () => {
    if (!onRetry) return

    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          text: 'text-yellow-700',
          button: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        }
      default: // error
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          text: 'text-red-700',
          button: 'bg-red-100 text-red-800 hover:bg-red-200',
        }
    }
  }

  const styles = getVariantStyles()

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return '⚠'
    }
  }

  const getErrorHelp = (message: string) => {
    // Provide helpful context for common error scenarios
    const lowerMessage = message.toLowerCase()

    if (
      lowerMessage.includes('aws credentials') ||
      lowerMessage.includes('credentials')
    ) {
      return 'Make sure your AWS credentials are properly configured and have the necessary permissions.'
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('timeout')) {
      return 'Check your internet connection and try again. AWS services may be temporarily unavailable.'
    }
    if (
      lowerMessage.includes('rate limit') ||
      lowerMessage.includes('throttling')
    ) {
      return 'AWS API rate limit exceeded. Please wait a moment before trying again.'
    }
    if (lowerMessage.includes('region')) {
      return 'This may be a regional availability issue. Some instance types may not be available in all regions.'
    }
    if (lowerMessage.includes('benchmark')) {
      return 'Performance benchmark data is temporarily unavailable. Instance recommendations will continue without performance insights.'
    }
    return null
  }

  const helpText = getErrorHelp(errorMessage)

  return (
    <div className={`rounded-lg border p-4 ${styles.container}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={`text-lg ${styles.icon}`}>{getIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          <div className={`mt-2 text-sm ${styles.text}`}>
            <p>{errorMessage}</p>
            {helpText && (
              <p className="mt-2 text-xs opacity-90">💡 {helpText}</p>
            )}
          </div>

          {(showRetry || showDismiss) && (
            <div className="mt-3 flex space-x-2">
              {showRetry && onRetry && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRetrying ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-1.5"></div>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <span className="mr-1">↻</span>
                      Try Again
                    </>
                  )}
                </button>
              )}

              {showDismiss && onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${styles.button}`}
                >
                  <span className="mr-1">✕</span>
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
