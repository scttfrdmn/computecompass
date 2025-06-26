import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorAlert } from './ErrorAlert'

describe('ErrorAlert', () => {
  it('should not render when error is null', () => {
    const { container } = render(<ErrorAlert error={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render error message from string', () => {
    render(<ErrorAlert error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should render error message from Error object', () => {
    const error = new Error('Network timeout')
    render(<ErrorAlert error={error} />)
    expect(screen.getByText('Network timeout')).toBeInTheDocument()
  })

  it('should render custom title', () => {
    render(<ErrorAlert error="Test error" title="Custom Error Title" />)
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
  })

  it('should show retry button when showRetry is true', () => {
    const onRetry = vi.fn()
    render(<ErrorAlert error="Test error" showRetry onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn().mockResolvedValue(undefined)
    render(<ErrorAlert error="Test error" showRetry onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', { name: /try again/i })
    await act(async () => {
      fireEvent.click(retryButton)
    })

    expect(onRetry).toHaveBeenCalled()
  })

  it('should show loading state during retry', async () => {
    const onRetry = vi.fn(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    render(<ErrorAlert error="Test error" showRetry onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)

    expect(screen.getByText('Retrying...')).toBeInTheDocument()
    expect(retryButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  it('should show dismiss button when showDismiss is true', () => {
    const onDismiss = vi.fn()
    render(<ErrorAlert error="Test error" showDismiss onDismiss={onDismiss} />)

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    expect(dismissButton).toBeInTheDocument()
  })

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<ErrorAlert error="Test error" showDismiss onDismiss={onDismiss} />)

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismissButton)

    expect(onDismiss).toHaveBeenCalled()
  })

  it('should render warning variant with correct styling', () => {
    const { container } = render(
      <ErrorAlert error="Warning message" variant="warning" />
    )

    const alertContainer = container.querySelector('.bg-yellow-50')
    expect(alertContainer).toHaveClass('bg-yellow-50', 'border-yellow-200')
  })

  it('should render info variant with correct styling', () => {
    const { container } = render(
      <ErrorAlert error="Info message" variant="info" />
    )

    const alertContainer = container.querySelector('.bg-blue-50')
    expect(alertContainer).toHaveClass('bg-blue-50', 'border-blue-200')
  })

  it('should provide helpful context for AWS credential errors', () => {
    render(<ErrorAlert error="AWS credentials not found" />)

    expect(
      screen.getByText(/Make sure your AWS credentials are properly configured/)
    ).toBeInTheDocument()
  })

  it('should provide helpful context for network errors', () => {
    render(<ErrorAlert error="Network timeout occurred" />)

    expect(
      screen.getByText(/Check your internet connection/)
    ).toBeInTheDocument()
  })

  it('should provide helpful context for rate limit errors', () => {
    render(<ErrorAlert error="Rate limit exceeded" />)

    expect(screen.getByText(/AWS API rate limit exceeded/)).toBeInTheDocument()
  })

  it('should provide helpful context for benchmark errors', () => {
    render(<ErrorAlert error="Benchmark data unavailable" />)

    expect(
      screen.getByText(/Performance benchmark data is temporarily unavailable/)
    ).toBeInTheDocument()
  })

  it('should not show help text for unknown errors', () => {
    render(<ErrorAlert error="Unknown error occurred" />)

    expect(screen.queryByText(/💡/)).not.toBeInTheDocument()
  })

  it('should show both retry and dismiss buttons when both are enabled', () => {
    const onRetry = vi.fn()
    const onDismiss = vi.fn()

    render(
      <ErrorAlert
        error="Test error"
        showRetry
        showDismiss
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })
})
