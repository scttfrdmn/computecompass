import { describe, it, expect } from 'vitest'
import { GrantManagerService } from './grant-manager'
import type { MonthlySpend, BudgetAllocation } from '../types/grants'
import type { WorkloadPattern } from '../types/consumption'

// Test data
const mockGrantData = {
  title: 'NSF Research Computing Grant',
  shortTitle: 'NSF-2024-001',
  fundingAgency: 'NSF' as const,
  grantNumber: 'NSF-2024-001-ABC',
  grantType: 'R01' as const,
  principalInvestigator: 'Dr. Jane Smith',
  institution: 'University Research Lab',
  department: 'Computer Science',
  totalBudget: 500000,
  cloudComputeBudget: 150000,
  currency: 'USD' as const,
  indirectCostRate: 30,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2026-12-31'),
  projectDuration: 36,
  budgetPeriods: [],
  budgetPeriodType: 'quarterly' as const,
  rolloverPolicy: 'flexible' as const,
  overagePolicy: 'warn' as const,
  reportingRequirements: [],
  status: 'active' as const,
  tags: ['machine-learning', 'genomics'],
  notes: 'Primary funding for ML research infrastructure',
}

describe('GrantManagerService', () => {
  it('should create a grant with generated budget periods', () => {
    const grant = GrantManagerService.createGrant(mockGrantData)

    expect(grant.id).toMatch(/^grant-\d+/)
    expect(grant.title).toBe(mockGrantData.title)
    expect(grant.budgetPeriods.length).toBeGreaterThan(0)
    expect(grant.createdAt).toBeInstanceOf(Date)
    expect(grant.updatedAt).toBeInstanceOf(Date)
  })

  it('should generate quarterly budget periods correctly', () => {
    const grant = GrantManagerService.createGrant(mockGrantData)

    // 36 months = 12 quarters
    expect(grant.budgetPeriods.length).toBe(12)

    const firstPeriod = grant.budgetPeriods[0]
    expect(firstPeriod.period).toBe('Q1-2024')
    expect(firstPeriod.allocatedAmount).toBeCloseTo(150000 / 12) // Quarterly allocation
    expect(firstPeriod.startDate).toEqual(grant.startDate)
    expect(firstPeriod.warningThreshold).toBe(80)
    expect(firstPeriod.criticalThreshold).toBe(90)
  })

  it('should generate monthly budget periods when specified', () => {
    const monthlyGrantData = {
      ...mockGrantData,
      budgetPeriodType: 'monthly' as const,
      projectDuration: 12, // 1 year project
    }

    const grant = GrantManagerService.createGrant(monthlyGrantData)

    expect(grant.budgetPeriods.length).toBe(12) // 12 months

    const firstPeriod = grant.budgetPeriods[0]
    expect(firstPeriod.period).toBe('Jan 2024')
    expect(firstPeriod.allocatedAmount).toBeCloseTo(150000 / 12) // Monthly allocation
  })

  it('should update grant spending and calculate utilization', () => {
    const grant = GrantManagerService.createGrant(mockGrantData)

    // Create monthly spend with the actual grant ID
    const monthlySpend: MonthlySpend = {
      month: '2024-06',
      grantBreakdown: { [grant.id]: 5000 },
      totalSpent: 5000,
      budgetUtilization: 33.3,
    }

    // Simulate spending in the current period
    const { updatedGrant, alerts } = GrantManagerService.updateGrantSpending(
      grant,
      monthlySpend
    )

    // Find the current period (the one that was actually updated)
    const currentPeriod = updatedGrant.budgetPeriods.find(
      period => period.spentAmount > 0
    )
    expect(currentPeriod).toBeDefined()
    expect(currentPeriod!.spentAmount).toBe(5000)
    expect(currentPeriod!.remainingBudget).toBeLessThan(
      currentPeriod!.totalAvailable
    )
    expect(currentPeriod!.utilizationRate).toBeGreaterThan(0)
    expect(currentPeriod!.projectedSpend).toBeGreaterThan(0)

    // Should not generate alerts for normal spending
    expect(alerts.length).toBe(0)
  })

  it('should generate budget alerts for high utilization', () => {
    const grant = GrantManagerService.createGrant(mockGrantData)

    // Simulate high spending (90% of budget)
    const highSpending: MonthlySpend = {
      month: '2024-06',
      grantBreakdown: { [grant.id]: 11250 }, // 90% of quarterly budget
      totalSpent: 11250,
      budgetUtilization: 90,
    }

    const { alerts } = GrantManagerService.updateGrantSpending(
      grant,
      highSpending
    )

    expect(alerts.length).toBeGreaterThan(0)
    expect(alerts[0].type).toBe('critical')
    expect(alerts[0].severity).toBe('critical')
    expect(alerts[0].recommendedActions.length).toBeGreaterThan(0)
  })

  it('should generate budget forecast with confidence intervals', () => {
    const grant = GrantManagerService.createGrant(mockGrantData)

    // Historical spending pattern
    const historicalSpending: MonthlySpend[] = [
      {
        month: '2024-03',
        grantBreakdown: { [grant.id]: 4000 },
        totalSpent: 4000,
        budgetUtilization: 25,
      },
      {
        month: '2024-04',
        grantBreakdown: { [grant.id]: 4500 },
        totalSpent: 4500,
        budgetUtilization: 30,
      },
      {
        month: '2024-05',
        grantBreakdown: { [grant.id]: 5000 },
        totalSpent: 5000,
        budgetUtilization: 35,
      },
    ]

    const forecast = GrantManagerService.generateBudgetForecast(
      grant,
      historicalSpending
    )

    expect(forecast.grantId).toBe(grant.id)
    expect(forecast.modelType).toBe('linear')
    expect(forecast.confidence).toBeGreaterThan(0)
    expect(forecast.confidence).toBeLessThanOrEqual(100)
    expect(forecast.totalProjectedSpend).toBeGreaterThan(0)
    expect(forecast.scenarios.length).toBe(3) // Conservative, Expected, High Activity
    expect(forecast.recommendations.length).toBeGreaterThan(0)
  })

  it('should create budget-aware consumption plan with constraints', () => {
    const grant = GrantManagerService.createGrant(mockGrantData)

    const workloadPatterns: WorkloadPattern[] = [
      {
        id: 'ml-training',
        name: 'ML Model Training',
        description: 'Deep learning training workload',
        runsPerDay: 2,
        avgDurationHours: 6,
        daysPerWeek: 5,
        instanceRequirements: {
          vCpus: 16,
          memoryGiB: 64,
          gpuRequired: true,
        },
        seasonality: { type: 'steady' },
        interruptible: true,
        priority: 'normal',
      },
    ]

    const budgetAllocation: BudgetAllocation = {
      id: 'allocation-1',
      workloadId: 'ml-training',
      primaryGrant: grant.id,
      allocationStrategy: 'primary-only',
      allocationRules: [],
      estimatedMonthlyCost: 8000,
      actualSpend: [],
      optimizationGoal: 'minimize-cost',
      riskTolerance: 'moderate',
    }

    const budgetAwarePlan =
      GrantManagerService.createBudgetAwareConsumptionPlan(
        workloadPatterns,
        [grant],
        budgetAllocation,
        '1yr'
      )

    expect(budgetAwarePlan.id).toMatch(/^budget-plan-/)
    expect(budgetAwarePlan.workloadPatterns).toEqual(workloadPatterns)
    expect(budgetAwarePlan.budgetAllocation).toEqual(budgetAllocation)
    expect(budgetAwarePlan.grantConstraints.length).toBeGreaterThan(0)
    expect(budgetAwarePlan.budgetRisks.length).toBeGreaterThan(0)
    expect(budgetAwarePlan.complianceCheck.overallStatus).toBeDefined()
  })

  it('should generate comprehensive grant dashboard', () => {
    const grants = [
      GrantManagerService.createGrant(mockGrantData),
      GrantManagerService.createGrant({
        ...mockGrantData,
        title: 'NIH Genomics Grant',
        fundingAgency: 'NIH',
        cloudComputeBudget: 100000,
      }),
    ]

    const recentSpending: MonthlySpend[] = [
      {
        month: '2024-04',
        grantBreakdown: { [grants[0].id]: 4000, [grants[1].id]: 3000 },
        totalSpent: 7000,
        budgetUtilization: 30,
      },
      {
        month: '2024-05',
        grantBreakdown: { [grants[0].id]: 4500, [grants[1].id]: 3500 },
        totalSpent: 8000,
        budgetUtilization: 35,
      },
      {
        month: '2024-06',
        grantBreakdown: { [grants[0].id]: 5000, [grants[1].id]: 4000 },
        totalSpent: 9000,
        budgetUtilization: 40,
      },
    ]

    const dashboard = GrantManagerService.generateGrantDashboard(
      grants,
      recentSpending
    )

    expect(dashboard.grants).toEqual(grants)
    expect(dashboard.totalBudget).toBe(250000) // 150k + 100k
    expect(dashboard.totalSpent).toBe(9000) // Last month's spending
    expect(dashboard.totalRemaining).toBe(241000)
    expect(dashboard.spendingTrends.length).toBe(3)
    expect(dashboard.utilizationAnalysis).toBeDefined()
    expect(dashboard.costOptimizationOpportunities).toBeDefined()
  })

  it('should handle grant with no budget periods gracefully', () => {
    const grantWithNoPeriods = GrantManagerService.createGrant({
      ...mockGrantData,
      budgetPeriods: [],
    })

    expect(grantWithNoPeriods.budgetPeriods.length).toBeGreaterThan(0)
    expect(grantWithNoPeriods.budgetPeriods[0].allocatedAmount).toBeGreaterThan(
      0
    )
  })

  it('should calculate budget period end dates correctly', () => {
    const grant = GrantManagerService.createGrant(mockGrantData)

    const periods = grant.budgetPeriods

    // Check that periods are sequential and non-overlapping
    for (let i = 0; i < periods.length - 1; i++) {
      const currentEnd = periods[i].endDate
      const nextStart = periods[i + 1].startDate

      // Next period should start where current period ends (or close to it)
      const timeDiff = Math.abs(nextStart.getTime() - currentEnd.getTime())
      expect(timeDiff).toBeLessThan(24 * 60 * 60 * 1000) // Less than 1 day difference
    }

    // Last period should end on or before grant end date
    const lastPeriod = periods[periods.length - 1]
    expect(lastPeriod.endDate.getTime()).toBeLessThanOrEqual(
      grant.endDate.getTime()
    )
  })

  it('should handle different rollover and overage policies', () => {
    const strictGrant = GrantManagerService.createGrant({
      ...mockGrantData,
      rolloverPolicy: 'strict',
      overagePolicy: 'block',
    })

    expect(strictGrant.rolloverPolicy).toBe('strict')
    expect(strictGrant.overagePolicy).toBe('block')

    // Budget-aware plan should reflect strict policies
    const workloadPattern: WorkloadPattern = {
      id: 'test-workload',
      name: 'Test Workload',
      description: 'Test workload pattern',
      runsPerDay: 1,
      avgDurationHours: 4,
      daysPerWeek: 5,
      instanceRequirements: { vCpus: 4, memoryGiB: 16, gpuRequired: false },
      seasonality: { type: 'steady' },
      priority: 'normal',
    }

    const allocation: BudgetAllocation = {
      id: 'test-allocation',
      workloadId: 'test-workload',
      primaryGrant: strictGrant.id,
      allocationStrategy: 'primary-only',
      allocationRules: [],
      estimatedMonthlyCost: 5000,
      actualSpend: [],
      optimizationGoal: 'minimize-cost',
      riskTolerance: 'conservative',
    }

    const plan = GrantManagerService.createBudgetAwareConsumptionPlan(
      [workloadPattern],
      [strictGrant],
      allocation
    )

    expect(plan.grantConstraints[0].constraint).toBe('no-overspending')
  })
})
