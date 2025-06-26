import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AWSService, AWSServiceError } from './aws-service'
import { createTestClients } from '../lib/aws-client'
import { MOCK_INSTANCE_TYPES } from '../lib/localstack-data'
import type { ComputeRequirements } from '../types'

describe('AWSService', () => {
  let awsService: AWSService
  const testClients = createTestClients()

  beforeEach(() => {
    // Set development mode for tests
    vi.stubEnv('VITE_APP_ENV', 'development')
    awsService = new AWSService(testClients.ec2, testClients.pricing)
    awsService.clearCache()
  })

  describe('getInstanceTypes', () => {
    it('should return mock data in development mode', async () => {
      const instanceTypes = await awsService.getInstanceTypes()

      expect(instanceTypes).toEqual(MOCK_INSTANCE_TYPES)
      expect(instanceTypes.length).toBeGreaterThan(0)
    })

    it('should cache instance types after first call', async () => {
      const first = await awsService.getInstanceTypes()
      const second = await awsService.getInstanceTypes()

      expect(first).toBe(second) // Same reference, indicating cache hit
    })

    it('should have valid instance type structure', async () => {
      const instanceTypes = await awsService.getInstanceTypes()
      const instance = instanceTypes[0]

      expect(instance.InstanceType).toBeDefined()
      expect(instance.VCpuInfo.DefaultVCpus).toBeGreaterThan(0)
      expect(instance.MemoryInfo.SizeInMiB).toBeGreaterThan(0)
      expect(instance.ProcessorInfo.SupportedArchitectures).toContain('x86_64')
    })
  })

  describe('getInstanceTypesByRequirements', () => {
    it('should filter by minimum vCPUs', async () => {
      const requirements: ComputeRequirements = {
        minVCpus: 8,
      }

      const filtered =
        await awsService.getInstanceTypesByRequirements(requirements)

      filtered.forEach(instance => {
        expect(instance.VCpuInfo.DefaultVCpus).toBeGreaterThanOrEqual(8)
      })
    })

    it('should filter by memory range', async () => {
      const requirements: ComputeRequirements = {
        minMemoryGiB: 32,
        maxMemoryGiB: 128,
      }

      const filtered =
        await awsService.getInstanceTypesByRequirements(requirements)

      filtered.forEach(instance => {
        const memoryGiB = instance.MemoryInfo.SizeInMiB / 1024
        expect(memoryGiB).toBeGreaterThanOrEqual(32)
        expect(memoryGiB).toBeLessThanOrEqual(128)
      })
    })

    it('should filter by GPU requirement', async () => {
      const requirements: ComputeRequirements = {
        requireGpu: true,
      }

      const filtered =
        await awsService.getInstanceTypesByRequirements(requirements)

      filtered.forEach(instance => {
        expect(instance.GpuInfo).toBeDefined()
      })
    })

    it('should filter by GPU memory requirement', async () => {
      const requirements: ComputeRequirements = {
        requireGpu: true,
        minGpuMemoryGiB: 8,
      }

      const filtered =
        await awsService.getInstanceTypesByRequirements(requirements)

      filtered.forEach(instance => {
        expect(instance.GpuInfo).toBeDefined()
        if (instance.GpuInfo) {
          const gpuMemoryGiB = instance.GpuInfo.TotalGpuMemoryInMiB / 1024
          expect(gpuMemoryGiB).toBeGreaterThanOrEqual(8)
        }
      })
    })

    it('should filter by architecture', async () => {
      const requirements: ComputeRequirements = {
        architecture: 'x86_64',
      }

      const filtered =
        await awsService.getInstanceTypesByRequirements(requirements)

      filtered.forEach(instance => {
        expect(instance.ProcessorInfo.SupportedArchitectures).toContain(
          'x86_64'
        )
      })
    })

    it('should handle complex requirements', async () => {
      const requirements: ComputeRequirements = {
        minVCpus: 4,
        maxVCpus: 16,
        minMemoryGiB: 16,
        architecture: 'x86_64',
      }

      const filtered =
        await awsService.getInstanceTypesByRequirements(requirements)

      filtered.forEach(instance => {
        expect(instance.VCpuInfo.DefaultVCpus).toBeGreaterThanOrEqual(4)
        expect(instance.VCpuInfo.DefaultVCpus).toBeLessThanOrEqual(16)

        const memoryGiB = instance.MemoryInfo.SizeInMiB / 1024
        expect(memoryGiB).toBeGreaterThanOrEqual(16)

        expect(instance.ProcessorInfo.SupportedArchitectures).toContain(
          'x86_64'
        )
      })
    })

    it('should return empty array when no instances match', async () => {
      const requirements: ComputeRequirements = {
        minVCpus: 1000, // Unrealistic requirement
      }

      const filtered =
        await awsService.getInstanceTypesByRequirements(requirements)

      expect(filtered).toEqual([])
    })
  })

  describe('getSpotPrices', () => {
    it('should return spot prices for given instance types', async () => {
      const instanceTypes = ['m5.large', 'c5.xlarge']

      const spotPrices = await awsService.getSpotPrices(instanceTypes)

      expect(spotPrices).toHaveLength(2)
      expect(spotPrices[0].InstanceType).toBe('m5.large')
      expect(spotPrices[1].InstanceType).toBe('c5.xlarge')
      expect(parseFloat(spotPrices[0].SpotPrice)).toBeGreaterThan(0)
    })

    it('should return current timestamp', async () => {
      const spotPrices = await awsService.getSpotPrices(['m5.large'])

      const timestamp = new Date(spotPrices[0].Timestamp)
      const now = new Date()
      const timeDiff = Math.abs(now.getTime() - timestamp.getTime())

      // Should be within 1 minute of current time
      expect(timeDiff).toBeLessThan(60000)
    })
  })

  describe('getPricing', () => {
    it('should return pricing data for valid instance type', async () => {
      const pricing = await awsService.getPricing('m5.large')

      expect(pricing).toBeDefined()
      expect(pricing?.product.attributes.instanceType).toBe('m5.large')
      expect(pricing?.terms.OnDemand).toBeDefined()
      expect(pricing?.terms.Reserved).toBeDefined()
    })

    it('should return null for unknown instance type', async () => {
      const pricing = await awsService.getPricing('unknown.instance')

      expect(pricing).toBeNull()
    })

    it('should cache pricing data', async () => {
      const first = await awsService.getPricing('m5.large')
      const second = await awsService.getPricing('m5.large')

      expect(first).toBe(second) // Same reference, indicating cache hit
    })

    it('should have valid pricing structure', async () => {
      const pricing = await awsService.getPricing('m5.large')

      expect(pricing?.terms.OnDemand).toBeDefined()
      expect(pricing?.terms.Reserved).toBeDefined()

      // Check OnDemand pricing
      const onDemandTerms = Object.values(pricing?.terms.OnDemand || {})
      expect(onDemandTerms.length).toBeGreaterThan(0)

      const onDemandPricing = Object.values(onDemandTerms[0].priceDimensions)[0]
      expect(parseFloat(onDemandPricing.pricePerUnit.USD)).toBeGreaterThan(0)

      // Check Reserved pricing
      const reservedTerms = Object.values(pricing?.terms.Reserved || {})
      expect(reservedTerms.length).toBeGreaterThan(0)

      const reservedPricing = Object.values(reservedTerms[0].priceDimensions)[0]
      expect(parseFloat(reservedPricing.pricePerUnit.USD)).toBeGreaterThan(0)
    })
  })

  describe('error handling', () => {
    it('should throw AWSServiceError with proper details', async () => {
      // Set production mode to test actual AWS client calls
      vi.stubEnv('VITE_APP_ENV', 'production')
      const mockService = new AWSService()

      // Mock EC2 client to throw error
      vi.spyOn(mockService['ec2'], 'send').mockRejectedValue(
        new Error('Network error')
      )

      await expect(mockService.getInstanceTypes()).rejects.toThrow(
        AWSServiceError
      )
      await expect(mockService.getInstanceTypes()).rejects.toThrow(
        'Failed to fetch instance types'
      )
    })

    it('should include error code and service in AWSServiceError', async () => {
      try {
        throw new AWSServiceError('Test error', 'TEST_ERROR', 'TestService')
      } catch (error) {
        expect(error).toBeInstanceOf(AWSServiceError)
        expect((error as AWSServiceError).code).toBe('TEST_ERROR')
        expect((error as AWSServiceError).service).toBe('TestService')
      }
    })
  })

  describe('cache management', () => {
    it('should clear caches when requested', async () => {
      // Populate caches
      await awsService.getInstanceTypes()
      await awsService.getPricing('m5.large')

      let stats = awsService.getCacheStats()
      expect(stats.instanceTypescached).toBe(true)
      expect(stats.pricingCacheSize).toBeGreaterThan(0)

      // Clear caches
      awsService.clearCache()

      stats = awsService.getCacheStats()
      expect(stats.instanceTypescached).toBe(false)
      expect(stats.pricingCacheSize).toBe(0)
    })

    it('should provide cache statistics', async () => {
      const initialStats = awsService.getCacheStats()
      expect(initialStats.instanceTypescached).toBe(false)
      expect(initialStats.pricingCacheSize).toBe(0)

      await awsService.getInstanceTypes()
      await awsService.getPricing('m5.large')
      await awsService.getPricing('c5.xlarge')

      const finalStats = awsService.getCacheStats()
      expect(finalStats.instanceTypescached).toBe(true)
      expect(finalStats.pricingCacheSize).toBe(2)
    })
  })
})
