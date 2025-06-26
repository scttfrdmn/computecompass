import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PricingCard } from './PricingCard'

const mockPricingData = {
  onDemand: 0.1008,
  reserved1yr: 0.0605,
  reserved3yr: 0.0403,
  spotCurrent: 0.0302,
  spotAverage24h: 0.035,
  savingsPlans1yr: 0.058,
  savingsPlans3yr: 0.039,
}

const basicPricingData = {
  onDemand: 0.1008,
  reserved1yr: 0.0605,
  reserved3yr: 0.0403,
  spotCurrent: 0.0302,
}

describe('PricingCard', () => {
  it('should render pricing options and handle overflow', () => {
    render(<PricingCard pricing={mockPricingData} />)

    expect(screen.getByText('Pricing Options')).toBeInTheDocument()
    expect(screen.getByText('Spot Current')).toBeInTheDocument()
    expect(screen.getByText('3yr Reserved')).toBeInTheDocument()
    expect(screen.getByText('1yr Savings')).toBeInTheDocument()
    expect(screen.getByText('3yr Savings')).toBeInTheDocument()

    // On-Demand and 1yr Reserved should be in additional options
    expect(screen.getByText('Additional Options:')).toBeInTheDocument()
    expect(screen.getByText('On-Demand:')).toBeInTheDocument()
    expect(screen.getByText('1yr Reserved:')).toBeInTheDocument()
  })

  it('should format prices correctly', () => {
    render(<PricingCard pricing={basicPricingData} />)

    expect(screen.getByText('$0.1008/hr')).toBeInTheDocument()
    expect(screen.getByText('$0.0605/hr')).toBeInTheDocument()
    expect(screen.getByText('$0.0403/hr')).toBeInTheDocument()
    expect(screen.getByText('$0.0302/hr')).toBeInTheDocument()
  })

  it('should calculate and display savings percentages', () => {
    render(<PricingCard pricing={basicPricingData} />)

    // Spot current should show savings vs on-demand
    expect(screen.getByText('-70%')).toBeInTheDocument() // Spot savings
    expect(screen.getByText('-40%')).toBeInTheDocument() // 1yr reserved savings
    expect(screen.getByText('-60%')).toBeInTheDocument() // 3yr reserved savings
  })

  it('should show badges for best value and flexible options', () => {
    render(<PricingCard pricing={basicPricingData} />)

    expect(screen.getByText('Cheapest')).toBeInTheDocument()
    expect(screen.getByText('Flexible')).toBeInTheDocument()
  })

  it('should display 24h average when available', () => {
    render(<PricingCard pricing={mockPricingData} />)

    expect(screen.getByText('24h avg: $0.0350/hr')).toBeInTheDocument()
  })

  it('should show monthly estimate for best value option', () => {
    render(<PricingCard pricing={basicPricingData} />)

    // Best value is spot current at $0.0302/hr
    const monthlyEstimate = (0.0302 * 730).toFixed(2)
    expect(screen.getByText(`$${monthlyEstimate}/month`)).toBeInTheDocument()
  })

  it('should handle pricing data without savings plans', () => {
    render(<PricingCard pricing={basicPricingData} />)

    expect(screen.queryByText('1yr Savings')).not.toBeInTheDocument()
    expect(screen.queryByText('3yr Savings')).not.toBeInTheDocument()
  })

  it('should hide zero or negative prices', () => {
    const pricingWithZeros = {
      onDemand: 0.1008,
      reserved1yr: 0,
      reserved3yr: 0.0403,
      spotCurrent: -1,
    }

    render(<PricingCard pricing={pricingWithZeros} />)

    expect(screen.getByText('On-Demand')).toBeInTheDocument()
    expect(screen.getByText('3yr Reserved')).toBeInTheDocument()
    expect(screen.queryByText('1yr Reserved')).not.toBeInTheDocument()
    expect(screen.queryByText('Spot Current')).not.toBeInTheDocument()
  })

  it('should sort pricing options by price', () => {
    render(<PricingCard pricing={basicPricingData} />)

    // Get all price containers
    const priceElements = screen.getAllByText(/\$\d+\.\d+\/hr/)

    // Should be sorted: spot ($0.0302), 3yr reserved ($0.0403), 1yr reserved ($0.0605), on-demand ($0.1008)
    expect(priceElements[0]).toHaveTextContent('$0.0302/hr')
    expect(priceElements[1]).toHaveTextContent('$0.0403/hr')
    expect(priceElements[2]).toHaveTextContent('$0.0605/hr')
    expect(priceElements[3]).toHaveTextContent('$0.1008/hr')
  })

  it('should display appropriate descriptions for each pricing type', () => {
    render(<PricingCard pricing={basicPricingData} />)

    expect(
      screen.getByText('Pay-as-you-go with no commitments')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Variable pricing, can be interrupted')
    ).toBeInTheDocument()
    expect(
      screen.getByText('1-year commitment, steady workloads')
    ).toBeInTheDocument()
    expect(
      screen.getByText('3-year commitment, maximum savings')
    ).toBeInTheDocument()
  })

  it('should apply correct styling for best value option', () => {
    const { container } = render(<PricingCard pricing={basicPricingData} />)

    // Spot current should be the cheapest and have green styling
    const spotContainer = container.querySelector(
      '.border-green-200.bg-green-50'
    )
    expect(spotContainer).toBeInTheDocument()
  })

  it('should show flexible badge for on-demand option', () => {
    render(<PricingCard pricing={basicPricingData} />)

    // The Flexible badge should be shown for on-demand
    expect(screen.getByText('Flexible')).toBeInTheDocument()
  })

  it('should handle additional options when more than 4 are available', () => {
    render(<PricingCard pricing={mockPricingData} />)

    // With 6 total options, should show "Additional Options" section
    expect(screen.getByText('Additional Options:')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const { container } = render(
      <PricingCard pricing={basicPricingData} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
