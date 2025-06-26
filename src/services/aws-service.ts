import {
  EC2Client,
  DescribeInstanceTypesCommand,
  DescribeSpotPriceHistoryCommand,
} from '@aws-sdk/client-ec2'
import { PricingClient, GetProductsCommand } from '@aws-sdk/client-pricing'
import { ec2Client, pricingClient } from '../lib/aws-client'
import { MOCK_INSTANCE_TYPES, MOCK_PRICING_DATA } from '../lib/localstack-data'
import { HardwareSpecsService } from './hardware-specs'
import type {
  InstanceType,
  SpotPriceHistoryItem,
  PriceListItem,
  ComputeRequirements,
} from '../types'

export class AWSServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly service?: string
  ) {
    super(message)
    this.name = 'AWSServiceError'
  }
}

export class AWSService {
  private instanceTypesCache: InstanceType[] | null = null
  private pricingCache: Map<string, PriceListItem | null> = new Map()
  private readonly isDevelopment =
    import.meta.env.VITE_APP_ENV === 'development'

  constructor(
    private ec2: EC2Client = ec2Client,
    private pricing: PricingClient = pricingClient
  ) {}

  /**
   * Fetch all available EC2 instance types with specifications
   */
  async getInstanceTypes(): Promise<InstanceType[]> {
    if (this.instanceTypesCache) {
      return this.instanceTypesCache
    }

    try {
      // In development mode, use mock data
      if (this.isDevelopment) {
        this.instanceTypesCache = MOCK_INSTANCE_TYPES
        return MOCK_INSTANCE_TYPES
      }

      const command = new DescribeInstanceTypesCommand({
        Filters: [
          {
            Name: 'current-generation',
            Values: ['true'],
          },
        ],
        MaxResults: 100,
      })

      const response = await this.ec2.send(command)
      const instanceTypes = response.InstanceTypes || []

      // Enrich instances with detailed hardware specifications
      const enrichedInstances = (instanceTypes as InstanceType[]).map(
        instance => this.enrichInstanceWithHardwareSpecs(instance)
      )

      this.instanceTypesCache = enrichedInstances
      return this.instanceTypesCache
    } catch (error) {
      throw new AWSServiceError(
        `Failed to fetch instance types: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INSTANCE_TYPES_FETCH_ERROR',
        'EC2'
      )
    }
  }

  /**
   * Filter instance types based on compute requirements
   */
  async getInstanceTypesByRequirements(
    requirements: ComputeRequirements
  ): Promise<InstanceType[]> {
    const allInstances = await this.getInstanceTypes()

    return allInstances.filter(instance => {
      const { VCpuInfo, MemoryInfo, GpuInfo, ProcessorInfo } = instance

      // Check vCPU requirements
      if (
        requirements.minVCpus &&
        VCpuInfo.DefaultVCpus < requirements.minVCpus
      ) {
        return false
      }
      if (
        requirements.maxVCpus &&
        VCpuInfo.DefaultVCpus > requirements.maxVCpus
      ) {
        return false
      }

      // Check memory requirements (convert MiB to GiB)
      const memoryGiB = MemoryInfo.SizeInMiB / 1024
      if (requirements.minMemoryGiB && memoryGiB < requirements.minMemoryGiB) {
        return false
      }
      if (requirements.maxMemoryGiB && memoryGiB > requirements.maxMemoryGiB) {
        return false
      }

      // Check GPU requirements
      if (requirements.requireGpu && !GpuInfo) {
        return false
      }
      if (requirements.minGpuMemoryGiB && GpuInfo) {
        const gpuMemoryGiB = GpuInfo.TotalGpuMemoryInMiB / 1024
        if (gpuMemoryGiB < requirements.minGpuMemoryGiB) {
          return false
        }
      }

      // Check architecture
      if (
        requirements.architecture &&
        !ProcessorInfo.SupportedArchitectures.includes(
          requirements.architecture
        )
      ) {
        return false
      }

      return true
    })
  }

  /**
   * Get current spot prices for instance types
   */
  async getSpotPrices(
    instanceTypes: string[]
  ): Promise<SpotPriceHistoryItem[]> {
    try {
      // In development mode, return mock data
      if (this.isDevelopment) {
        return instanceTypes.map(instanceType => ({
          AvailabilityZone: 'us-east-1a',
          InstanceType: instanceType,
          ProductDescription: 'Linux/UNIX',
          SpotPrice: (
            MOCK_PRICING_DATA[instanceType as keyof typeof MOCK_PRICING_DATA]
              ?.spotCurrent || 0.1
          ).toString(),
          Timestamp: new Date().toISOString(),
        }))
      }

      const command = new DescribeSpotPriceHistoryCommand({
        InstanceTypes: instanceTypes,
        ProductDescriptions: ['Linux/UNIX'],
        StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        MaxResults: 100,
      })

      const response = await this.ec2.send(command)
      return (response.SpotPriceHistory || []) as SpotPriceHistoryItem[]
    } catch (error) {
      throw new AWSServiceError(
        `Failed to fetch spot prices: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SPOT_PRICES_FETCH_ERROR',
        'EC2'
      )
    }
  }

