/**
 * Types and interfaces for consumption planning and cost optimization
 */

// Seasonal usage patterns for research workloads
export interface SeasonalPattern {
  type: 'steady' | 'academic' | 'grant-based' | 'seasonal' | 'custom'
  peakMonths?: number[] // Month indices (0-11) for peak usage
  lowMonths?: number[] // Month indices for low usage
  peakMultiplier?: number // Multiplier for peak usage (e.g., 2.0 = double normal)
  description?: string
}

// Workload execution patterns
export interface WorkloadPattern {
  id: string
  name: string
  description: string

  // Usage frequency and timing
  runsPerDay: number
  avgDurationHours: number
  daysPerWeek: number // Typical days per week this workload runs

  // Resource requirements
  instanceRequirements: {
    vCpus: number
    memoryGiB: number
    gpuRequired: boolean
    storageGiB?: number
    networkIntensive?: boolean
  }

  // Patterns and scheduling
  seasonality: SeasonalPattern
  timeOfDay?: 'business-hours' | 'off-hours' | 'any' | 'scheduled'
  interruptible?: boolean // Can use spot instances

  // Business context
  priority: 'critical' | 'high' | 'normal' | 'low'
  team?: string
  project?: string

  // Advanced patterns
  burstCapacity?: {
    enabled: boolean
    maxConcurrentJobs: number
    burstDurationHours: number
    burstFrequency: 'daily' | 'weekly' | 'monthly'
  }
}

// Purchase strategy recommendations
export interface PurchaseStrategy {
  id: string
  instanceType: string
  quantity: number // Number of instances to purchase

  // Purchase details
  purchaseType: 'reserved' | 'savings-plan' | 'spot' | 'on-demand'
  commitment?: '1yr' | '3yr'
  paymentOption?: 'no-upfront' | 'partial-upfront' | 'all-upfront'

  // Cost and utilization
  hourlyCost: number
  monthlyCost: number
  estimatedUtilization: number // Expected utilization percentage

  // Strategy context
  purpose: string // Why this purchase is recommended
  coveredWorkloads: string[] // Workload IDs this strategy covers
  riskLevel: 'low' | 'medium' | 'high'
}

// Cost breakdown and analysis
export interface CostBreakdown {
  reserved: {
    monthlyCost: number
    instances: number
    utilizationRate: number
  }
  savingsPlans: {
    monthlyCost: number
    commitmentAmount: number
    utilizationRate: number
  }
  spot: {
    monthlyCost: number
    estimatedSavings: number
    interruptionRisk: number
  }
  onDemand: {
    monthlyCost: number
    instances: number
    usage: 'peak' | 'burst' | 'overflow'
  }
  total: {
    monthlyCost: number
    annualCost: number
  }
}

// Comprehensive consumption plan
export interface ConsumptionPlan {
  id: string
  name: string
  createdAt: Date

  // Input workloads
  workloadPatterns: WorkloadPattern[]
  planningHorizon: '1yr' | '3yr'

  // Recommendations
  recommendedPurchases: PurchaseStrategy[]
  costBreakdown: CostBreakdown

  // Analysis and savings
  analysis: {
    totalMonthlyCost: number
    vsAllOnDemandSavings: {
      amount: number
      percentage: number
    }
    vsCurrentSetupSavings?: {
      amount: number
      percentage: number
    }
    paybackPeriod?: number // Months to recover upfront costs
    confidence: number // 0-100 confidence in recommendations
  }

  // Risk assessment
  risks: {
    spotInterruption: number // Risk of spot instance interruption
    underUtilization: number // Risk of reserved capacity waste
    overCommitment: number // Risk of insufficient capacity
  }

  // Recommendations and insights
  recommendations: string[]
  insights: string[]
  warnings?: string[]
}

// Predefined workload pattern templates
export interface WorkloadTemplate {
  id: string
  name: string
  category:
    | 'batch-computing'
    | 'interactive'
    | 'data-processing'
    | 'ml-training'
    | 'web-services'
  description: string

  // Default pattern values
  defaultPattern: Partial<WorkloadPattern>

  // Customization options
  configurableFields: (keyof WorkloadPattern)[]

  // Usage examples and guidance
  examples: string[]
  bestPractices: string[]
}

// Enterprise discount configuration
export interface DiscountProfile {
  organizationName?: string

  // AWS Enterprise programs
  edpDiscount?: number // Enterprise Discount Program percentage
  ppaDiscounts?: Record<string, number> // Private Pricing Agreement by instance family

  // Credits and allocations
  availableCredits: number
  creditExpirationDate?: Date
  monthlyBudget?: number

  // Volume discounts
  volumeDiscounts?: {
    threshold: number // Minimum monthly spend
    discount: number // Additional discount percentage
  }[]
}

// Historical usage data for pattern learning
export interface UsageHistory {
  workloadId: string
  month: string // YYYY-MM format
  actualUsage: {
    totalHours: number
    peakConcurrentInstances: number
    averageUtilization: number
    instanceTypes: Record<string, number> // instance type -> hours
  }
  cost: {
    total: number
    breakdown: Record<string, number> // purchase type -> cost
  }
}

// Cost optimization constraints and preferences
export interface OptimizationConstraints {
  maxCommitment?: '1yr' | '3yr' // Maximum commitment period
  maxUpfrontPayment?: number // Maximum upfront payment in USD
  prioritizeCost?: boolean // Prioritize cost savings over reliability
  riskTolerance?: 'low' | 'medium' | 'high' // Risk tolerance level
  flexibilityRequired?: boolean // Need for instance type flexibility
  reliabilityRequired?: boolean // Need for high availability
  spotInstancesAllowed?: boolean // Allow spot instance usage
  minReservedPercentage?: number // Minimum percentage of reserved capacity
  maxSpotPercentage?: number // Maximum percentage of spot capacity
}

// Risk assessment profile
export interface RiskProfile {
  overall: 'low' | 'medium' | 'high'
  spotInterruption: number // Probability of spot interruption (0-1)
  costVariability: 'low' | 'medium' | 'high' // Cost volatility level
  commitmentRisk: 'low' | 'medium' | 'high' // Risk of over-commitment
}

// Complete optimization result
export interface OptimizationResult {
  id: string
  optimalStrategy: PurchaseStrategy[] // Best strategy mix
  alternativeScenarios: PurchaseStrategy[][] // Alternative options
  costSavings: {
    monthlySavings: number
    annualSavings: number
    savingsPercentage: number
  }
  riskAssessment: RiskProfile
  recommendations: string[] // Optimization recommendations
  confidenceLevel: number // 0-100 confidence in optimization
  optimizationMetrics: {
    strategiesCount: number
    purchaseTypeDistribution: Record<string, number>
    averageUtilization: number
    riskDistribution: Record<string, number>
  }
}
