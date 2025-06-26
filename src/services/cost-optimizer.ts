import type {
  WorkloadPattern,
  PurchaseStrategy,
  OptimizationResult,
  DiscountProfile,
  RiskProfile,
  OptimizationConstraints,
} from '../types/consumption'

/**
 * Advanced cost optimization service using mixed purchase strategies
 * Implements sophisticated algorithms for optimal AWS instance purchasing decisions
 */
export class CostOptimizerService {
  /**
   * Optimize cost using advanced mixed purchase strategy algorithms
   */
  static async optimizeCost(
    workloadPatterns: WorkloadPattern[],
    constraints: OptimizationConstraints = {},
    discountProfile?: DiscountProfile
  ): Promise<OptimizationResult> {
    // Analyze workload characteristics for optimization
    const workloadAnalysis = this.analyzeWorkloadCharacteristics(workloadPatterns)
    
    // Generate multiple optimization scenarios
    const scenarios = await this.generateOptimizationScenarios(
      workloadPatterns,
      workloadAnalysis,
      constraints,
      discountProfile
    )
    
    // Filter scenarios based on constraints
    const filteredScenarios = this.filterScenariosByConstraints(scenarios, constraints)
    
    // Select optimal scenario using multi-criteria optimization
    const optimalScenario = this.selectOptimalScenario(filteredScenarios, constraints)
    
    // Generate detailed recommendations
    const recommendations = this.generateOptimizationRecommendations(
      optimalScenario,
      workloadAnalysis,
      scenarios
    )
    
    return {
      id: `optimization-${Date.now()}`,
      optimalStrategy: optimalScenario,
      alternativeScenarios: filteredScenarios.slice(0, 3), // Top 3 alternatives
      costSavings: this.calculateSavings(optimalScenario, workloadPatterns),
      riskAssessment: this.assessRisk(optimalScenario, workloadPatterns),
      recommendations,
      confidenceLevel: this.calculateConfidenceLevel(optimalScenario, workloadAnalysis),
      optimizationMetrics: this.calculateOptimizationMetrics(optimalScenario)
    }
  }

  /**
   * Analyze workload patterns to identify optimization opportunities
   */
  private static analyzeWorkloadCharacteristics(workloadPatterns: WorkloadPattern[]) {
    const analysis = {
      totalHours: 0,
      predictableHours: 0,
      burstableHours: 0,
      interruptibleHours: 0,
      criticalHours: 0,
      gpuHours: 0,
      utilizationPatterns: new Map<string, number>(),
      seasonalityFactors: new Map<string, number>(),
      instanceTypeDistribution: new Map<string, number>(),
      priority: {
        critical: 0,
        high: 0,
        normal: 0,
        low: 0
      }
    }

    for (const pattern of workloadPatterns) {
      // Calculate hours per pattern
      const monthlyHours = pattern.runsPerDay * pattern.avgDurationHours * (pattern.daysPerWeek / 7) * 30
      const seasonalMultiplier = this.calculateSeasonalMultiplier(pattern.seasonality)
      const adjustedHours = monthlyHours * seasonalMultiplier

      analysis.totalHours += adjustedHours

      // Categorize by characteristics
      if (pattern.priority === 'critical' || !pattern.interruptible) {
        analysis.predictableHours += adjustedHours * 0.8 // 80% predictable
        analysis.criticalHours += adjustedHours
      }

      if (pattern.interruptible) {
        analysis.interruptibleHours += adjustedHours
      }

      if (pattern.burstCapacity?.enabled) {
        analysis.burstableHours += adjustedHours * 0.3 // 30% burst overhead
      }

      if (pattern.instanceRequirements.gpuRequired) {
        analysis.gpuHours += adjustedHours
      }

      // Track priority distribution
      analysis.priority[pattern.priority]++

      // Calculate optimal instance type for this pattern
      const optimalInstance = this.calculateOptimalInstanceType(pattern)
      analysis.instanceTypeDistribution.set(
        optimalInstance,
        (analysis.instanceTypeDistribution.get(optimalInstance) || 0) + adjustedHours
      )

      // Track seasonality patterns
      if (pattern.seasonality.type !== 'steady') {
        analysis.seasonalityFactors.set(
          pattern.seasonality.type,
          (analysis.seasonalityFactors.get(pattern.seasonality.type) || 0) + adjustedHours
        )
      }
    }

    return analysis
  }