  /**
   * Get pricing information for a specific instance type
   */
  private async getSingleInstancePricing(
    instanceType: string,
    region = 'us-east-1'
  ): Promise<PriceListItem | null> {
    const cacheKey = `${instanceType}-${region}`

    if (this.pricingCache.has(cacheKey)) {
      return this.pricingCache.get(cacheKey)
    }

    try {
      // In development mode, return mock data
      if (this.isDevelopment) {
        const mockData =
          MOCK_PRICING_DATA[instanceType as keyof typeof MOCK_PRICING_DATA]
        if (!mockData) return null

        const priceListItem: PriceListItem = {
          product: {
            productFamily: 'Compute Instance',
            attributes: {
              instanceType,
              memory: '8 GiB', // Mock value
              vcpu: '2', // Mock value
              operatingSystem: 'Linux',
              location: 'US East (N. Virginia)',
            },
          },
          terms: {
            OnDemand: {
              'mock-on-demand': {
                priceDimensions: {
                  'mock-dimension': {
                    unit: 'Hrs',
                    pricePerUnit: {
                      USD: mockData.onDemand.toString(),
                    },
                  },
                },
              },
            },
            Reserved: {
              'mock-reserved-1yr': {
                termAttributes: {
                  LeaseContractLength: '1yr',
                  OfferingClass: 'standard',
                  PurchaseOption: 'No Upfront',
                },
                priceDimensions: {
                  'mock-dimension': {
                    unit: 'Hrs',
                    pricePerUnit: {
                      USD: mockData.reserved1yr.toString(),
                    },
                  },
                },
              },
              'mock-reserved-3yr': {
                termAttributes: {
                  LeaseContractLength: '3yr',
                  OfferingClass: 'standard',
                  PurchaseOption: 'No Upfront',
                },
                priceDimensions: {
                  'mock-dimension': {
                    unit: 'Hrs',
                    pricePerUnit: {
                      USD: mockData.reserved3yr.toString(),
                    },
                  },
                },
              },
            },
          },
        }

        this.pricingCache.set(cacheKey, priceListItem)
        return priceListItem
      }

      const regionToLocation = (region: string): string => {
        const regionMap: Record<string, string> = {
          'us-east-1': 'US East (N. Virginia)',
          'us-west-2': 'US West (Oregon)',
          'eu-west-1': 'Europe (Ireland)',
        }
        return regionMap[region] || 'US East (N. Virginia)'
      }

      const command = new GetProductsCommand({
        ServiceCode: 'AmazonEC2',
        Filters: [
          {
            Field: 'instanceType',
            Value: instanceType,
            Type: 'TERM_MATCH',
          },
          {
            Field: 'location',
            Value: regionToLocation(region),
            Type: 'TERM_MATCH',
          },
          {
            Field: 'tenancy',
            Value: 'Shared',
            Type: 'TERM_MATCH',
          },
          {
            Field: 'operatingSystem',
            Value: 'Linux',
            Type: 'TERM_MATCH',
          },
          {
            Field: 'preInstalledSw',
            Value: 'NA',
            Type: 'TERM_MATCH',
          },
        ],
        MaxResults: 10,
      })

      const response = await this.pricing.send(command)
      const priceList = response.PriceList || []

      if (priceList.length === 0) {
        return null
      }

      const rawPriceData = priceList[0]
      if (!rawPriceData) {
        console.warn(`No price data returned for ${instanceType}`)
        return null
      }

      // AWS SDK returns a special String object, need to convert to string
      const priceDataString = rawPriceData.toString()

      let priceData: PriceListItem
      try {
        priceData = JSON.parse(priceDataString) as PriceListItem
      } catch (parseError) {
        console.warn(
          `Failed to parse pricing JSON for ${instanceType}:`,
          parseError
        )
        console.warn('Raw data:', priceDataString.substring(0, 200) + '...')
        return null
      }

      this.pricingCache.set(cacheKey, priceData)
      return priceData
    } catch (error) {
      throw new AWSServiceError(
        `Failed to fetch pricing for ${instanceType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PRICING_FETCH_ERROR',
        'Pricing'
      )
    }
  }

  /**
   * Get pricing for multiple instance types (overload for array)
   */
  async getPricing(
    instanceTypes: string[],
    region?: string
  ): Promise<
    {
      instanceType: string
      onDemand: { pricePerHour: string }
      reserved?: {
        term1yr: { pricePerHour: string }
        term3yr: { pricePerHour: string }
      }
      spot?: { pricePerHour: string }
    }[]
  >
  /**
   * Get pricing for single instance type (overload for string)
   */
  async getPricing(
    instanceType: string,
    region?: string
  ): Promise<PriceListItem | null>
  /**
   * Implementation for both overloads
   */
  async getPricing(
    instanceTypesOrSingle: string | string[],
    region = 'us-east-1'
  ): Promise<PriceListItem[] | PriceListItem | null> {
    // Handle single instance type
    if (typeof instanceTypesOrSingle === 'string') {
      return this.getSingleInstancePricing(instanceTypesOrSingle, region)
    }

    // Handle array of instance types
    const instanceTypes = instanceTypesOrSingle
    const results = await Promise.allSettled(
      instanceTypes.map(async instanceType => {
        const pricing = await this.getPricingForInstance(instanceType, region)
        if (!pricing) return null

        // Extract on-demand pricing
        const onDemandTerms = pricing.terms?.OnDemand || {}
        const onDemandTerm = Object.values(onDemandTerms)[0]
        const onDemandDimension = onDemandTerm?.priceDimensions
          ? Object.values(onDemandTerm.priceDimensions)[0]
          : null
        const onDemandPrice = onDemandDimension?.pricePerUnit?.USD || '0'

        return {
          instanceType,
          onDemand: { pricePerHour: onDemandPrice },
          // Note: Reserved and spot pricing would need additional API calls
        }
      })
    )

    return results
      .filter(
        (result): result is PromiseFulfilledResult<PriceListItem> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  }

  /**
   * Internal method to get pricing for a single instance type
   */
  private async getPricingForInstance(
    instanceType: string,
    region = 'us-east-1'
  ): Promise<PriceListItem | null> {
    return this.getSingleInstancePricing(instanceType, region)
  }

  /**
   * Enrich instance type with detailed hardware specifications
   */
  private enrichInstanceWithHardwareSpecs(
    instance: InstanceType
  ): InstanceType {
    const enriched = { ...instance }

    // Enhance processor information
    if (enriched.ProcessorInfo) {
      // Extract processor name from AWS attributes if available
      const processorName = this.extractProcessorName(instance)
      if (processorName) {
        enriched.ProcessorInfo = HardwareSpecsService.enhanceProcessorInfo(
          processorName,
          enriched.ProcessorInfo
        )
      }
    }

    // Enhance memory information
    if (enriched.MemoryInfo && enriched.InstanceType) {
      enriched.MemoryInfo = HardwareSpecsService.enhanceMemoryInfo(
        enriched.InstanceType,
        enriched.MemoryInfo
      )
    }

    // Enhance GPU information
    if (enriched.GpuInfo?.Gpus) {
      enriched.GpuInfo.Gpus = enriched.GpuInfo.Gpus.map(gpu => {
        return HardwareSpecsService.enhanceGpuInfo(gpu.Name, gpu)
      })
    }

    return enriched
  }

  /**
   * Extract processor name from instance type data
   */
  private extractProcessorName(instance: InstanceType): string | null {
    // For real AWS data, we'd need to parse from instance type patterns
    // This is a simplified mapping based on AWS instance families
    const instanceFamily = instance.InstanceType?.split('.')[0] || ''

    const processorMappings: Record<string, string> = {
      // Intel-based instances
      m7i: 'Intel Ice Lake',
      m6i: 'Intel Xeon Platinum 8259CL',
      m5: 'Intel Xeon Platinum 8175',
      c7i: 'Intel Ice Lake',
      c6i: 'Intel Xeon Platinum 8259CL',
      c5: 'Intel Xeon Platinum 8175',
      r7i: 'Intel Ice Lake',
      r6i: 'Intel Xeon Platinum 8259CL',
      r5: 'Intel Xeon Platinum 8175',
      t3: 'Intel Skylake E5 2686 v5',
      t2: 'Intel Xeon E5-2676 v3',

      // AMD-based instances
      m7a: 'AMD EPYC 9R14',
      m6a: 'AMD EPYC 7R32',
      c7a: 'AMD EPYC 9R14',
      c6a: 'AMD EPYC 7R32',
      r7a: 'AMD EPYC 9R14',
      r6a: 'AMD EPYC 7R32',

      // AWS Graviton instances (all versions)
      a1: 'AWS Graviton',
      t4g: 'AWS Graviton2',
      m6g: 'AWS Graviton2',
      m6gd: 'AWS Graviton2',
      m7g: 'AWS Graviton3',
      c6g: 'AWS Graviton2',
      c6gd: 'AWS Graviton2',
      c7g: 'AWS Graviton3',
      r6g: 'AWS Graviton2',
      r6gd: 'AWS Graviton2',
      r7g: 'AWS Graviton3',
      hpc7g: 'AWS Graviton3E',

      // AWS AI/ML instances
      inf1: 'AWS Inferentia',
      inf2: 'AWS Inferentia2',
      trn1: 'AWS Trainium',
      trn1n: 'AWS Trainium',
      trn2: 'AWS Trainium2',
    }

    return processorMappings[instanceFamily] || null
  }

  /**
   * Clear all caches (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.instanceTypesCache = null
    this.pricingCache.clear()
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): { instanceTypescached: boolean; pricingCacheSize: number } {
    return {
      instanceTypescached: this.instanceTypesCache !== null,
      pricingCacheSize: this.pricingCache.size,
    }
  }
}

// Export singleton instance
export const awsService = new AWSService()
