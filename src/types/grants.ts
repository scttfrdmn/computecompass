/**
 * Types and interfaces for grant budget management and tracking
 */

// Grant funding sources and types
export type FundingAgency =
  | 'NSF'
  | 'NIH'
  | 'DOE'
  | 'DOD'
  | 'NASA'
  | 'DARPA'
  | 'ERC'
  | 'Horizon Europe'
  | 'Wellcome Trust'
  | 'Gates Foundation'
  | 'Private Foundation'
  | 'Industry'
  | 'Internal'
  | 'Other'

export type GrantType =
  | 'R01'
  | 'R21'
  | 'SBIR'
  | 'STTR'
  | 'Training Grant'
  | 'Career Award'
  | 'Equipment Grant'
  | 'Collaborative'
  | 'International'
  | 'Industry Sponsored'
  | 'Other'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF'

export type BudgetPeriod = 'monthly' | 'quarterly' | 'annually' | 'project-year'

export type RolloverPolicy =
  | 'strict' // No rollover allowed
  | 'flexible' // Partial rollover with agency approval
  | 'full' // Complete rollover allowed
  | 'none' // No specific policy

export type OveragePolicy =
  | 'block' // Prevent spending over budget
  | 'warn' // Warn but allow overspending
  | 'allow' // No restrictions on overspending
  | 'approve' // Require approval for overspending

// Core grant information
export interface Grant {
  id: string
  title: string
  shortTitle?: string // For display purposes

  // Funding details
  fundingAgency: FundingAgency
  grantNumber?: string
  grantType: GrantType

  // Personnel
  principalInvestigator: string
  coPrincipalInvestigators?: string[]
  institution: string
  department?: string

  // Financial information
  totalBudget: number
  cloudComputeBudget: number
  currency: Currency
  indirectCostRate?: number // For calculating total costs

  // Timeline
  startDate: Date
  endDate: Date
  projectDuration: number // In months

  // Budget management
  budgetPeriods: GrantBudgetPeriod[]
  budgetPeriodType: BudgetPeriod
  rolloverPolicy: RolloverPolicy
  overagePolicy: OveragePolicy

  // Compliance and reporting
  reportingRequirements: ReportingRequirement[]
  complianceNotes?: string

  // Status and metadata
  status: 'active' | 'pending' | 'completed' | 'suspended'
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Budget period tracking
export interface GrantBudgetPeriod {
  id: string
  grantId: string
  period: string // 'Q1-2024', 'Jan-2024', 'Year-1', etc.

  // Budget allocation
  allocatedAmount: number
  carryoverAmount?: number // From previous period
  totalAvailable: number // allocated + carryover

  // Spending tracking
  spentAmount: number
  committedAmount: number // Reserved for ongoing instances
  pendingAmount: number // Planned but not yet spent

  // Calculations
  remainingBudget: number
  utilizationRate: number // spent / allocated
  projectedSpend: number

  // Timeline
  startDate: Date
  endDate: Date
  daysRemaining: number

  // Alerts and thresholds
  warningThreshold: number // Percentage at which to warn
  criticalThreshold: number // Percentage at which to alert
  alertsSent: BudgetAlert[]
}

// Budget alerts and notifications
export interface BudgetAlert {
  id: string
  grantId: string
  budgetPeriodId: string

  type: 'warning' | 'critical' | 'overage' | 'projection'
  severity: 'low' | 'medium' | 'high' | 'critical'

  message: string
  threshold: number
  currentUtilization: number
  projectedOverage?: number

  sentAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date

  recommendedActions: string[]
}

// Reporting requirements
export interface ReportingRequirement {
  type: 'quarterly' | 'annual' | 'final' | 'ad-hoc'
  dueDate: Date
  description: string
  requiresFinancialData: boolean
  requiresProgressReport: boolean
  completed: boolean
  submittedAt?: Date
}

// Multi-grant budget allocation
export interface BudgetAllocation {
  id: string
  workloadId: string

  // Grant assignments
  primaryGrant: string // Grant ID
  secondaryGrants?: GrantAllocation[] // Additional funding sources

  // Allocation strategy
  allocationStrategy:
    | 'primary-only'
    | 'proportional'
    | 'priority-based'
    | 'cost-minimizing'
  allocationRules: AllocationRule[]

  // Cost tracking
  estimatedMonthlyCost: number
  actualSpend: MonthlySpend[]

  // Optimization
  optimizationGoal:
    | 'minimize-cost'
    | 'maximize-performance'
    | 'balanced'
    | 'maximize-grant-utilization'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
}

export interface GrantAllocation {
  grantId: string
  percentage: number
  maxAmount?: number
  priority: number
}

export interface AllocationRule {
  condition: string // e.g., "if monthly spend > $1000"
  action: string // e.g., "switch to secondary grant"
  enabled: boolean
}

export interface MonthlySpend {
  month: string // YYYY-MM
  grantBreakdown: Record<string, number> // Grant ID -> amount spent
  totalSpent: number
  budgetUtilization: number
}

// Advanced budget forecasting
export interface BudgetForecast {
  grantId: string
  budgetPeriodId: string

