import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('renders the ComputeCompass title', () => {
    render(<Header />)
    expect(screen.getByText('ComputeCompass')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<Header />)
    expect(
      screen.getByText('AWS Instance Selector for Research Computing')
    ).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Workloads')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('has a GitHub link that opens in a new tab', () => {
    render(<Header />)
    const githubLink = screen.getByText('GitHub').closest('a')
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/scttfrdmn/computecompass'
    )
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
