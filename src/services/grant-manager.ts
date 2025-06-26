import type {
  Grant,
  GrantBudgetPeriod,
  BudgetAlert,
  BudgetForecast,
  GrantDashboard,
  BudgetAllocation,
  MonthlySpend,
  BudgetAwareConsumptionPlan,
} from '../types/grants'
import type { WorkloadPattern } from '../types/consumption'

/**
 * Service for managing research grant budgets and compliance
 */
export class GrantManagerService {
  /**
   * Create a new grant with initial budget periods
   */
  static createGrant(
    grantData: Omit<Grant, 'id' | 'createdAt' | 'updatedAt'>
  ): Grant {
    const grant: Grant = {
      ...grantData,
      id: `grant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Generate initial budget periods if not provided
    if (grant.budgetPeriods.length === 0) {
      grant.budgetPeriods = this.generateBudgetPeriods(grant)
    }

    return grant
  }

  /**
   * Generate budget periods based on grant timeline and budget period type
   */
  static generateBudgetPeriods(grant: Grant): GrantBudgetPeriod[] {
    const periods: GrantBudgetPeriod[] = []
    const totalMonths = grant.projectDuration
    const monthlyBudget = grant.cloudComputeBudget / totalMonths

    // Calculate the number of periods based on period type
    let numPeriods: number
    switch (grant.budgetPeriodType) {
      case 'monthly':
        numPeriods = totalMonths
        break
      case 'quarterly':
        numPeriods = Math.ceil(totalMonths / 3)
        break
      case 'annually':
      case 'project-year':
        numPeriods = Math.ceil(totalMonths / 12)
        break
      default:
        numPeriods = totalMonths
    }

    let currentDate = new Date(grant.startDate)

    for (let i = 0; i < numPeriods; i++) {
      const periodEnd = new Date(currentDate)

      // Calculate period end based on budget period type
      switch (grant.budgetPeriodType) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1)
          break
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3)
          break
        case 'annually':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
          break
        case 'project-year':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
          break
      }

      // Don't exceed grant end date
      if (periodEnd > grant.endDate) {
        periodEnd.setTime(grant.endDate.getTime())
      }

      const periodLength =
        grant.budgetPeriodType === 'quarterly'
          ? 3
          : grant.budgetPeriodType === 'annually'
            ? 12
            : 1

      const period: GrantBudgetPeriod = {
        id: `${grant.id}-period-${i + 1}`,
        grantId: grant.id,
        period: this.formatPeriodName(
          new Date(currentDate),
          grant.budgetPeriodType,
          i + 1
        ),
        allocatedAmount: monthlyBudget * periodLength,
        totalAvailable: monthlyBudget * periodLength,
        spentAmount: 0,
        committedAmount: 0,
        pendingAmount: 0,
        remainingBudget: monthlyBudget * periodLength,
        utilizationRate: 0,
        projectedSpend: 0,
        startDate: new Date(currentDate),
        endDate: new Date(periodEnd),
        daysRemaining: Math.ceil(
          (periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        warningThreshold: 80, // 80% utilization warning
        criticalThreshold: 90, // 90% utilization critical
        alertsSent: [],
      }

      periods.push(period)
      currentDate = new Date(periodEnd)
    }

    return periods
  }

  /**
   * Update grant spending and recalculate budget utilization
   */
  static updateGrantSpending(
    grant: Grant,
    newSpending: MonthlySpend
  ): { updatedGrant: Grant; alerts: BudgetAlert[] } {
    const alerts: BudgetAlert[] = []

    // Find the current budget period
    const currentPeriod = this.getCurrentBudgetPeriod(grant)
    if (!currentPeriod) {
      throw new Error('No active budget period found for grant')
    }

    // Create a deep copy of the grant to avoid mutating the original
    const updatedGrant: Grant = {
      ...grant,
      budgetPeriods: grant.budgetPeriods.map(period => {
        if (period.id === currentPeriod.id) {
          // Get spending for this specific grant from the breakdown
          const grantSpending = newSpending.grantBreakdown[grant.id] || 0
          // Update spending amounts for the current period
          const updatedSpentAmount = period.spentAmount + grantSpending
          const updatedRemainingBudget =
            period.totalAvailable - updatedSpentAmount
          const updatedUtilizationRate =
            (updatedSpentAmount / period.totalAvailable) * 100

          // Update projected spend based on current burn rate
          const daysElapsed = Math.ceil(
            (Date.now() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          const dailyBurnRate = updatedSpentAmount / Math.max(daysElapsed, 1)
          const updatedProjectedSpend =
            dailyBurnRate *
            Math.ceil(
              (period.endDate.getTime() - period.startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )

          const updatedPeriod = {
            ...period,
            spentAmount: updatedSpentAmount,
            remainingBudget: updatedRemainingBudget,
            utilizationRate: updatedUtilizationRate,
            projectedSpend: updatedProjectedSpend,
          }

          // Check for budget alerts
          if (updatedUtilizationRate >= period.criticalThreshold) {
            alerts.push(
              this.createBudgetAlert(grant, updatedPeriod, 'critical')
            )
          } else if (updatedUtilizationRate >= period.warningThreshold) {
            alerts.push(this.createBudgetAlert(grant, updatedPeriod, 'warning'))
          }

          // Check for projected overage
          if (updatedProjectedSpend > period.totalAvailable) {
            alerts.push(
              this.createBudgetAlert(grant, updatedPeriod, 'projection')
            )
          }

          return updatedPeriod
        }
        return period
      }),
      updatedAt: new Date(),
    }

    return { updatedGrant, alerts }
  }

  /**
   * Generate budget forecast for a grant using historical patterns
   */
  static generateBudgetForecast(
    grant: Grant,
    historicalSpending: MonthlySpend[]
  ): BudgetForecast {
    const currentPeriod = this.getCurrentBudgetPeriod(grant)
    if (!currentPeriod) {
      throw new Error('No active budget period found for grant')
    }

    // Simple linear forecasting (can be enhanced with ML models)
    const recentSpending = historicalSpending.slice(-3) // Last 3 months
    const averageMonthlySpend =
      recentSpending.reduce((sum, spend) => sum + spend.totalSpent, 0) /
      recentSpending.length

    const remainingMonths = Math.ceil(
      (currentPeriod.endDate.getTime() - Date.now()) /
        (1000 * 60 * 60 * 24 * 30)
    )
    const projectedTotal =
      currentPeriod.spentAmount + averageMonthlySpend * remainingMonths

    // Calculate confidence based on spending consistency
    const spendingVariance = this.calculateVariance(
      recentSpending.map(s => s.totalSpent)
    )
    const confidence = Math.max(
      60,
      100 - (spendingVariance / averageMonthlySpend) * 100
    )

    const forecast: BudgetForecast = {
      grantId: grant.id,
      budgetPeriodId: currentPeriod.id,
      modelType: 'linear',
      confidence,
      projectedMonthlySpend: [],
      totalProjectedSpend: projectedTotal,
      budgetExhaustionDate:
        projectedTotal > currentPeriod.totalAvailable
          ? new Date(
              Date.now() +
                (currentPeriod.remainingBudget / averageMonthlySpend) *
                  30 *
                  24 *
                  60 *
                  60 *
                  1000
            )
          : undefined,
      scenarios: [
        {
          name: 'Conservative',
          description: 'Spending continues at current reduced rate',
          probability: 0.3,
          projectedImpact: projectedTotal * 0.8,
          recommendedActions: ['Maintain current optimization strategies'],
        },
        {
          name: 'Expected',
          description: 'Spending continues at historical average',
          probability: 0.5,
          projectedImpact: projectedTotal,
          recommendedActions: ['Continue monitoring spending patterns'],
        },
        {
          name: 'High Activity',
          description: 'Increased research activity near deadlines',
          probability: 0.2,
          projectedImpact: projectedTotal * 1.3,
          recommendedActions: [
            'Consider additional cost optimization',
            'Plan for burst capacity',
          ],
        },
      ],
      recommendations: this.generateBudgetRecommendations(
        grant,
        currentPeriod,
        projectedTotal
      ),
      generatedAt: new Date(),
    }

    return forecast
  }

  /**
   * Create budget-aware consumption plan that considers grant constraints
   */
  static createBudgetAwareConsumptionPlan(
    workloadPatterns: WorkloadPattern[],
    grants: Grant[],
    budgetAllocation: BudgetAllocation,
    planningHorizon: '1yr' | '3yr' = '1yr'
  ): BudgetAwareConsumptionPlan {
    const primaryGrant = grants.find(
      g => g.id === budgetAllocation.primaryGrant
    )
    if (!primaryGrant) {
      throw new Error('Primary grant not found')
    }

    const currentPeriod = this.getCurrentBudgetPeriod(primaryGrant)
    if (!currentPeriod) {
      throw new Error('No active budget period for primary grant')
    }

    // Calculate budget constraints
    // availableBudget = currentPeriod.remainingBudget
    // monthlyBudgetLimit = availableBudget / Math.max(1, currentPeriod.daysRemaining / 30)

    // Generate base consumption plan with budget constraints
    // This would integrate with the existing ConsumptionPlannerService
    // baseRecommendations = [] // Placeholder - would call ConsumptionPlannerService

    const budgetAwarePlan: BudgetAwareConsumptionPlan = {
      id: `budget-plan-${Date.now()}`,
      workloadPatterns,
      planningHorizon,
      budgetAllocation,
      grantConstraints: [
        {
          grantId: primaryGrant.id,
          constraint:
            primaryGrant.overagePolicy === 'block'
              ? 'no-overspending'
              : 'approval-required',
          description: `Budget constraint for ${primaryGrant.title}`,
          impact: 'high',
        },
      ],
      recommendedPurchases: [],
      budgetImpact: {
        totalBudgetImpact: 0,
        grantUtilization: { [primaryGrant.id]: currentPeriod.utilizationRate },
        budgetExhaustionRisk:
          currentPeriod.projectedSpend > currentPeriod.totalAvailable
            ? 0.8
            : 0.2,
        recommendedBudgetAdjustments: [],
      },
      budgetRisks: [
        {
          type: 'overspending',
          severity: currentPeriod.utilizationRate > 90 ? 'high' : 'medium',
          description: 'Risk of exceeding allocated budget',
          probability: Math.min(0.9, currentPeriod.utilizationRate / 100),
          impact: currentPeriod.totalAvailable * 0.1,
          mitigationStrategies: [
            'Increase use of spot instances',
            'Implement auto-shutdown policies',
            'Review workload scheduling',
          ],
        },
      ],
      complianceCheck: {
        overallStatus:
          primaryGrant.overagePolicy === 'block' &&
          currentPeriod.utilizationRate > 95
            ? 'violation'
            : 'compliant',
        checks: [
          {
            requirement: 'Budget compliance',
            status: currentPeriod.utilizationRate < 100 ? 'pass' : 'fail',
            description: 'Spending within allocated budget limits',
          },
        ],
        requiredActions: [],
      },
      grantTimeline: [
        {
          grantId: primaryGrant.id,
          grantPeriod: currentPeriod.period,
          workloadAlignment: 'aligned',
          recommendations: [],
          adjustments: [],
        },
      ],
    }

    return budgetAwarePlan
  }

  /**
   * Generate comprehensive grant dashboard data
   */
  static generateGrantDashboard(
    grants: Grant[],
    recentSpending: MonthlySpend[]
  ): GrantDashboard {
    const totalBudget = grants.reduce(
      (sum, grant) => sum + grant.cloudComputeBudget,
      0
    )
    // Use the most recent month's spending, not cumulative
    const totalSpent =
      recentSpending.length > 0
        ? recentSpending[recentSpending.length - 1].totalSpent
        : 0

    const dashboard: GrantDashboard = {
      grants,
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      currentPeriod: {
        totalAllocated: 0,
        totalSpent: 0,
        utilizationRate: 0,
        daysRemaining: 0,
      },
      activeAlerts: [],
      upcomingDeadlines: [],
      spendingTrends: recentSpending.map(spend => ({
        month: spend.month,
        totalSpend: spend.totalSpent,
        grantBreakdown: spend.grantBreakdown,
        budgetUtilization: spend.budgetUtilization,
      })),
      utilizationAnalysis: {
        overUtilizedGrants: [],
        underUtilizedGrants: [],
        averageUtilization: 0,
        utilizationVariance: 0,
        recommendations: [],
      },
      costOptimizationOpportunities: [],
    }

    return dashboard
  }

  // Helper methods
  private static getCurrentBudgetPeriod(
    grant: Grant
  ): GrantBudgetPeriod | null {
    const now = Date.now()
    const currentPeriod = grant.budgetPeriods.find(
      period =>
        period.startDate.getTime() <= now && period.endDate.getTime() >= now
    )
    // If no current period found (e.g., grant hasn't started yet), return the first period
    return currentPeriod || grant.budgetPeriods[0] || null
  }

  private static formatPeriodName(
    date: Date,
    periodType: string,
    periodNumber: number
  ): string {
    switch (periodType) {
      case 'monthly':
        return `${date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })} ${date.getUTCFullYear()}`
      case 'quarterly': {
        const quarter = Math.ceil((date.getUTCMonth() + 1) / 3)
        return `Q${quarter}-${date.getUTCFullYear()}`
      }
      case 'annually':
        return `Year-${date.getUTCFullYear()}`
      case 'project-year':
        return `Project-Year-${periodNumber}`
      default:
        return `Period-${periodNumber}`
    }
  }

  private static createBudgetAlert(
    grant: Grant,
    period: GrantBudgetPeriod,
    type: 'warning' | 'critical' | 'projection'
  ): BudgetAlert {
    const alert: BudgetAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      grantId: grant.id,
      budgetPeriodId: period.id,
      type,
      severity:
        type === 'critical'
          ? 'critical'
          : type === 'warning'
            ? 'medium'
            : 'high',
      message: this.getBudgetAlertMessage(type, period),
      threshold:
        type === 'critical'
          ? period.criticalThreshold
          : period.warningThreshold,
      currentUtilization: period.utilizationRate,
      projectedOverage:
        type === 'projection'
          ? period.projectedSpend - period.totalAvailable
          : undefined,
      sentAt: new Date(),
      recommendedActions: this.getBudgetAlertActions(type, period),
    }

    return alert
  }

  private static getBudgetAlertMessage(
    type: string,
    period: GrantBudgetPeriod
  ): string {
    switch (type) {
      case 'warning':
        return `Budget utilization for ${period.period} has reached ${period.utilizationRate.toFixed(1)}%`
      case 'critical':
        return `Critical: Budget utilization for ${period.period} has reached ${period.utilizationRate.toFixed(1)}%`
      case 'projection':
        return `Projected spending for ${period.period} may exceed allocated budget`
      default:
        return `Budget alert for ${period.period}`
    }
  }

  private static getBudgetAlertActions(
    type: string,
    period: GrantBudgetPeriod
  ): string[] {
    const actions = []

    if (type === 'warning' || type === 'critical') {
      actions.push('Review current instance usage and optimize')
      actions.push('Consider increasing spot instance utilization')
      actions.push('Implement auto-shutdown policies for idle instances')
    }

    if (type === 'projection') {
      actions.push('Reassess workload priorities and timeline')
      actions.push('Consider delaying non-critical workloads')
      actions.push('Explore additional funding sources')
    }

    if (period.daysRemaining > 30) {
      actions.push('Spread remaining work across available time')
    }

    return actions
  }

  private static generateBudgetRecommendations(
    grant: Grant,
    period: GrantBudgetPeriod,
    projectedSpend: number
  ) {
    const recommendations = []

    if (projectedSpend > period.totalAvailable) {
      recommendations.push({
        type: 'cost-optimization' as const,
        priority: 'high' as const,
        title: 'Reduce projected overspending',
        description: 'Current trajectory will exceed budget allocation',
        estimatedSavings: projectedSpend - period.totalAvailable,
        implementationEffort: 'medium' as const,
      })
    }

    if (period.utilizationRate < 50 && period.daysRemaining < 90) {
      recommendations.push({
        type: 'capacity-planning' as const,
        priority: 'medium' as const,
        title: 'Accelerate research timeline',
        description:
          'Current low utilization suggests capacity for additional work',
        implementationEffort: 'high' as const,
      })
    }

    return recommendations
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  }
}