  // Prediction model
  modelType: 'linear' | 'seasonal' | 'ml-enhanced' | 'hybrid'
  confidence: number // 0-100

  // Projections
  projectedMonthlySpend: MonthlyProjection[]
  totalProjectedSpend: number
  budgetExhaustionDate?: Date

  // Scenarios
  scenarios: ForecastScenario[]

  // Recommendations
  recommendations: BudgetRecommendation[]

  generatedAt: Date
}

export interface MonthlyProjection {
  month: string
  projectedSpend: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  factors: string[] // What influenced this projection
}

export interface ForecastScenario {
  name: string
  description: string
  probability: number
  projectedImpact: number
  recommendedActions: string[]
}

export interface BudgetRecommendation {
  type:
    | 'cost-optimization'
    | 'capacity-planning'
    | 'budget-reallocation'
    | 'procurement-timing'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  estimatedSavings?: number
  implementationEffort: 'low' | 'medium' | 'high'
  deadline?: Date
}

// Grant management dashboard data
export interface GrantDashboard {
  grants: Grant[]
  totalBudget: number
  totalSpent: number
  totalRemaining: number

  // Current period summary
  currentPeriod: {
    totalAllocated: number
    totalSpent: number
    utilizationRate: number
    daysRemaining: number
  }

  // Alerts and notifications
  activeAlerts: BudgetAlert[]
  upcomingDeadlines: ReportingRequirement[]

  // Analytics
  spendingTrends: SpendingTrend[]
  utilizationAnalysis: UtilizationAnalysis
  costOptimizationOpportunities: CostOptimization[]
}

export interface SpendingTrend {
  month: string
  totalSpend: number
  grantBreakdown: Record<string, number>
  budgetUtilization: number
}

export interface UtilizationAnalysis {
  overUtilizedGrants: string[] // Grant IDs
  underUtilizedGrants: string[]
  averageUtilization: number
  utilizationVariance: number
  recommendations: string[]
}

export interface CostOptimization {
  opportunity: string
  description: string
  estimatedSavings: number
  implementationComplexity: 'low' | 'medium' | 'high'
  affectedGrants: string[]
  actionItems: string[]
}

// Integration with consumption planning
export interface BudgetAwareConsumptionPlan {
  // Standard consumption plan data
  id: string
  workloadPatterns: WorkloadPattern[]
  planningHorizon: '1yr' | '3yr'

  // Budget integration
  budgetAllocation: BudgetAllocation
  grantConstraints: GrantConstraint[]

  // Budget-optimized recommendations
  recommendedPurchases: BudgetAwarePurchaseStrategy[]
  budgetImpact: BudgetImpactAnalysis

  // Risk analysis with budget considerations
  budgetRisks: BudgetRisk[]
  complianceCheck: ComplianceStatus

  // Timeline alignment
  grantTimeline: GrantTimelineAlignment[]
}

export interface GrantConstraint {
  grantId: string
  constraint:
    | 'no-overspending'
    | 'quarterly-limits'
    | 'approval-required'
    | 'reporting-deadlines'
  description: string
  impact: 'low' | 'medium' | 'high'
}

export interface BudgetAwarePurchaseStrategy {
  // Standard purchase strategy
  instanceType: string
  quantity: number
  purchaseType: 'reserved' | 'savings-plan' | 'spot' | 'on-demand'

  // Budget allocation
  fundingSource: string // Grant ID
  budgetPeriodAllocation: string // Which budget period this impacts
  estimatedCost: number

  // Grant compliance
  requiresApproval: boolean
  complianceNotes?: string
  reportingCategory: string
}

export interface BudgetImpactAnalysis {
  totalBudgetImpact: number
  grantUtilization: Record<string, number> // Grant ID -> utilization percentage
  budgetExhaustionRisk: number // 0-1 probability
  recommendedBudgetAdjustments: BudgetAdjustment[]
}

export interface BudgetAdjustment {
  grantId: string
  currentAllocation: number
  recommendedAllocation: number
  rationale: string
  impact: string
}

export interface BudgetRisk {
  type:
    | 'overspending'
    | 'underutilization'
    | 'timing-mismatch'
    | 'compliance-violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  probability: number
  impact: number
  mitigationStrategies: string[]
}

export interface ComplianceStatus {
  overallStatus: 'compliant' | 'warning' | 'violation'
  checks: ComplianceCheck[]
  requiredActions: string[]
}

export interface ComplianceCheck {
  requirement: string
  status: 'pass' | 'warning' | 'fail'
  description: string
  remediation?: string
}

export interface GrantTimelineAlignment {
  grantId: string
  grantPeriod: string
  workloadAlignment: 'aligned' | 'partial' | 'misaligned'
  recommendations: string[]
  adjustments: TimelineAdjustment[]
}

export interface TimelineAdjustment {
  type:
    | 'delay-start'
    | 'accelerate-timeline'
    | 'redistribute-load'
    | 'extend-grant'
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
}

// Import the consumption planning types for reference
import type { WorkloadPattern } from './consumption'
