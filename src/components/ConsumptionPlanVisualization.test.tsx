import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ConsumptionPlanVisualization } from './ConsumptionPlanVisualization'
import type { OptimizationResult } from '../types/consumption'

// Mock optimization result for testing
const mockOptimizationResult: OptimizationResult = {
  id: 'test-optimization-123',
  optimalStrategy: [
    {
      id: 'strategy-reserved',
      instanceType: 'm7i.large',
      quantity: 5,
      purchaseType: 'reserved',
      commitment: '1yr',
      paymentOption: 'partial-upfront',
      hourlyCost: 0.12,
      monthlyCost: 432,
      estimatedUtilization: 85,
      purpose: 'Base capacity for predictable workloads',
      coveredWorkloads: ['workload-1', 'workload-2'],
      riskLevel: 'low',
    },
    {
      id: 'strategy-spot',
      instanceType: 'c7i.large',
      quantity: 0,
      purchaseType: 'spot',
      hourlyCost: 0.04,
      monthlyCost: 288,
      estimatedUtilization: 65,
      purpose: 'Cost-effective capacity for interruptible workloads',
      coveredWorkloads: ['workload-3'],
      riskLevel: 'medium',
    },
    {
      id: 'strategy-ondemand',
      instanceType: 'm7i.xlarge',
      quantity: 0,
      purchaseType: 'on-demand',
      hourlyCost: 0.19,
      monthlyCost: 137,
      estimatedUtilization: 25,
      purpose: 'Flexible capacity for burst workloads',
      coveredWorkloads: ['workload-1', 'workload-2', 'workload-3'],
      riskLevel: 'low',
    },
  ],
  alternativeScenarios: [
    [
      {
        id: 'alt-strategy-1',
        instanceType: 'c7i.2xlarge',
        quantity: 3,
        purchaseType: 'reserved',
        commitment: '3yr',
        hourlyCost: 0.24,
        monthlyCost: 518,
        estimatedUtilization: 90,
        purpose: 'Conservative alternative',
        coveredWorkloads: ['workload-1'],
        riskLevel: 'low',
      },
    ],
    [
      {
        id: 'alt-strategy-2',
        instanceType: 'c7i.large',
        quantity: 0,
        purchaseType: 'spot',
        hourlyCost: 0.05,
        monthlyCost: 360,
        estimatedUtilization: 70,
        purpose: 'Aggressive cost optimization',
        coveredWorkloads: ['workload-2'],
        riskLevel: 'high',
      },
    ],
  ],
  costSavings: {
    monthlySavings: 1250,
    annualSavings: 15000,
    savingsPercentage: 32.5,
  },
  riskAssessment: {
    overall: 'medium',
    spotInterruption: 0.08,
    costVariability: 'medium',
    commitmentRisk: 'low',
  },
  recommendations: [
    'Consider increasing spot instance usage for non-critical workloads to achieve additional cost savings',
    'Monitor usage patterns during the first month to validate Reserved Instance sizing',
    'Set up automated scaling policies to optimize spot instance utilization',
  ],
  confidenceLevel: 87,
  optimizationMetrics: {
    strategiesCount: 3,
    purchaseTypeDistribution: {
      reserved: 1,
      spot: 1,
      'on-demand': 1,
    },
    averageUtilization: 58.3,
    riskDistribution: {
      low: 2,
      medium: 1,
      high: 0,
    },
  },
}

