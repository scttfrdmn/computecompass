import { describe, it, expect } from 'vitest'
import { ConsumptionPlannerService } from './consumption-planner'
import type {
  WorkloadPattern,
  SeasonalPattern,
  DiscountProfile,
} from '../types/consumption'

// Test data
const steadySeasonality: SeasonalPattern = {
  type: 'steady',
  description: 'Consistent usage throughout the year',
}

const academicSeasonality: SeasonalPattern = {
  type: 'academic',
  peakMonths: [8, 9, 10, 1, 2, 3],
  lowMonths: [5, 6, 7, 11],
  peakMultiplier: 1.8,
  description: 'Academic calendar pattern',
}

const mockWorkloadPatterns: WorkloadPattern[] = [
  {
    id: 'genomics-batch',
    name: 'Genomics Batch Processing',
    description: 'Large-scale genomic analysis',
    runsPerDay: 2,
    avgDurationHours: 8,
    daysPerWeek: 5,
    instanceRequirements: {
      vCpus: 16,
      memoryGiB: 64,
      gpuRequired: false,
      storageGiB: 1000,
    },
    seasonality: academicSeasonality,
    timeOfDay: 'off-hours',
    interruptible: true,
    priority: 'normal',
    burstCapacity: {
      enabled: true,
      maxConcurrentJobs: 10,
      burstDurationHours: 24,
      burstFrequency: 'weekly',
    },
  },
  {
    id: 'ml-training',
    name: 'ML Model Training',
    description: 'Deep learning model training',
    runsPerDay: 3,
    avgDurationHours: 6,
    daysPerWeek: 6,
    instanceRequirements: {
      vCpus: 8,
      memoryGiB: 32,
      gpuRequired: true,
      storageGiB: 500,
    },
    seasonality: steadySeasonality,
    timeOfDay: 'any',
    interruptible: true,
    priority: 'normal',
  },
  {
    id: 'critical-analysis',
    name: 'Critical Data Analysis',
    description: 'Time-sensitive analysis requiring high availability',
    runsPerDay: 1,
    avgDurationHours: 4,
    daysPerWeek: 7,
    instanceRequirements: {
      vCpus: 8,
      memoryGiB: 32,
      gpuRequired: false,
      storageGiB: 200,
    },
    seasonality: steadySeasonality,
    timeOfDay: 'business-hours',
    interruptible: false,
    priority: 'critical',
  },
]

const mockDiscountProfile: DiscountProfile = {
  organizationName: 'Test University',
  edpDiscount: 10, // 10% EDP discount
  ppaDiscounts: {
    m7i: 5, // 5% additional discount on m7i family
    p3: 15, // 15% additional discount on GPU instances
  },
  availableCredits: 5000,
  monthlyBudget: 10000,
}

