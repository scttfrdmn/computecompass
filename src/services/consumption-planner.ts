import type {
  WorkloadPattern,
  ConsumptionPlan,
  PurchaseStrategy,
  CostBreakdown,
  DiscountProfile,
} from '../types/consumption'

/**
 * Service for consumption planning and cost optimization
 */
export class ConsumptionPlannerService {
  /**
   * Generate a consumption plan based on workload patterns
   */
  static async generateConsumptionPlan(
    workloadPatterns: WorkloadPattern[],
    planningHorizon: '1yr' | '3yr' = '1yr',
    discountProfile?: DiscountProfile
  ): Promise<ConsumptionPlan> {
    // Calculate total resource requirements
    const resourceRequirements =
      this.calculateResourceRequirements(workloadPatterns)

    // Generate purchase strategy recommendations
    const recommendedPurchases = await this.optimizePurchaseStrategy(
      resourceRequirements,
      planningHorizon,
      workloadPatterns,
      discountProfile
    )

    // Calculate cost breakdown
    const costBreakdown = this.calculateCostBreakdown(
      recommendedPurchases,
      discountProfile
    )

    // Perform risk and savings analysis
    const analysis = this.analyzeConsumptionPlan(
      workloadPatterns,
      recommendedPurchases,
      costBreakdown
    )

    // Generate insights and recommendations
    const { recommendations, insights, warnings } = this.generateInsights(
      workloadPatterns,
      recommendedPurchases,
      analysis
    )

    return {
      id: `plan-${Date.now()}`,
      name: `Consumption Plan - ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      workloadPatterns,
      planningHorizon,
      recommendedPurchases,
      costBreakdown,
      analysis,
      risks: {
        spotInterruption:
          this.calculateSpotInterruptionRisk(recommendedPurchases),
        underUtilization:
          this.calculateUnderUtilizationRisk(recommendedPurchases),
        overCommitment: this.calculateOverCommitmentRisk(
          workloadPatterns,
          recommendedPurchases
        ),
      },
      recommendations,
      insights,
      warnings,
    }
  }

  /**
   * Calculate aggregate resource requirements from workload patterns
   */
  private static calculateResourceRequirements(
    workloadPatterns: WorkloadPattern[]
  ) {
    const requirements = {
      totalVCpuHours: 0,
      totalMemoryGiBHours: 0,
      totalGpuHours: 0,
      peakConcurrentVCpus: 0,
      peakConcurrentMemoryGiB: 0,
      interruptibleHours: 0,
      criticalHours: 0,
    }

    for (const pattern of workloadPatterns) {
      // Calculate monthly usage
      const monthlyRuns = pattern.runsPerDay * (pattern.daysPerWeek / 7) * 30
      const monthlyHours = monthlyRuns * pattern.avgDurationHours

      // Apply seasonal multiplier (average over the year)
      const seasonalMultiplier = pattern.seasonality.peakMultiplier
        ? (pattern.seasonality.peakMultiplier + 1) / 2
        : 1

      const adjustedMonthlyHours = monthlyHours * seasonalMultiplier

      requirements.totalVCpuHours +=
        adjustedMonthlyHours * pattern.instanceRequirements.vCpus
      requirements.totalMemoryGiBHours +=
        adjustedMonthlyHours * pattern.instanceRequirements.memoryGiB

      if (pattern.instanceRequirements.gpuRequired) {
        requirements.totalGpuHours += adjustedMonthlyHours
      }

      // Calculate peak concurrent requirements
      const concurrentJobs = pattern.burstCapacity?.maxConcurrentJobs || 1
      requirements.peakConcurrentVCpus = Math.max(
        requirements.peakConcurrentVCpus,
        concurrentJobs * pattern.instanceRequirements.vCpus
      )
      requirements.peakConcurrentMemoryGiB = Math.max(
        requirements.peakConcurrentMemoryGiB,
        concurrentJobs * pattern.instanceRequirements.memoryGiB
      )

      // Track interruptible vs critical workloads
      if (pattern.interruptible) {
        requirements.interruptibleHours += adjustedMonthlyHours
      }

      if (pattern.priority === 'critical') {
        requirements.criticalHours += adjustedMonthlyHours
      }
    }

    return requirements
  }

  /**
   * Optimize purchase strategy based on requirements and constraints
   */
  private static async optimizePurchaseStrategy(
    requirements: ReturnType<typeof this.calculateResourceRequirements>,
    horizon: '1yr' | '3yr',
    workloadPatterns: WorkloadPattern[],
    discountProfile?: DiscountProfile
  ): Promise<PurchaseStrategy[]> {
    // discountProfile will be used for pricing adjustments in future iterations
    void discountProfile

    const strategies: PurchaseStrategy[] = []
    let strategyId = 1

    // Base capacity strategy - use Reserved Instances for predictable load
    const baseUtilization = 0.7 // Conservative base utilization
    const baseVCpuCapacity = Math.floor(
      (requirements.totalVCpuHours * baseUtilization) / (24 * 30)
    )

    if (baseVCpuCapacity > 0) {
      // Choose appropriate instance type for base capacity
      const baseInstanceType = this.selectOptimalInstanceType(
        baseVCpuCapacity,
        requirements.totalMemoryGiBHours / requirements.totalVCpuHours,
        false // No GPU for base capacity
      )

      strategies.push({
        id: `strategy-${strategyId++}`,
        instanceType: baseInstanceType,
        quantity: Math.ceil(
          baseVCpuCapacity / this.getInstanceVCpus(baseInstanceType)
        ),
        purchaseType: 'reserved',
        commitment: horizon,
        paymentOption: 'partial-upfront',
        hourlyCost: this.getReservedInstancePrice(baseInstanceType, horizon),
        monthlyCost: 0, // Will be calculated in cost breakdown
        estimatedUtilization: 85,
        purpose: 'Base capacity for predictable workloads',
        coveredWorkloads: workloadPatterns
          .filter(p => !p.interruptible && p.priority !== 'experimental')
          .map(p => p.id),
        riskLevel: 'low',
      })
    }

    // Spot capacity strategy - for interruptible workloads
    const spotEligibleHours = requirements.interruptibleHours
    if (spotEligibleHours > 0) {
      const spotInstanceType = this.selectOptimalInstanceType(
        spotEligibleHours / (24 * 30),
        requirements.totalMemoryGiBHours / requirements.totalVCpuHours,
        requirements.totalGpuHours > 0
      )

      strategies.push({
        id: `strategy-${strategyId++}`,
        instanceType: spotInstanceType,
        quantity: 0, // Variable based on demand
        purchaseType: 'spot',
        hourlyCost: this.getSpotInstancePrice(spotInstanceType),
        monthlyCost: 0,
        estimatedUtilization: 60, // Lower due to interruptions
        purpose: 'Cost-effective capacity for interruptible workloads',
        coveredWorkloads: workloadPatterns
          .filter(p => p.interruptible)
          .map(p => p.id),
        riskLevel: 'medium',
      })
    }

    // On-demand capacity strategy - for burst and overflow
    strategies.push({
      id: `strategy-${strategyId++}`,
      instanceType: 'm7i.large', // Default flexible instance
      quantity: 0, // Variable based on burst needs
      purchaseType: 'on-demand',
      hourlyCost: this.getOnDemandInstancePrice('m7i.large'),
      monthlyCost: 0,
      estimatedUtilization: 30, // Used only for bursts
      purpose: 'Flexible capacity for burst workloads and overflow',
      coveredWorkloads: workloadPatterns.map(p => p.id),
      riskLevel: 'low',
    })

    // GPU capacity strategy if needed
    if (requirements.totalGpuHours > 0) {
      const gpuInstanceType = 'p3.2xlarge' // Default GPU instance
      strategies.push({
        id: `strategy-${strategyId++}`,
        instanceType: gpuInstanceType,
        quantity: Math.ceil(requirements.totalGpuHours / (24 * 30)),
        purchaseType: requirements.totalGpuHours > 200 ? 'reserved' : 'spot',
        commitment: requirements.totalGpuHours > 200 ? horizon : undefined,
        hourlyCost:
          requirements.totalGpuHours > 200
            ? this.getReservedInstancePrice(gpuInstanceType, horizon)
            : this.getSpotInstancePrice(gpuInstanceType),
        monthlyCost: 0,
        estimatedUtilization: 70,
        purpose:
          'GPU capacity for machine learning and compute-intensive workloads',
        coveredWorkloads: workloadPatterns
          .filter(p => p.instanceRequirements.gpuRequired)
          .map(p => p.id),
        riskLevel: 'medium',
      })
    }

    return strategies
  }

  /**
   * Calculate detailed cost breakdown
   */
  private static calculateCostBreakdown(
    strategies: PurchaseStrategy[],
    discountProfile?: DiscountProfile
  ): CostBreakdown {
    const breakdown: CostBreakdown = {
      reserved: { monthlyCost: 0, instances: 0, utilizationRate: 0 },
      savingsPlans: { monthlyCost: 0, commitmentAmount: 0, utilizationRate: 0 },
      spot: { monthlyCost: 0, estimatedSavings: 0, interruptionRisk: 0.1 },
      onDemand: { monthlyCost: 0, instances: 0, usage: 'burst' },
      total: { monthlyCost: 0, annualCost: 0 },
    }

    for (const strategy of strategies) {
      const baseHourlyCost = strategy.hourlyCost
      const monthlyCost =
        baseHourlyCost *
        24 *
        30 *
        (strategy.quantity || 1) *
        (strategy.estimatedUtilization / 100)

      // Apply enterprise discounts
      const discountedCost = discountProfile
        ? this.applyDiscounts(
            monthlyCost,
            strategy.instanceType,
            discountProfile
          )
        : monthlyCost

      strategy.monthlyCost = discountedCost

      switch (strategy.purchaseType) {
        case 'reserved':
          breakdown.reserved.monthlyCost += discountedCost
          breakdown.reserved.instances += strategy.quantity
          breakdown.reserved.utilizationRate += strategy.estimatedUtilization
          break
        case 'savings-plan':
          breakdown.savingsPlans.monthlyCost += discountedCost
          breakdown.savingsPlans.commitmentAmount += discountedCost
          breakdown.savingsPlans.utilizationRate +=
            strategy.estimatedUtilization
          break
        case 'spot':
          breakdown.spot.monthlyCost += discountedCost
          breakdown.spot.estimatedSavings +=
            (baseHourlyCost * 3 - baseHourlyCost) * 24 * 30 // Assuming 70% spot savings
          break
        case 'on-demand':
          breakdown.onDemand.monthlyCost += discountedCost
          breakdown.onDemand.instances += strategy.quantity || 1
          break
      }
    }

    // Calculate totals
    breakdown.total.monthlyCost =
      breakdown.reserved.monthlyCost +
      breakdown.savingsPlans.monthlyCost +
      breakdown.spot.monthlyCost +
      breakdown.onDemand.monthlyCost

    breakdown.total.annualCost = breakdown.total.monthlyCost * 12

    // Calculate average utilization rates
    const reservedStrategies = strategies.filter(
      s => s.purchaseType === 'reserved'
    )
    if (reservedStrategies.length > 0) {
      breakdown.reserved.utilizationRate /= reservedStrategies.length
    }

    return breakdown
  }

  /**
   * Analyze consumption plan for savings and risks
   */
  private static analyzeConsumptionPlan(
    workloadPatterns: WorkloadPattern[],
    strategies: PurchaseStrategy[],
    costBreakdown: CostBreakdown
  ) {
    // Calculate all on-demand cost for comparison
    const allOnDemandCost = this.calculateAllOnDemandCost(workloadPatterns)

    const savingsAmount = allOnDemandCost - costBreakdown.total.monthlyCost
    const savingsPercentage = (savingsAmount / allOnDemandCost) * 100

    return {
      totalMonthlyCost: costBreakdown.total.monthlyCost,
      vsAllOnDemandSavings: {
        amount: savingsAmount,
        percentage: savingsPercentage,
      },
      confidence: this.calculateConfidence(workloadPatterns, strategies),
    }
  }

  /**
   * Generate actionable insights and recommendations
   */
  private static generateInsights(
    workloadPatterns: WorkloadPattern[],
    strategies: PurchaseStrategy[],
    analysis: ReturnType<typeof this.analyzeConsumptionPlan>
  ) {
    const recommendations: string[] = []
    const insights: string[] = []
    const warnings: string[] = []

    // Savings insights
    if (analysis.vsAllOnDemandSavings.percentage > 30) {
      insights.push(
        `Excellent cost optimization: ${analysis.vsAllOnDemandSavings.percentage.toFixed(1)}% savings vs all on-demand`
      )
    } else if (analysis.vsAllOnDemandSavings.percentage > 15) {
      insights.push(
        `Good cost optimization: ${analysis.vsAllOnDemandSavings.percentage.toFixed(1)}% savings vs all on-demand`
      )
    } else {
      warnings.push(
        'Limited cost optimization potential with current workload patterns'
      )
    }

    // Spot instance recommendations
    const spotStrategies = strategies.filter(s => s.purchaseType === 'spot')
    if (spotStrategies.length > 0) {
      recommendations.push(
        'Consider implementing checkpointing for spot instance workloads to handle interruptions'
      )
    }

    // Reserved instance recommendations
    const reservedStrategies = strategies.filter(
      s => s.purchaseType === 'reserved'
    )
    if (reservedStrategies.length > 0) {
      recommendations.push(
        'Monitor reserved instance utilization to ensure >80% usage for optimal ROI'
      )
    }

    // Workload pattern insights
    const interruptibleWorkloads = workloadPatterns.filter(p => p.interruptible)
    if (interruptibleWorkloads.length === 0) {
      recommendations.push(
        'Consider making batch workloads interruptible to leverage spot instance savings'
      )
    }

    // Seasonal pattern insights
    const seasonalWorkloads = workloadPatterns.filter(
      p => p.seasonality.type !== 'steady'
    )
    if (seasonalWorkloads.length > 0) {
      insights.push(
        'Seasonal usage patterns detected - consider adjusting capacity during peak/low periods'
      )
    }

    return { recommendations, insights, warnings }
  }

  // Helper methods for pricing and instance selection
  private static selectOptimalInstanceType(
    vCpus: number,
    memoryRatio: number,
    needsGpu: boolean
  ): string {
    if (needsGpu) return 'p3.2xlarge'
    if (memoryRatio > 8) return 'r7i.large' // Memory optimized
    if (vCpus >= 16) return 'c7i.4xlarge' // Compute optimized
    return 'm7i.large' // General purpose
  }

  private static getInstanceVCpus(instanceType: string): number {
    // Simplified mapping - in real implementation, use AWS API
    const vcpuMap: Record<string, number> = {
      'm7i.large': 2,
      'm7i.xlarge': 4,
      'c7i.4xlarge': 16,
      'r7i.large': 2,
      'p3.2xlarge': 8,
    }
    return vcpuMap[instanceType] || 2
  }

  private static getReservedInstancePrice(
    instanceType: string,
    term: '1yr' | '3yr'
  ): number {
    // Simplified pricing - in real implementation, use AWS Pricing API
    const basePrice = this.getOnDemandInstancePrice(instanceType)
    return term === '1yr' ? basePrice * 0.6 : basePrice * 0.4
  }

  private static getSpotInstancePrice(instanceType: string): number {
    return this.getOnDemandInstancePrice(instanceType) * 0.3 // Typical 70% discount
  }

  private static getOnDemandInstancePrice(instanceType: string): number {
    // Simplified pricing - in real implementation, use AWS Pricing API
    const priceMap: Record<string, number> = {
      'm7i.large': 0.1008,
      'm7i.xlarge': 0.2016,
      'c7i.4xlarge': 0.8064,
      'r7i.large': 0.1344,
      'p3.2xlarge': 3.06,
    }
    return priceMap[instanceType] || 0.1
  }

  private static applyDiscounts(
    cost: number,
    instanceType: string,
    profile: DiscountProfile
  ): number {
    let discountedCost = cost

    // Apply EDP discount
    if (profile.edpDiscount) {
      discountedCost *= 1 - profile.edpDiscount / 100
    }

    // Apply PPA discounts
    if (profile.ppaDiscounts) {
      const family = instanceType.split('.')[0]
      const ppaDiscount = profile.ppaDiscounts[family]
      if (ppaDiscount) {
        discountedCost *= 1 - ppaDiscount / 100
      }
    }

    return discountedCost
  }

  private static calculateAllOnDemandCost(
    workloadPatterns: WorkloadPattern[]
  ): number {
    // Calculate what it would cost to run everything on-demand
    let totalCost = 0

    for (const pattern of workloadPatterns) {
      const monthlyHours =
        pattern.runsPerDay *
        (pattern.daysPerWeek / 7) *
        30 *
        pattern.avgDurationHours
      const instanceType = this.selectOptimalInstanceType(
        pattern.instanceRequirements.vCpus,
        pattern.instanceRequirements.memoryGiB /
          pattern.instanceRequirements.vCpus,
        pattern.instanceRequirements.gpuRequired
      )
      totalCost += monthlyHours * this.getOnDemandInstancePrice(instanceType)
    }

    return totalCost
  }

  private static calculateConfidence(
    workloadPatterns: WorkloadPattern[],
    strategies: PurchaseStrategy[]
  ): number {
    // Base confidence on workload predictability and strategy risk
    let confidence = 80

    // Reduce confidence for high variability workloads
    const highVariabilityWorkloads = workloadPatterns.filter(
      p => p.seasonality.peakMultiplier && p.seasonality.peakMultiplier > 2
    )
    confidence -= highVariabilityWorkloads.length * 10

    // Reduce confidence for high spot usage
    const spotStrategies = strategies.filter(s => s.purchaseType === 'spot')
    confidence -= spotStrategies.length * 5

    return Math.max(confidence, 60)
  }

  private static calculateSpotInterruptionRisk(
    strategies: PurchaseStrategy[]
  ): number {
    const spotStrategies = strategies.filter(s => s.purchaseType === 'spot')
    return spotStrategies.length > 0 ? 0.15 : 0 // 15% risk if using spot
  }

  private static calculateUnderUtilizationRisk(
    strategies: PurchaseStrategy[]
  ): number {
    const reservedStrategies = strategies.filter(
      s => s.purchaseType === 'reserved'
    )
    const avgUtilization =
      reservedStrategies.reduce((sum, s) => sum + s.estimatedUtilization, 0) /
      reservedStrategies.length
    return avgUtilization < 80 ? 0.2 : 0.05
  }

  private static calculateOverCommitmentRisk(
    workloadPatterns: WorkloadPattern[],
    _strategies: PurchaseStrategy[]
  ): number {
    // strategies parameter reserved for future risk analysis implementation
    void _strategies
    // Risk of not having enough capacity during peak periods
    const hasHighVariability = workloadPatterns.some(
      p => p.seasonality.peakMultiplier && p.seasonality.peakMultiplier > 2
    )
    return hasHighVariability ? 0.1 : 0.05
  }
}