  /**
   * Generate multiple optimization scenarios using different strategies
   */
  private static async generateOptimizationScenarios(
    workloadPatterns: WorkloadPattern[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    constraints: OptimizationConstraints,
    discountProfile?: DiscountProfile
  ): Promise<PurchaseStrategy[][]> {
    const scenarios: PurchaseStrategy[][] = []

    // Scenario 1: Conservative (70% Reserved, 20% Spot, 10% On-Demand)
    scenarios.push(await this.generateConservativeScenario(
      workloadPatterns, analysis, constraints, discountProfile
    ))

    // Scenario 2: Aggressive Cost Optimization (40% Reserved, 50% Spot, 10% On-Demand)  
    scenarios.push(await this.generateAggressiveScenario(
      workloadPatterns, analysis, constraints, discountProfile
    ))

    // Scenario 3: Balanced (50% Reserved, 30% Spot, 15% Savings Plans, 5% On-Demand)
    scenarios.push(await this.generateBalancedScenario(
      workloadPatterns, analysis, constraints, discountProfile
    ))

    // Scenario 4: GPU-Optimized (if applicable)
    if (analysis.gpuHours > 0) {
      scenarios.push(await this.generateGpuOptimizedScenario(
        workloadPatterns, analysis, constraints, discountProfile
      ))
    }

    // Scenario 5: Burst-Optimized (if applicable)
    if (analysis.burstableHours > 0) {
      scenarios.push(await this.generateBurstOptimizedScenario(
        workloadPatterns, analysis, constraints, discountProfile
      ))
    }

    return scenarios
  }

  /**
   * Conservative scenario: Minimize risk, maximize predictability
   */
  private static async generateConservativeScenario(
    workloadPatterns: WorkloadPattern[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    constraints: OptimizationConstraints,
    discountProfile?: DiscountProfile
  ): Promise<PurchaseStrategy[]> {
    const strategies: PurchaseStrategy[] = []

    // Heavy use of Reserved Instances (70% of predictable workload)
    const reservedCapacity = Math.floor(analysis.predictableHours * 0.7 / (24 * 30))
    if (reservedCapacity > 0) {
      strategies.push({
        id: 'conservative-reserved',
        instanceType: this.selectOptimalInstanceFamily(analysis, 'compute-optimized'),
        quantity: reservedCapacity,
        purchaseType: 'reserved',
        commitment: constraints.maxCommitment || '3yr',
        paymentOption: 'all-upfront', // Maximum savings
        hourlyCost: 0.15, // Estimated
        monthlyCost: 0,
        estimatedUtilization: 90,
        purpose: 'Base capacity with maximum cost predictability',
        coveredWorkloads: workloadPatterns
          .filter(p => !p.interruptible && p.priority !== 'low')
          .map(p => p.id),
        riskLevel: 'low',
      })
    }

    // Moderate Spot usage (20% for interruptible workloads)
    if (analysis.interruptibleHours > 0) {
      strategies.push({
        id: 'conservative-spot',
        instanceType: this.selectOptimalInstanceFamily(analysis, 'general-purpose'),
        quantity: 0, // Dynamic
        purchaseType: 'spot',
        hourlyCost: 0.05, // ~70% discount
        monthlyCost: 0,
        estimatedUtilization: 65,
        purpose: 'Cost-effective capacity for fault-tolerant workloads',
        coveredWorkloads: workloadPatterns
          .filter(p => p.interruptible)
          .map(p => p.id),
        riskLevel: 'medium',
      })
    }

    // On-demand for unpredictable burst (10%)
    strategies.push({
      id: 'conservative-ondemand',
      instanceType: 'm7i.large',
      quantity: 0, // Dynamic
      purchaseType: 'on-demand',
      hourlyCost: 0.10,
      monthlyCost: 0,
      estimatedUtilization: 25,
      purpose: 'Flexible capacity for unexpected demand',
      coveredWorkloads: workloadPatterns.map(p => p.id),
      riskLevel: 'low',
    })

    return this.optimizeStrategies(strategies, discountProfile)
  }

  /**
   * Aggressive scenario: Maximize cost savings
   */
  private static async generateAggressiveScenario(
    workloadPatterns: WorkloadPattern[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    constraints: OptimizationConstraints,
    discountProfile?: DiscountProfile
  ): Promise<PurchaseStrategy[]> {
    const strategies: PurchaseStrategy[] = []

    // Conservative Reserved base (40%)
    const reservedCapacity = Math.floor(analysis.predictableHours * 0.4 / (24 * 30))
    if (reservedCapacity > 0) {
      strategies.push({
        id: 'aggressive-reserved',
        instanceType: this.selectOptimalInstanceFamily(analysis, 'memory-optimized'),
        quantity: reservedCapacity,
        purchaseType: 'reserved',
        commitment: '1yr', // Shorter commitment for flexibility
        paymentOption: 'partial-upfront',
        hourlyCost: 0.18,
        monthlyCost: 0,
        estimatedUtilization: 85,
        purpose: 'Minimal reserved base for critical workloads',
        coveredWorkloads: workloadPatterns
          .filter(p => p.priority === 'critical')
          .map(p => p.id),
        riskLevel: 'low',
      })
    }

    // Heavy Spot usage (50%)
    strategies.push({
      id: 'aggressive-spot',
      instanceType: this.selectOptimalInstanceFamily(analysis, 'compute-optimized'),
      quantity: 0, // Dynamic scaling
      purchaseType: 'spot',
      hourlyCost: 0.04, // ~75% discount
      monthlyCost: 0,
      estimatedUtilization: 70,
      purpose: 'Primary capacity for cost optimization',
      coveredWorkloads: workloadPatterns
        .filter(p => p.interruptible || p.priority === 'low')
        .map(p => p.id),
      riskLevel: 'high',
    })

    // On-demand for overflow (10%)
    strategies.push({
      id: 'aggressive-ondemand',
      instanceType: 'c7i.large',
      quantity: 0,
      purchaseType: 'on-demand',
      hourlyCost: 0.09,
      monthlyCost: 0,
      estimatedUtilization: 30,
      purpose: 'Overflow capacity and spot backup',
      coveredWorkloads: workloadPatterns.map(p => p.id),
      riskLevel: 'low',
    })

    return this.optimizeStrategies(strategies, discountProfile)
  }

  /**
   * Balanced scenario: Optimal mix of cost and risk
   */
  private static async generateBalancedScenario(
    workloadPatterns: WorkloadPattern[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    constraints: OptimizationConstraints,
    discountProfile?: DiscountProfile
  ): Promise<PurchaseStrategy[]> {
    const strategies: PurchaseStrategy[] = []

    // Balanced Reserved capacity (50%)
    const reservedCapacity = Math.floor(analysis.predictableHours * 0.5 / (24 * 30))
    if (reservedCapacity > 0) {
      strategies.push({
        id: 'balanced-reserved',
        instanceType: this.selectOptimalInstanceFamily(analysis, 'general-purpose'),
        quantity: reservedCapacity,
        purchaseType: 'reserved',
        commitment: constraints.maxCommitment || '1yr',
        paymentOption: 'partial-upfront',
        hourlyCost: 0.16,
        monthlyCost: 0,
        estimatedUtilization: 88,
        purpose: 'Balanced base capacity',
        coveredWorkloads: workloadPatterns
          .filter(p => p.priority === 'critical' || p.priority === 'high')
          .map(p => p.id),
        riskLevel: 'low',
      })
    }

    // Savings Plans for flexible workloads (15%)
    if (analysis.totalHours > 500) { // Only for significant usage
      strategies.push({
        id: 'balanced-savings-plan',
        instanceType: 'flexible', // Savings plans are instance-flexible
        quantity: Math.floor(analysis.totalHours * 0.15 / (24 * 30)),
        purchaseType: 'savings-plan',
        commitment: '1yr',
        hourlyCost: 0.14, // ~15% discount vs on-demand
        monthlyCost: 0,
        estimatedUtilization: 82,
        purpose: 'Flexible commitment for variable workloads',
        coveredWorkloads: workloadPatterns
          .filter(p => p.priority === 'normal')
          .map(p => p.id),
        riskLevel: 'low',
      })
    }

    // Moderate Spot usage (30%)
    strategies.push({
      id: 'balanced-spot',
      instanceType: this.selectOptimalInstanceFamily(analysis, 'compute-optimized'),
      quantity: 0,
      purchaseType: 'spot',
      hourlyCost: 0.06,
      monthlyCost: 0,
      estimatedUtilization: 68,
      purpose: 'Cost-effective capacity with manageable risk',
      coveredWorkloads: workloadPatterns
        .filter(p => p.interruptible || p.priority === 'low')
        .map(p => p.id),
      riskLevel: 'medium',
    })

    // On-demand buffer (5%)
    strategies.push({
      id: 'balanced-ondemand',
      instanceType: 'm7i.xlarge',
      quantity: 0,
      purchaseType: 'on-demand',
      hourlyCost: 0.19,
      monthlyCost: 0,
      estimatedUtilization: 20,
      purpose: 'Emergency capacity and testing',
      coveredWorkloads: workloadPatterns.map(p => p.id),
      riskLevel: 'low',
    })

    return this.optimizeStrategies(strategies, discountProfile)
  }

  /**
   * GPU-optimized scenario for ML workloads
   */
  private static async generateGpuOptimizedScenario(
    workloadPatterns: WorkloadPattern[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    constraints: OptimizationConstraints,
    discountProfile?: DiscountProfile
  ): Promise<PurchaseStrategy[]> {
    const strategies: PurchaseStrategy[] = []

    const gpuWorkloads = workloadPatterns.filter(p => p.instanceRequirements.gpuRequired)
    const gpuHours = analysis.gpuHours

    // Reserved GPU capacity for consistent workloads (even small amounts)
    if (gpuHours > 0) {
      const reservedGpuHours = Math.max(gpuHours * 0.6, 10) // At least 10 hours/month
      strategies.push({
        id: 'gpu-reserved',
        instanceType: gpuHours > 100 ? 'p4d.24xlarge' : 'p3.2xlarge', // Scale based on usage
        quantity: Math.ceil(reservedGpuHours / (24 * 30)),
        purchaseType: 'reserved',
        commitment: '1yr',
        paymentOption: 'partial-upfront',
        hourlyCost: gpuHours > 100 ? 25.0 : 3.0, // Different pricing for different instances
        monthlyCost: 0,
        estimatedUtilization: 85,
        purpose: 'Dedicated GPU capacity for ML training',
        coveredWorkloads: gpuWorkloads
          .filter(p => p.priority === 'critical' || p.priority === 'high')
          .map(p => p.id),
        riskLevel: 'low',
      })
    }

    // Spot GPU capacity for cost optimization
    strategies.push({
      id: 'gpu-spot',
      instanceType: 'p3.8xlarge', // Cost-effective GPU option
      quantity: 0, // Dynamic
      purchaseType: 'spot',
      hourlyCost: 3.5, // ~80% savings
      monthlyCost: 0,
      estimatedUtilization: 60, // Lower due to interruptions
      purpose: 'Cost-effective GPU capacity for experimentation',
      coveredWorkloads: gpuWorkloads
        .filter(p => p.interruptible)
        .map(p => p.id),
      riskLevel: 'high',
    })

    // On-demand GPU for burst and development
    strategies.push({
      id: 'gpu-ondemand',
      instanceType: 'g5.2xlarge', // Balanced GPU instance
      quantity: 0,
      purchaseType: 'on-demand',
      hourlyCost: 1.2,
      monthlyCost: 0,
      estimatedUtilization: 25,
      purpose: 'Development and burst GPU capacity',
      coveredWorkloads: gpuWorkloads.map(p => p.id),
      riskLevel: 'low',
    })

    return this.optimizeStrategies(strategies, discountProfile)
  }

  /**
   * Burst-optimized scenario for variable workloads
   */
  private static async generateBurstOptimizedScenario(
    workloadPatterns: WorkloadPattern[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    constraints: OptimizationConstraints,
    discountProfile?: DiscountProfile
  ): Promise<PurchaseStrategy[]> {
    const strategies: PurchaseStrategy[] = []

    const burstWorkloads = workloadPatterns.filter(p => p.burstCapacity?.enabled)

    // Minimal reserved base (30%)
    strategies.push({
      id: 'burst-reserved-base',
      instanceType: 'm7i.2xlarge',
      quantity: Math.floor(analysis.predictableHours * 0.3 / (24 * 30)),
      purchaseType: 'reserved',
      commitment: '1yr',
      paymentOption: 'no-upfront', // Flexibility for scaling
      hourlyCost: 0.32,
      monthlyCost: 0,
      estimatedUtilization: 75,
      purpose: 'Minimal base for always-on services',
      coveredWorkloads: workloadPatterns
        .filter(p => p.priority === 'critical')
        .map(p => p.id),
      riskLevel: 'low',
    })

    // Large spot capacity for burst (60%)
    strategies.push({
      id: 'burst-spot-fleet',
      instanceType: 'c7i.4xlarge', // High-performance for bursts
      quantity: 0, // Auto-scaling spot fleet
      purchaseType: 'spot',
      hourlyCost: 0.25, // ~70% savings
      monthlyCost: 0,
      estimatedUtilization: 40, // Burst-specific utilization
      purpose: 'Scalable burst capacity for variable workloads',
      coveredWorkloads: burstWorkloads.map(p => p.id),
      riskLevel: 'medium',
    })

    // On-demand for immediate scaling (10%)
    strategies.push({
      id: 'burst-ondemand-scaling',
      instanceType: 'c7i.8xlarge', // High-capacity for immediate needs
      quantity: 0,
      purchaseType: 'on-demand',
      hourlyCost: 1.36,
      monthlyCost: 0,
      estimatedUtilization: 15,
      purpose: 'Immediate burst scaling for urgent workloads',
      coveredWorkloads: burstWorkloads.map(p => p.id),
      riskLevel: 'low',
    })

    return this.optimizeStrategies(strategies, discountProfile)
  }

  /**
   * Filter scenarios based on optimization constraints
   */
  private static filterScenariosByConstraints(
    scenarios: PurchaseStrategy[][],
    constraints: OptimizationConstraints
  ): PurchaseStrategy[][] {
    return scenarios.map(scenario => {
      let filteredScenario = [...scenario]

      // Remove spot instances if not allowed
      if (constraints.spotInstancesAllowed === false) {
        filteredScenario = filteredScenario.filter(s => s.purchaseType !== 'spot')
      }

      // Remove long commitments if not allowed
      if (constraints.maxCommitment === '1yr') {
        filteredScenario = filteredScenario.map(s => ({
          ...s,
          commitment: s.commitment === '3yr' ? '1yr' : s.commitment
        }))
      }

      // Enforce max spot percentage
      if (constraints.maxSpotPercentage !== undefined) {
        const totalStrategies = filteredScenario.length
        const spotCount = filteredScenario.filter(s => s.purchaseType === 'spot').length
        const spotPercentage = (spotCount / totalStrategies) * 100
        
        if (spotPercentage > constraints.maxSpotPercentage) {
          // Remove excess spot strategies
          const targetSpotCount = Math.floor((constraints.maxSpotPercentage / 100) * totalStrategies)
          const spotStrategies = filteredScenario.filter(s => s.purchaseType === 'spot')
          const nonSpotStrategies = filteredScenario.filter(s => s.purchaseType !== 'spot')
          
          filteredScenario = [
            ...nonSpotStrategies,
            ...spotStrategies.slice(0, targetSpotCount)
          ]
        }
      }

      return filteredScenario
    }).filter(scenario => scenario.length > 0) // Remove empty scenarios
  }

  /**
   * Select optimal scenario using multi-criteria decision analysis
   */
  private static selectOptimalScenario(
    scenarios: PurchaseStrategy[][],
    constraints: OptimizationConstraints
  ): PurchaseStrategy[] {
    const scores = scenarios.map((scenario, index) => {
      const costScore = this.calculateCostScore(scenario)
      const riskScore = this.calculateRiskScore(scenario)
      const flexibilityScore = this.calculateFlexibilityScore(scenario)
      const reliabilityScore = this.calculateReliabilityScore(scenario)
      const specializationScore = this.calculateSpecializationScore(scenario)

      // Weighted scoring based on constraints
      const weights = {
        cost: constraints.prioritizeCost ? 0.4 : 0.25,
        risk: constraints.riskTolerance === 'low' ? 0.3 : 0.15,
        flexibility: constraints.flexibilityRequired ? 0.3 : 0.15,
        reliability: constraints.reliabilityRequired ? 0.3 : 0.15,
        specialization: 0.3, // Bonus for specialized scenarios when appropriate
      }

      const baseScore = (
        costScore * weights.cost +
        riskScore * weights.risk +
        flexibilityScore * weights.flexibility +
        reliabilityScore * weights.reliability +
        specializationScore * weights.specialization
      )

      // Apply scenario-specific bonuses
      let scenarioBonus = 0
      const scenarioIds = scenario.map(s => s.id).join(',')
      
      // Boost GPU scenarios when GPU workloads are present
      if (scenarioIds.includes('gpu') && scenario.some(s => s.instanceType.includes('p'))) {
        scenarioBonus += 20
      }
      
      // Boost burst scenarios when burst workloads are present
      if (scenarioIds.includes('burst') && scenario.some(s => s.purpose.includes('burst'))) {
        scenarioBonus += 15
      }

      return baseScore + scenarioBonus
    })

    const maxScoreIndex = scores.indexOf(Math.max(...scores))
    return scenarios[maxScoreIndex]
  }

  // Helper methods for calculations
  private static calculateSeasonalMultiplier(seasonality: any): number {
    return seasonality.peakMultiplier ? (seasonality.peakMultiplier + 1) / 2 : 1
  }

  private static calculateOptimalInstanceType(pattern: WorkloadPattern): string {
    const { vCpus, memoryGiB, gpuRequired } = pattern.instanceRequirements
    
    if (gpuRequired) return 'p3.2xlarge'
    
    const memoryRatio = memoryGiB / vCpus
    if (memoryRatio > 6) return 'r7i.large' // Memory optimized
    if (vCpus >= 16) return 'c7i.4xlarge' // Compute optimized
    return 'm7i.large' // General purpose
  }

  private static selectOptimalInstanceFamily(
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    preferredType: string
  ): string {
    const typeMap = {
      'general-purpose': 'm7i.large',
      'compute-optimized': 'c7i.large', 
      'memory-optimized': 'r7i.large',
      'storage-optimized': 'i4i.large',
      'gpu-accelerated': 'p3.2xlarge'
    }
    return typeMap[preferredType as keyof typeof typeMap] || 'm7i.large'
  }

  private static optimizeStrategies(
    strategies: PurchaseStrategy[],
    discountProfile?: DiscountProfile
  ): PurchaseStrategy[] {
    // Apply enterprise discounts if available
    if (discountProfile) {
      strategies.forEach(strategy => {
        if (discountProfile.edpDiscount && strategy.purchaseType === 'reserved') {
          strategy.hourlyCost *= (1 - discountProfile.edpDiscount)
        }
        if (discountProfile.ppaDiscounts && strategy.purchaseType === 'on-demand') {
          const instanceFamily = strategy.instanceType.split('.')[0]
          const discount = discountProfile.ppaDiscounts[instanceFamily]
          if (discount) {
            strategy.hourlyCost *= (1 - discount)
          }
        }
      })
    }
    return strategies
  }

  private static calculateCostScore(scenario: PurchaseStrategy[]): number {
    const totalCost = scenario.reduce((sum, strategy) => 
      sum + strategy.hourlyCost * 24 * 30 * (strategy.quantity || 1), 0
    )
    return Math.max(0, 100 - totalCost / 100) // Normalize to 0-100
  }

  private static calculateRiskScore(scenario: PurchaseStrategy[]): number {
    const riskWeights = { low: 1, medium: 0.7, high: 0.3 }
    const avgRisk = scenario.reduce((sum, strategy) => 
      sum + riskWeights[strategy.riskLevel], 0
    ) / scenario.length
    return avgRisk * 100
  }

  private static calculateFlexibilityScore(scenario: PurchaseStrategy[]): number {
    const flexibilityWeights = { 'on-demand': 1, 'spot': 0.8, 'savings-plan': 0.6, 'reserved': 0.4 }
    const avgFlexibility = scenario.reduce((sum, strategy) => 
      sum + flexibilityWeights[strategy.purchaseType], 0
    ) / scenario.length
    return avgFlexibility * 100
  }

  private static calculateReliabilityScore(scenario: PurchaseStrategy[]): number {
    const reliabilityWeights = { 'reserved': 1, 'savings-plan': 0.9, 'on-demand': 0.8, 'spot': 0.5 }
    const avgReliability = scenario.reduce((sum, strategy) => 
      sum + reliabilityWeights[strategy.purchaseType], 0
    ) / scenario.length
    return avgReliability * 100
  }

  private static calculateSpecializationScore(scenario: PurchaseStrategy[]): number {
    let score = 50 // Base score
    
    // Bonus for specialized instance types
    const hasSpecializedInstances = scenario.some(s => 
      s.instanceType.includes('p3') || // GPU
      s.instanceType.includes('p4') || // GPU
      s.instanceType.includes('g5') || // GPU
      s.instanceType.includes('c7') || // Compute optimized
      s.instanceType.includes('r7') || // Memory optimized
      s.instanceType.includes('i4')    // Storage optimized
    )
    
    if (hasSpecializedInstances) score += 20
    
    // Bonus for specialized purposes
    const hasSpecializedPurposes = scenario.some(s =>
      s.purpose.toLowerCase().includes('gpu') ||
      s.purpose.toLowerCase().includes('burst') ||
      s.purpose.toLowerCase().includes('ml') ||
      s.purpose.toLowerCase().includes('scaling')
    )
    
    if (hasSpecializedPurposes) score += 20
    
    // Bonus for diverse strategy mix
    const purchaseTypes = new Set(scenario.map(s => s.purchaseType))
    if (purchaseTypes.size >= 3) score += 10
    
    return Math.min(100, score)
  }

  private static calculateSavings(
    strategy: PurchaseStrategy[],
    workloadPatterns: WorkloadPattern[]
  ): { monthlySavings: number; annualSavings: number; savingsPercentage: number } {
    // Calculate against all on-demand baseline
    const onDemandCost = workloadPatterns.reduce((sum, pattern) => {
      const monthlyHours = pattern.runsPerDay * pattern.avgDurationHours * (pattern.daysPerWeek / 7) * 30
      const seasonalMultiplier = this.calculateSeasonalMultiplier(pattern.seasonality)
      const adjustedHours = monthlyHours * seasonalMultiplier
      
      // Base hourly rate varies by instance requirement
      let baseRate = 0.10 // Base rate for general purpose
      if (pattern.instanceRequirements.gpuRequired) baseRate = 3.0 // GPU instances are expensive
      else if (pattern.instanceRequirements.vCpus >= 16) baseRate = 0.15 // Large instances
      else if (pattern.instanceRequirements.memoryGiB / pattern.instanceRequirements.vCpus > 6) baseRate = 0.12 // Memory optimized
      
      return sum + adjustedHours * baseRate * pattern.instanceRequirements.vCpus
    }, 0)

    const optimizedCost = strategy.reduce((sum, s) => {
      const utilization = s.estimatedUtilization / 100
      return sum + s.hourlyCost * 24 * 30 * Math.max(s.quantity || 1, 1) * utilization
    }, 0)

    const monthlySavings = Math.max(0, onDemandCost - optimizedCost) // Ensure non-negative
    const annualSavings = monthlySavings * 12
    const savingsPercentage = onDemandCost > 0 ? (monthlySavings / onDemandCost) * 100 : 0

    return { monthlySavings, annualSavings, savingsPercentage }
  }

  private static assessRisk(
    strategy: PurchaseStrategy[],
    workloadPatterns: WorkloadPattern[]
  ): RiskProfile {
    const spotCapacity = strategy.filter(s => s.purchaseType === 'spot')
      .reduce((sum, s) => sum + (s.quantity || 0), 0)
    const totalCapacity = strategy.reduce((sum, s) => sum + (s.quantity || 0), 0)
    
    const spotPercentage = totalCapacity > 0 ? (spotCapacity / totalCapacity) * 100 : 0
    
    return {
      overall: spotPercentage > 50 ? 'high' : spotPercentage > 20 ? 'medium' : 'low',
      spotInterruption: Math.min(spotPercentage / 100, 0.15), // Max 15% interruption risk
      costVariability: spotPercentage > 30 ? 'high' : 'low',
      commitmentRisk: strategy.some(s => s.commitment === '3yr') ? 'medium' : 'low'
    }
  }

  private static generateOptimizationRecommendations(
    strategy: PurchaseStrategy[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>,
    allScenarios: PurchaseStrategy[][]
  ): string[] {
    const recommendations: string[] = []

    // Analyze strategy composition
    const reservedPercentage = strategy.filter(s => s.purchaseType === 'reserved').length / strategy.length * 100
    const spotPercentage = strategy.filter(s => s.purchaseType === 'spot').length / strategy.length * 100

    if (reservedPercentage > 70) {
      recommendations.push('Consider reducing Reserved Instance commitment and adding Spot capacity for cost optimization')
    }

    if (spotPercentage > 60) {
      recommendations.push('High Spot usage detected - ensure workloads can handle interruptions')
    }

    if (analysis.gpuHours > 0) {
      recommendations.push('GPU workloads identified - consider Reserved Instances for consistent ML training workloads')
    }

    if (analysis.burstableHours > analysis.predictableHours) {
      recommendations.push('Variable workload pattern - Savings Plans may provide better flexibility than Reserved Instances')
    }

    return recommendations
  }

  private static calculateConfidenceLevel(
    strategy: PurchaseStrategy[],
    analysis: ReturnType<typeof this.analyzeWorkloadCharacteristics>
  ): number {
    // Base confidence on data quality and strategy stability
    let confidence = 80 // Base confidence

    // Adjust based on data completeness
    if (analysis.totalHours > 1000) confidence += 10 // Good historical data
    if (analysis.seasonalityFactors.size > 0) confidence += 5 // Seasonal awareness

    // Adjust based on strategy risk
    const highRiskStrategies = strategy.filter(s => s.riskLevel === 'high').length
    confidence -= highRiskStrategies * 10

    return Math.max(60, Math.min(95, confidence))
  }

  private static calculateOptimizationMetrics(strategy: PurchaseStrategy[]) {
    const totalStrategies = strategy.length
    const purchaseTypeDistribution = strategy.reduce((acc, s) => {
      acc[s.purchaseType] = (acc[s.purchaseType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      strategiesCount: totalStrategies,
      purchaseTypeDistribution,
      averageUtilization: strategy.reduce((sum, s) => sum + s.estimatedUtilization, 0) / totalStrategies,
      riskDistribution: strategy.reduce((acc, s) => {
        acc[s.riskLevel] = (acc[s.riskLevel] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}