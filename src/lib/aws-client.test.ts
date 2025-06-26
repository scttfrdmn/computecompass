import { describe, it, expect, beforeAll } from 'vitest'
import { createTestClients } from './aws-client'
import { MOCK_INSTANCE_TYPES } from './localstack-data'

describe('AWS Client LocalStack Integration', () => {
  const clients = createTestClients()

  beforeAll(() => {
    // Set environment for LocalStack testing
    process.env.VITE_APP_ENV = 'development'
  })

  it('should create EC2 client with LocalStack configuration', async () => {
    expect(clients.ec2).toBeDefined()
    const region = await clients.ec2.config.region()
    expect(region).toBe('us-east-1')
  })

  it('should create Pricing client with LocalStack configuration', async () => {
    expect(clients.pricing).toBeDefined()
    const region = await clients.pricing.config.region()
    expect(region).toBe('us-east-1')
  })

  it('should have valid mock instance types data', () => {
    expect(MOCK_INSTANCE_TYPES).toBeDefined()
    expect(MOCK_INSTANCE_TYPES.length).toBeGreaterThan(0)

    // Verify structure of first instance type
    const instance = MOCK_INSTANCE_TYPES[0]
    expect(instance.InstanceType).toBeDefined()
    expect(instance.VCpuInfo.DefaultVCpus).toBeGreaterThan(0)
    expect(instance.MemoryInfo.SizeInMiB).toBeGreaterThan(0)
    expect(instance.ProcessorInfo.SupportedArchitectures).toContain('x86_64')
  })

  it('should include GPU instances in mock data', () => {
    const gpuInstance = MOCK_INSTANCE_TYPES.find(i => i.GpuInfo)
    expect(gpuInstance).toBeDefined()
    expect(gpuInstance?.GpuInfo?.Gpus).toBeDefined()
    expect(gpuInstance?.GpuInfo?.TotalGpuMemoryInMiB).toBeGreaterThan(0)
  })

  it('should have instances suitable for research workloads', () => {
    // Check for high-memory instance (good for genomics)
    const highMemInstance = MOCK_INSTANCE_TYPES.find(
      i => i.MemoryInfo.SizeInMiB >= 60000
    )
    expect(highMemInstance).toBeDefined()

    // Check for high-CPU instance (good for compute-intensive tasks)
    const highCpuInstance = MOCK_INSTANCE_TYPES.find(
      i => i.VCpuInfo.DefaultVCpus >= 32
    )
    expect(highCpuInstance).toBeDefined()

    // Check for GPU instance (good for ML workloads)
    const gpuInstance = MOCK_INSTANCE_TYPES.find(i => i.GpuInfo)
    expect(gpuInstance).toBeDefined()
  })
})
