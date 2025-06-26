import type {
  InstanceType,
  ComputeRequirements,
  InstanceMatch,
  ResearchWorkload,
} from '../types'
import { awsService } from './aws-service'

interface PricingInfo {
  onDemand: number
  reserved1yr: number
  reserved3yr: number
  spotCurrent: number
}

export interface MatchingOptions {
  maxResults?: number
  includeSpotPricing?: boolean
  weightFactors?: {
    performance: number // 0-1, how much to weight raw performance
    cost: number // 0-1, how much to weight cost efficiency
    efficiency: number // 0-1, how much to weight resource utilization
  }
}

export class InstanceMatcher {
  private readonly defaultWeights = {
    performance: 0.4,
    cost: 0.4,
    efficiency: 0.2,
  }

  /**
   * Find and rank instances that match given requirements
   */
  async matchInstances(
    requirements: ComputeRequirements,
    options: MatchingOptions = {}
  ): Promise<InstanceMatch[]> {
    const {
      maxResults = 10,
      includeSpotPricing = true,
      weightFactors = this.defaultWeights,
    } = options

    // Get instances that meet minimum requirements
    const candidateInstances =
      await awsService.getInstanceTypesByRequirements(requirements)

    if (candidateInstances.length === 0) {
      return []
    }

    // Get pricing data for all candidates
    const instancesWithPricing = await this.addPricingData(
      candidateInstances,
      includeSpotPricing
    )

    // Calculate match scores
    const scoredInstances = instancesWithPricing.map(instance =>
      this.calculateMatchScore(instance, requirements, weightFactors)
    )

    // Sort by match score (highest first) and limit results
    return scoredInstances
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults)
  }

  /**
   * Match instances for a specific research workload
   */
  async matchForWorkload(
    workload: ResearchWorkload,
    options: MatchingOptions = {}
  ): Promise<InstanceMatch[]> {
    return this.matchInstances(workload.requirements, options)
  }

  /**
   * Get the best instance for a workload (top match)
   */
  async getBestMatch(
    requirements: ComputeRequirements,
    options: MatchingOptions = {}
  ): Promise<InstanceMatch | null> {
    const matches = await this.matchInstances(requirements, {
      ...options,
      maxResults: 1,
    })
    return matches[0] || null
  }

  /**
   * Compare two instances for the same requirements
   */
  async compareInstances(
    instanceTypes: string[],
    requirements: ComputeRequirements
  ): Promise<InstanceMatch[]> {
    if (instanceTypes.length === 0) {
      return []
    }

    const allInstances = await awsService.getInstanceTypes()
    const targetInstances = allInstances.filter(instance =>
      instanceTypes.includes(instance.InstanceType)
    )

    if (targetInstances.length === 0) {
      return []
    }

    const instancesWithPricing = await this.addPricingData(targetInstances)

    return instancesWithPricing.map(({ instance, pricing }) => {
      return this.calculateMatchScore(
        { instance, pricing },
        requirements,
        this.defaultWeights
      )
    })
  }

  /**
   * Add pricing data to instances
   */
  private async addPricingData(
    instances: InstanceType[],
    includeSpotPricing = true
  ): Promise<Array<{ instance: InstanceType; pricing: PricingInfo }>> {
    // Process pricing data in parallel for better performance
    const pricingPromises = instances.map(async instance => {
      try {
        const [pricingData, spotPrices] = await Promise.all([
          awsService.getPricing(instance.InstanceType),
          includeSpotPricing
            ? awsService.getSpotPrices([instance.InstanceType])
            : Promise.resolve([]),
        ])

        const spotPrice = spotPrices[0]
          ? parseFloat(spotPrices[0].SpotPrice)
          : 0
        const pricing = this.extractPricingInfo(pricingData, spotPrice)

        return { instance, pricing }
      } catch {
        // If pricing fails, use default values to avoid excluding the instance
        return {
          instance,
          pricing: {
            onDemand: 0,
            reserved1yr: 0,
            reserved3yr: 0,
            spotCurrent: 0,
          },
        }
      }
    })

    return await Promise.all(pricingPromises)
  }

  /**
   * Extract pricing information from AWS pricing response
   */
  private extractPricingInfo(
    pricingData: PriceListItem | null,
    spotPrice: number
  ): PricingInfo {
    if (!pricingData?.terms) {
      return {
        onDemand: 0,
        reserved1yr: 0,
        reserved3yr: 0,
        spotCurrent: spotPrice,
      }
    }

    // Extract on-demand pricing
    let onDemandPrice = 0
    if (pricingData.terms.OnDemand) {
      const onDemandTerms = Object.values(pricingData.terms.OnDemand)
      if (onDemandTerms.length > 0) {
        const dimensions = Object.values(onDemandTerms[0].priceDimensions)
        if (dimensions.length > 0) {
          onDemandPrice = parseFloat(dimensions[0].pricePerUnit.USD)
        }
      }
    }

    // Extract reserved pricing
    let reserved1yr = 0
    let reserved3yr = 0
    if (pricingData.terms.Reserved) {
      const reservedTerms = Object.values(pricingData.terms.Reserved)
      reservedTerms.forEach(term => {
        const dimensions = Object.values(term.priceDimensions)
        if (dimensions.length > 0) {
          const price = parseFloat(dimensions[0].pricePerUnit.USD)
          if (term.termAttributes.LeaseContractLength === '1yr') {
            reserved1yr = price
          } else if (term.termAttributes.LeaseContractLength === '3yr') {
            reserved3yr = price
          }
        }
      })
    }

    return {
      onDemand: onDemandPrice,
      reserved1yr,
      reserved3yr,
      spotCurrent: spotPrice,
    }
  }

  /**
   * Calculate match score for an instance against requirements
   */
  private calculateMatchScore(
    instanceWithPricing: { instance: InstanceType; pricing: PricingInfo },
    requirements: ComputeRequirements,
    weights: { performance: number; cost: number; efficiency: number }
  ): InstanceMatch {
    const { instance, pricing } = instanceWithPricing
    const reasons: string[] = []

    // Performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(
      instance,
      requirements,
      reasons
    )

    // Cost efficiency score (0-100)
    const costScore = this.calculateCostScore(instance, pricing, reasons)

    // Resource efficiency score (0-100)
    const efficiencyScore = this.calculateEfficiencyScore(
      instance,
      requirements,
      reasons
    )

    // Weighted final score
    const matchScore =
      performanceScore * weights.performance +
      costScore * weights.cost +
      efficiencyScore * weights.efficiency

    return {
      instance,
      pricing: {
        onDemand: pricing.onDemand,
        reserved1yr: pricing.reserved1yr,
        reserved3yr: pricing.reserved3yr,
        spotCurrent: pricing.spotCurrent,
        spotAverage24h: pricing.spotCurrent, // For now, use current as average
      },
      matchScore: Math.round(matchScore),
      matchReasons: reasons,
    }
  }

  /**
   * Calculate performance score based on how well specs meet requirements
   */
  private calculatePerformanceScore(
    instance: InstanceType,
    requirements: ComputeRequirements,
    reasons: string[]
  ): number {
    let score = 50 // Base score

    const { VCpuInfo, MemoryInfo, GpuInfo, NetworkInfo } = instance
    const memoryGiB = MemoryInfo.SizeInMiB / 1024

    // CPU scoring
    if (requirements.minVCpus) {
      const cpuRatio = VCpuInfo.DefaultVCpus / requirements.minVCpus
      if (cpuRatio >= 2) {
        score += 20
        reasons.push(
          `Excellent CPU performance (${VCpuInfo.DefaultVCpus} vCPUs)`
        )
      } else if (cpuRatio >= 1.5) {
        score += 15
        reasons.push(`Good CPU performance (${VCpuInfo.DefaultVCpus} vCPUs)`)
      } else if (cpuRatio >= 1) {
        score += 10
        reasons.push(
          `Adequate CPU performance (${VCpuInfo.DefaultVCpus} vCPUs)`
        )
      }
    }

    // Memory scoring
    if (requirements.minMemoryGiB) {
      const memoryRatio = memoryGiB / requirements.minMemoryGiB
      if (memoryRatio >= 2) {
        score += 20
        reasons.push(`Excellent memory capacity (${Math.round(memoryGiB)} GiB)`)
      } else if (memoryRatio >= 1.5) {
        score += 15
        reasons.push(`Good memory capacity (${Math.round(memoryGiB)} GiB)`)
      } else if (memoryRatio >= 1) {
        score += 10
        reasons.push(`Adequate memory capacity (${Math.round(memoryGiB)} GiB)`)
      }
    }

    // GPU scoring
    if (requirements.requireGpu && GpuInfo) {
      const gpuMemoryGiB = GpuInfo.TotalGpuMemoryInMiB / 1024
      score += 15
      reasons.push(
        `GPU acceleration available (${GpuInfo.Gpus[0].Name}, ${Math.round(gpuMemoryGiB)} GiB VRAM)`
      )

      if (requirements.minGpuMemoryGiB) {
        const gpuMemoryRatio = gpuMemoryGiB / requirements.minGpuMemoryGiB
        if (gpuMemoryRatio >= 1.5) {
          score += 10
          reasons.push('GPU memory exceeds requirements')
        }
      }
    }

    // Network performance bonus
    if (requirements.networkPerformance?.length) {
      const hasHighPerformanceNetwork = requirements.networkPerformance.some(
        perf => NetworkInfo.NetworkPerformance.includes(perf)
      )
      if (hasHighPerformanceNetwork) {
        score += 5
        reasons.push(
          `High-performance networking (${NetworkInfo.NetworkPerformance})`
        )
      }
    }

    // Current generation bonus
    if (instance.CurrentGeneration) {
      score += 5
      reasons.push('Current generation instance')
    }

    return Math.min(score, 100)
  }

  /**
   * Calculate cost efficiency score
   */
  private calculateCostScore(
    instance: InstanceType,
    pricing: PricingInfo,
    reasons: string[]
  ): number {
    let score = 50 // Base score

    if (pricing.onDemand <= 0) return score

    // Cost per vCPU
    const costPerVCpu = pricing.onDemand / instance.VCpuInfo.DefaultVCpus
    const memoryGiB = instance.MemoryInfo.SizeInMiB / 1024
    const costPerGiB = pricing.onDemand / memoryGiB

    // Score based on cost efficiency ranges (these are rough estimates)
    if (costPerVCpu < 0.05) {
      score += 25
      reasons.push('Excellent cost per vCPU')
    } else if (costPerVCpu < 0.1) {
      score += 15
      reasons.push('Good cost per vCPU')
    } else if (costPerVCpu < 0.2) {
      score += 5
      reasons.push('Moderate cost per vCPU')
    }

    if (costPerGiB < 0.02) {
      score += 15
      reasons.push('Excellent cost per GiB memory')
    } else if (costPerGiB < 0.05) {
      score += 10
      reasons.push('Good cost per GiB memory')
    }

    // Spot pricing bonus
    if (
      pricing.spotCurrent > 0 &&
      pricing.spotCurrent < pricing.onDemand * 0.5
    ) {
      score += 10
      const savings = Math.round(
        ((pricing.onDemand - pricing.spotCurrent) / pricing.onDemand) * 100
      )
      reasons.push(`Excellent spot savings (${savings}% off)`)
    }

    return Math.min(score, 100)
  }

  /**
   * Calculate resource utilization efficiency score
   */
  private calculateEfficiencyScore(
    instance: InstanceType,
    requirements: ComputeRequirements,
    reasons: string[]
  ): number {
    let score = 50 // Base score

    const { VCpuInfo, MemoryInfo } = instance
    const memoryGiB = MemoryInfo.SizeInMiB / 1024

    // Penalize over-provisioning
    if (requirements.minVCpus) {
      const cpuOverProvision = VCpuInfo.DefaultVCpus / requirements.minVCpus
      if (cpuOverProvision > 3) {
        score -= 15
        reasons.push('Significant CPU over-provisioning')
      } else if (cpuOverProvision > 2) {
        score -= 5
        reasons.push('Moderate CPU over-provisioning')
      } else if (cpuOverProvision >= 1 && cpuOverProvision <= 1.5) {
        score += 10
        reasons.push('Efficient CPU sizing')
      }
    }

    if (requirements.minMemoryGiB) {
      const memoryOverProvision = memoryGiB / requirements.minMemoryGiB
      if (memoryOverProvision > 3) {
        score -= 15
        reasons.push('Significant memory over-provisioning')
      } else if (memoryOverProvision > 2) {
        score -= 5
        reasons.push('Moderate memory over-provisioning')
      } else if (memoryOverProvision >= 1 && memoryOverProvision <= 1.5) {
        score += 10
        reasons.push('Efficient memory sizing')
      }
    }

    // Bonus for balanced CPU-to-memory ratio
    const cpuMemoryRatio = memoryGiB / VCpuInfo.DefaultVCpus
    if (cpuMemoryRatio >= 4 && cpuMemoryRatio <= 8) {
      score += 5
      reasons.push('Balanced CPU-to-memory ratio')
    }

    return Math.max(Math.min(score, 100), 0)
  }
}

// Export singleton instance
export const instanceMatcher = new InstanceMatcher()
