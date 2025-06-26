import { describe, it, expect, beforeAll } from 'vitest'
import { AWSService } from './aws-service'
import type { ComputeRequirements } from '../types'

// Integration tests against real AWS API
// These tests require AWS credentials configured locally
// Run with: npm run test:integration
describe('AWSService Integration Tests (Real AWS)', () => {
  let awsService: AWSService

  beforeAll(() => {
    // Use real AWS (not LocalStack)
    process.env.NODE_ENV = 'production'
    awsService = new AWSService()
  })

  it('should fetch real instance types from AWS', async () => {
    const instances = await awsService.getInstanceTypes()

    expect(instances).toBeDefined()
    expect(Array.isArray(instances)).toBe(true)
    expect(instances.length).toBeGreaterThan(100) // AWS has hundreds of instance types

    // Check that we get real instance types
    const hasCommonInstances = instances.some(i =>
      ['t3.micro', 't3.small', 'm5.large', 'c5.large'].includes(
        i.InstanceType || ''
      )
    )
    expect(hasCommonInstances).toBe(true)
  }, 30000) // 30 second timeout for real API

  it('should filter instances by requirements', async () => {
    const requirements: ComputeRequirements = {
      minVCpus: 4,
      minMemoryGiB: 8,
      requireGpu: false,
      minNetworkPerformance: 'Moderate',
      minStorageGiB: 0,
    }

    const instances =
      await awsService.getInstanceTypesByRequirements(requirements)

    expect(instances).toBeDefined()
    expect(Array.isArray(instances)).toBe(true)
    expect(instances.length).toBeGreaterThan(0)

    // Verify filtering worked
    instances.forEach(instance => {
      expect(instance.VCpuInfo?.DefaultVCpus).toBeGreaterThanOrEqual(4)
      if (instance.MemoryInfo?.SizeInMiB) {
        expect(instance.MemoryInfo.SizeInMiB / 1024).toBeGreaterThanOrEqual(8)
      }
    })
  }, 30000)

  it('should fetch real pricing data', async () => {
    // Test with a common instance type
    const pricing = await awsService.getPricing(['t3.micro', 'm5.large'])

    expect(pricing).toBeDefined()
    expect(Array.isArray(pricing)).toBe(true)
    expect(pricing.length).toBeGreaterThan(0)

    // Check pricing structure
    const t3MicroPricing = pricing.find(p => p.instanceType === 't3.micro')
    if (t3MicroPricing) {
      expect(t3MicroPricing.onDemand).toBeDefined()
      expect(typeof t3MicroPricing.onDemand.pricePerHour).toBe('string')
      expect(parseFloat(t3MicroPricing.onDemand.pricePerHour)).toBeGreaterThan(
        0
      )
    }
  }, 45000) // Pricing API can be slower

  it('should fetch real spot pricing', async () => {
    const spotPrices = await awsService.getSpotPrices(['t3.micro', 'm5.large'])

    expect(spotPrices).toBeDefined()
    expect(Array.isArray(spotPrices)).toBe(true)
    expect(spotPrices.length).toBeGreaterThan(0)

    // Check spot price structure
    spotPrices.forEach(price => {
      expect(price.InstanceType).toBeDefined()
      expect(price.SpotPrice).toBeDefined()
      expect(price.AvailabilityZone).toBeDefined()
      expect(parseFloat(price.SpotPrice || '0')).toBeGreaterThanOrEqual(0)
    })
  }, 30000)

  it('should handle GPU instance requirements', async () => {
    const gpuRequirements: ComputeRequirements = {
      minVCpus: 4,
      minMemoryGiB: 16,
      requireGpu: true,
      minNetworkPerformance: 'High',
      minStorageGiB: 0,
    }

    const instances =
      await awsService.getInstanceTypesByRequirements(gpuRequirements)

    expect(instances).toBeDefined()
    expect(Array.isArray(instances)).toBe(true)

    // Should return GPU instances (or empty if none match exactly)
    if (instances.length > 0) {
      instances.forEach(instance => {
        expect(instance.GpuInfo).toBeDefined()
        expect(instance.GpuInfo?.Gpus).toBeDefined()
        expect(instance.GpuInfo?.Gpus?.length).toBeGreaterThan(0)
      })
    }
  }, 30000)

  it('should validate AWS credentials are configured', async () => {
    // This test ensures AWS credentials are properly configured
    try {
      const instances = await awsService.getInstanceTypes()
      expect(instances.length).toBeGreaterThan(0)
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a credentials error
        if (
          error.message.includes('credentials') ||
          error.message.includes('AccessDenied')
        ) {
          throw new Error(
            'AWS credentials not configured. Please run "aws configure" or set AWS environment variables.'
          )
        }
      }
      throw error
    }
  }, 15000)
})