describe('ConsumptionPlannerService', () => {
  it('should generate a comprehensive consumption plan', async () => {
    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    expect(plan).toBeDefined()
    expect(plan.id).toMatch(/^plan-\d+$/)
    expect(plan.name).toContain('Consumption Plan')
    expect(plan.workloadPatterns).toEqual(mockWorkloadPatterns)
    expect(plan.planningHorizon).toBe('1yr')
    expect(plan.createdAt).toBeInstanceOf(Date)
  })

  it('should include multiple purchase strategies', async () => {
    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    expect(plan.recommendedPurchases.length).toBeGreaterThan(0)

    // Should include different purchase types
    const purchaseTypes = plan.recommendedPurchases.map(p => p.purchaseType)
    expect(purchaseTypes).toContain('reserved') // For base capacity
    expect(purchaseTypes).toContain('spot') // For interruptible workloads
    expect(purchaseTypes).toContain('on-demand') // For burst capacity

    // Should include GPU strategy since ML workload requires GPU
    const gpuStrategies = plan.recommendedPurchases.filter(
      p =>
        p.instanceType.includes('p3') ||
        p.coveredWorkloads.includes('ml-training')
    )
    expect(gpuStrategies.length).toBeGreaterThan(0)
  })

  it('should calculate accurate cost breakdown', async () => {
    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    const { costBreakdown } = plan

    // Total should be sum of all components
    const calculatedTotal =
      costBreakdown.reserved.monthlyCost +
      costBreakdown.savingsPlans.monthlyCost +
      costBreakdown.spot.monthlyCost +
      costBreakdown.onDemand.monthlyCost

    expect(costBreakdown.total.monthlyCost).toBeCloseTo(calculatedTotal, 2)
    expect(costBreakdown.total.annualCost).toBeCloseTo(calculatedTotal * 12, 2)

    // Should have positive costs for used strategies
    expect(costBreakdown.total.monthlyCost).toBeGreaterThan(0)
  })

  it('should show significant savings vs all on-demand', async () => {
    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    const { analysis } = plan

    expect(analysis.vsAllOnDemandSavings.amount).toBeGreaterThan(0)
    expect(analysis.vsAllOnDemandSavings.percentage).toBeGreaterThan(0)
    expect(analysis.vsAllOnDemandSavings.percentage).toBeLessThan(100)

    // Should achieve some savings with mixed strategy
    expect(analysis.vsAllOnDemandSavings.percentage).toBeGreaterThan(5)
  })

  it('should apply enterprise discounts correctly', async () => {
    const planWithoutDiscounts =
      await ConsumptionPlannerService.generateConsumptionPlan(
        mockWorkloadPatterns,
        '1yr'
      )

    const planWithDiscounts =
      await ConsumptionPlannerService.generateConsumptionPlan(
        mockWorkloadPatterns,
        '1yr',
        mockDiscountProfile
      )

    // Plan with discounts should cost less
    expect(planWithDiscounts.costBreakdown.total.monthlyCost).toBeLessThan(
      planWithoutDiscounts.costBreakdown.total.monthlyCost
    )

    // Should show additional savings
    expect(
      planWithDiscounts.analysis.vsAllOnDemandSavings.percentage
    ).toBeGreaterThan(
      planWithoutDiscounts.analysis.vsAllOnDemandSavings.percentage
    )
  })

  it('should handle workloads with different priorities', async () => {
    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    // Critical workloads should be covered by reserved instances
    const criticalWorkloadIds = mockWorkloadPatterns
      .filter(p => p.priority === 'critical')
      .map(p => p.id)

    const reservedStrategies = plan.recommendedPurchases.filter(
      p => p.purchaseType === 'reserved'
    )
    const coveredCriticalWorkloads = reservedStrategies.flatMap(
      s => s.coveredWorkloads
    )

    criticalWorkloadIds.forEach(id => {
      expect(coveredCriticalWorkloads).toContain(id)
    })
  })

  it('should provide meaningful insights and recommendations', async () => {
    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    expect(plan.recommendations.length).toBeGreaterThan(0)
    expect(plan.insights.length).toBeGreaterThan(0)

    // Should provide specific recommendations
    const recommendationText = plan.recommendations.join(' ')
    expect(recommendationText).toMatch(
      /spot|reserved|utilization|checkpointing/i
    )

    // Should provide insights about the analysis
    const insightText = plan.insights.join(' ')
    expect(insightText).toMatch(/savings|optimization|cost|seasonal|usage/i)
  })

  it('should calculate appropriate risk levels', async () => {
    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    const { risks } = plan

    // Risk values should be between 0 and 1
    expect(risks.spotInterruption).toBeGreaterThanOrEqual(0)
    expect(risks.spotInterruption).toBeLessThanOrEqual(1)
    expect(risks.underUtilization).toBeGreaterThanOrEqual(0)
    expect(risks.underUtilization).toBeLessThanOrEqual(1)
    expect(risks.overCommitment).toBeGreaterThanOrEqual(0)
    expect(risks.overCommitment).toBeLessThanOrEqual(1)

    // Should have some spot interruption risk since we have interruptible workloads
    expect(risks.spotInterruption).toBeGreaterThan(0)
  })

  it('should handle different planning horizons', async () => {
    const plan1yr = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '1yr'
    )

    const plan3yr = await ConsumptionPlannerService.generateConsumptionPlan(
      mockWorkloadPatterns,
      '3yr'
    )

    expect(plan1yr.planningHorizon).toBe('1yr')
    expect(plan3yr.planningHorizon).toBe('3yr')

    // 3-year plan should generally be cheaper due to better reserved instance pricing
    expect(plan3yr.costBreakdown.total.monthlyCost).toBeLessThanOrEqual(
      plan1yr.costBreakdown.total.monthlyCost
    )
  })

  it('should handle seasonal workload patterns', async () => {
    const seasonalWorkload: WorkloadPattern = {
      id: 'seasonal-research',
      name: 'Seasonal Research',
      description: 'Research with strong seasonal patterns',
      runsPerDay: 1,
      avgDurationHours: 12,
      daysPerWeek: 5,
      instanceRequirements: {
        vCpus: 8,
        memoryGiB: 32,
        gpuRequired: false,
      },
      seasonality: {
        type: 'seasonal',
        peakMonths: [0, 1, 2], // Q1 peak
        lowMonths: [6, 7, 8], // Q3 low
        peakMultiplier: 3.0, // 3x usage during peak
        description: 'Strong seasonal variation',
      },
      interruptible: true,
      priority: 'normal',
    }

    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      [seasonalWorkload],
      '1yr'
    )

    // Should provide insights about seasonal patterns
    const insightText = plan.insights.join(' ')
    expect(insightText).toMatch(/seasonal|peak|period/i)

    // Should have reasonable confidence despite variability
    expect(plan.analysis.confidence).toBeGreaterThan(60)
  })

  it('should handle workloads with burst capacity requirements', async () => {
    const burstWorkload = mockWorkloadPatterns.find(
      p => p.burstCapacity?.enabled
    )
    expect(burstWorkload).toBeDefined()

    const plan = await ConsumptionPlannerService.generateConsumptionPlan(
      [burstWorkload!],
      '1yr'
    )

    // Should include on-demand capacity for burst handling
    const onDemandStrategies = plan.recommendedPurchases.filter(
      p => p.purchaseType === 'on-demand'
    )
    expect(onDemandStrategies.length).toBeGreaterThan(0)

    // Should mention burst capacity in strategy purpose
    const strategyPurposes = plan.recommendedPurchases
      .map(p => p.purpose)
      .join(' ')
    expect(strategyPurposes).toMatch(/burst|overflow|flexible/i)
  })
})
