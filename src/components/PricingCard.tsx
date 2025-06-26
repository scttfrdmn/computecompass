interface PricingOption {
  type:
    | 'On-Demand'
    | '1yr Reserved'
    | '3yr Reserved'
    | 'Spot Current'
    | '1yr Savings'
    | '3yr Savings'
  price: number
  savings?: number
  description: string
  badge?: string
}

interface PricingCardProps {
  pricing: {
    onDemand: number
    reserved1yr: number
    reserved3yr: number
    spotCurrent: number
    spotAverage24h?: number
    savingsPlans1yr?: number
    savingsPlans3yr?: number
  }
  className?: string
}

export function PricingCard({ pricing, className = '' }: PricingCardProps) {
  const formatPrice = (price: number) =>
    price > 0 ? `$${price.toFixed(4)}/hr` : 'N/A'

  const calculateSavings = (original: number, discounted: number) => {
    if (original <= 0 || discounted <= 0) return 0
    return Math.round(((original - discounted) / original) * 100)
  }

  const pricingOptions: PricingOption[] = [
    {
      type: 'On-Demand',
      price: pricing.onDemand,
      description: 'Pay-as-you-go with no commitments',
      badge: 'Flexible',
    },
    {
      type: 'Spot Current',
      price: pricing.spotCurrent,
      savings: calculateSavings(pricing.onDemand, pricing.spotCurrent),
      description: 'Variable pricing, can be interrupted',
      badge: 'Cheapest',
    },
    {
      type: '1yr Reserved',
      price: pricing.reserved1yr,
      savings: calculateSavings(pricing.onDemand, pricing.reserved1yr),
      description: '1-year commitment, steady workloads',
    },
    {
      type: '3yr Reserved',
      price: pricing.reserved3yr,
      savings: calculateSavings(pricing.onDemand, pricing.reserved3yr),
      description: '3-year commitment, maximum savings',
    },
  ]

  // Add savings plans if available
  if (pricing.savingsPlans1yr && pricing.savingsPlans1yr > 0) {
    pricingOptions.push({
      type: '1yr Savings',
      price: pricing.savingsPlans1yr,
      savings: calculateSavings(pricing.onDemand, pricing.savingsPlans1yr),
      description: '1-year compute savings plan',
    })
  }

  if (pricing.savingsPlans3yr && pricing.savingsPlans3yr > 0) {
    pricingOptions.push({
      type: '3yr Savings',
      price: pricing.savingsPlans3yr,
      savings: calculateSavings(pricing.onDemand, pricing.savingsPlans3yr),
      description: '3-year compute savings plan',
    })
  }

  // Sort by price (ascending)
  const sortedOptions = pricingOptions
    .filter(option => option.price > 0)
    .sort((a, b) => a.price - b.price)

  const bestValue = sortedOptions[0]
  const mostFlexible = pricingOptions.find(opt => opt.type === 'On-Demand')

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-900">Pricing Options</h4>
        <div className="text-xs text-gray-500">
          {pricing.spotAverage24h && pricing.spotAverage24h > 0 && (
            <span>24h avg: {formatPrice(pricing.spotAverage24h)}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedOptions.slice(0, 4).map(option => (
          <div
            key={option.type}
            className={`relative p-3 rounded-md border ${
              option === bestValue
                ? 'border-green-200 bg-green-50'
                : option === mostFlexible
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Badge */}
            {option.badge && (
              <div
                className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-medium rounded-full ${
                  option.badge === 'Cheapest'
                    ? 'bg-green-100 text-green-800'
                    : option.badge === 'Flexible'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {option.badge}
              </div>
            )}

            {/* Price and type */}
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="font-medium text-sm text-gray-900">
                  {option.type}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(option.price)}
                </div>
              </div>
              {option.savings && option.savings > 0 && (
                <div className="text-xs font-medium text-green-600">
                  -{option.savings}%
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-xs text-gray-600 leading-tight">
              {option.description}
            </div>
          </div>
        ))}
      </div>

      {/* Additional options if more than 4 */}
      {sortedOptions.length > 4 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Additional Options:</div>
          <div className="flex flex-wrap gap-2">
            {sortedOptions.slice(4).map(option => (
              <div
                key={option.type}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                <span className="font-medium">{option.type}:</span>{' '}
                {formatPrice(option.price)}
                {option.savings && option.savings > 0 && (
                  <span className="text-green-600 ml-1">
                    (-{option.savings}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost comparison */}
      {sortedOptions.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Monthly estimate (730 hrs):</span>{' '}
            {formatPrice(bestValue.price).replace('/hr', '')} × 730 ={' '}
            <span className="font-medium text-gray-900">
              ${(bestValue.price * 730).toFixed(2)}/month
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