describe('ConsumptionPlanVisualization', () => {
  it('renders the visualization component', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    expect(screen.getByText('Consumption Plan Optimization')).toBeInTheDocument()
    expect(screen.getByText('AI-powered cost optimization for research computing workloads')).toBeInTheDocument()
  })

  it('displays cost savings information correctly', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    expect(screen.getByText('$1,250')).toBeInTheDocument() // Monthly savings
    expect(screen.getByText('$15,000')).toBeInTheDocument() // Annual savings
    expect(screen.getByText('32.5%')).toBeInTheDocument() // Savings percentage
  })

  it('shows strategy composition in overview tab', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    expect(screen.getByText('Strategy Composition')).toBeInTheDocument()
    expect(screen.getByText('reserved')).toBeInTheDocument()
    expect(screen.getByText('spot')).toBeInTheDocument()
    expect(screen.getByText('on demand')).toBeInTheDocument()
  })

  it('displays risk assessment correctly', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    expect(screen.getByText('Risk Assessment')).toBeInTheDocument()
    expect(screen.getAllByText('MEDIUM')).toHaveLength(2) // Overall risk and cost variability
    expect(screen.getByText('8.0%')).toBeInTheDocument() // Spot interruption risk
  })

  it('shows confidence level with progress bar', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    expect(screen.getByText('Recommendation Confidence')).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
    expect(screen.getByText('Based on workload analysis and historical patterns')).toBeInTheDocument()
  })

  it('switches to strategies tab and displays strategy details', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    expect(screen.getByText('Optimal Purchase Strategies')).toBeInTheDocument()
    expect(screen.getByText('m7i.large')).toBeInTheDocument()
    expect(screen.getByText('c7i.large')).toBeInTheDocument()
    expect(screen.getByText('Base capacity for predictable workloads')).toBeInTheDocument()
  })

  it('displays strategy details including costs and utilization', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    // Check for strategy details
    expect(screen.getByText('$0.120')).toBeInTheDocument() // Hourly cost
    expect(screen.getByText('$432')).toBeInTheDocument() // Monthly cost
    expect(screen.getAllByText('85%')).toHaveLength(1) // Utilization appears once in strategies tab
  })

  it('shows purchase type and risk level badges', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    expect(screen.getAllByText('reserved')).toHaveLength(2) // One in overview, one in strategies
    expect(screen.getAllByText('spot')).toHaveLength(2) // One in overview, one in strategies
    expect(screen.getAllByText('low risk')).toHaveLength(2) // Two strategies with low risk
    expect(screen.getByText('medium risk')).toBeInTheDocument()
  })

  it('displays alternative scenarios', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    expect(screen.getByText('Alternative Scenarios')).toBeInTheDocument()
    expect(screen.getByText(/Consider these alternatives/)).toBeInTheDocument()
    expect(screen.getByText('Scenario 1')).toBeInTheDocument()
    expect(screen.getByText('Scenario 2')).toBeInTheDocument()
  })

  it('switches to analysis tab and displays recommendations', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const analysisTab = screen.getByText('Analysis')
    fireEvent.click(analysisTab)
    
    expect(screen.getByText('Optimization Recommendations')).toBeInTheDocument()
    expect(screen.getByText(/Consider increasing spot instance usage/)).toBeInTheDocument()
    expect(screen.getByText(/Monitor usage patterns during the first month/)).toBeInTheDocument()
  })

  it('displays optimization metrics in analysis tab', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const analysisTab = screen.getByText('Analysis')
    fireEvent.click(analysisTab)
    
    expect(screen.getByText('Optimization Metrics')).toBeInTheDocument()
    expect(screen.getByText('Strategy Distribution')).toBeInTheDocument()
    expect(screen.getByText('Risk Distribution')).toBeInTheDocument()
    expect(screen.getByText('58.3%')).toBeInTheDocument() // Average utilization
  })

  it('shows implementation timeline in analysis tab', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const analysisTab = screen.getByText('Analysis')
    fireEvent.click(analysisTab)
    
    expect(screen.getByText('Implementation Timeline')).toBeInTheDocument()
    expect(screen.getByText('Immediate Actions')).toBeInTheDocument()
    expect(screen.getByText(/Short Term/)).toBeInTheDocument()
    expect(screen.getByText(/Long Term/)).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <ConsumptionPlanVisualization 
        optimization={mockOptimizationResult} 
        className="custom-test-class"
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-test-class')
  })

  it('handles empty alternative scenarios gracefully', () => {
    const optimizationWithoutAlternatives = {
      ...mockOptimizationResult,
      alternativeScenarios: [],
    }
    
    render(<ConsumptionPlanVisualization optimization={optimizationWithoutAlternatives} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    expect(screen.queryByText('Alternative Scenarios')).not.toBeInTheDocument()
  })

  it('handles zero cost savings correctly', () => {
    const optimizationWithZeroSavings = {
      ...mockOptimizationResult,
      costSavings: {
        monthlySavings: 0,
        annualSavings: 0,
        savingsPercentage: 0,
      },
    }
    
    render(<ConsumptionPlanVisualization optimization={optimizationWithZeroSavings} />)
    
    expect(screen.getAllByText('$0')).toHaveLength(2) // Monthly and annual zero savings displayed
    expect(screen.getByText('0.0%')).toBeInTheDocument() // Zero percentage
  })

  it('displays commitment periods when present', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    expect(screen.getByText('1yr')).toBeInTheDocument() // Commitment period in strategies section
  })

  it('handles dynamic quantity strategies', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    expect(screen.getAllByText('Dynamic')).toHaveLength(2) // For strategies with quantity 0
    expect(screen.getByText('5')).toBeInTheDocument() // For strategies with fixed quantity
  })

  it('shows correct risk colors for different risk levels', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    const lowRiskElements = screen.getAllByText('low risk')
    const mediumRiskElement = screen.getByText('medium risk')
    
    expect(lowRiskElements[0]).toHaveClass('text-green-600')
    expect(mediumRiskElement).toHaveClass('text-yellow-600')
  })

  it('displays purchase type colors correctly', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    const reservedElements = screen.getAllByText('reserved')
    const spotElements = screen.getAllByText('spot')
    
    // Check that at least one element has the correct classes
    expect(reservedElements.some(el => el.classList.contains('bg-blue-100'))).toBe(true)
    expect(spotElements.some(el => el.classList.contains('bg-green-100'))).toBe(true)
  })

  it('displays all tab navigation correctly', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Strategies')).toBeInTheDocument()
    expect(screen.getByText('Analysis')).toBeInTheDocument()
  })

  it('handles high confidence levels', () => {
    const highConfidenceOptimization = {
      ...mockOptimizationResult,
      confidenceLevel: 95,
    }
    
    render(<ConsumptionPlanVisualization optimization={highConfidenceOptimization} />)
    
    expect(screen.getByText('95%')).toBeInTheDocument()
  })

  it('handles high risk scenarios', () => {
    const highRiskOptimization = {
      ...mockOptimizationResult,
      riskAssessment: {
        overall: 'high' as const,
        spotInterruption: 0.15,
        costVariability: 'high' as const,
        commitmentRisk: 'high' as const,
      },
    }
    
    render(<ConsumptionPlanVisualization optimization={highRiskOptimization} />)
    
    expect(screen.getAllByText('HIGH')).toHaveLength(2) // Overall risk and cost variability
    expect(screen.getByText('15.0%')).toBeInTheDocument()
  })

  it('displays workload coverage information', () => {
    render(<ConsumptionPlanVisualization optimization={mockOptimizationResult} />)
    
    const strategiesTab = screen.getByText('Strategies')
    fireEvent.click(strategiesTab)
    
    // Check that strategies show their purposes which indicate workload coverage
    expect(screen.getByText('Base capacity for predictable workloads')).toBeInTheDocument()
    expect(screen.getByText('Cost-effective capacity for interruptible workloads')).toBeInTheDocument()
    expect(screen.getByText('Flexible capacity for burst workloads')).toBeInTheDocument()
  })
})