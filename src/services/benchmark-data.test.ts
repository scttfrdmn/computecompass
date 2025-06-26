import { describe, it, expect, vi } from 'vitest'
import { BenchmarkDataService } from './benchmark-data'

// Mock the fetch function
global.fetch = vi.fn()

describe('BenchmarkDataService', () => {
  const mockMemoryBenchmarks = {
    version: '2024.06.26',
    lastUpdated: '2024-06-26T23:30:00Z',
    instances: {
      'm7i.large': {
        stream: {
          copy: { bandwidth: 45.2, unit: 'GB/s' },
          scale: { bandwidth: 44.8, unit: 'GB/s' },
          add: { bandwidth: 42.1, unit: 'GB/s' },
          triad: { bandwidth: 41.9, unit: 'GB/s' },
        },
        cache: {
          l1: { latency: 4, bandwidth: 800, unit: 'cycles|GB/s' },
          l2: { latency: 12, bandwidth: 400, unit: 'cycles|GB/s' },
          l3: { latency: 45, bandwidth: 200, unit: 'cycles|GB/s' },
          memory: { latency: 75, unit: 'ns' },
        },
        numa: {
          socketCount: 1,
          localBandwidth: 41.9,
          remoteBandwidth: 0,
          interSocketLatency: 0,
        },
      },
    },
    rankings: {
      triad_bandwidth: [
        { instanceType: 'm7i.large', bandwidth: 41.9, architecture: 'intel' },
      ],
      memory_latency: [
        { instanceType: 'm7i.large', latency: 75, architecture: 'intel' },
      ],
    },
    summary: {
      totalInstances: 1,
      architectures: ['intel'],
      bestMemoryBandwidth: {
        instanceType: 'm7i.large',
        bandwidth: 41.9,
        unit: 'GB/s',
      },
      bestMemoryLatency: {
        instanceType: 'm7i.large',
        latency: 75,
        unit: 'ns',
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch benchmark data successfully', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMemoryBenchmarks),
    } as Response)

    // Mock other endpoints to return rejected promises (optional data)
    mockFetch.mockRejectedValue(new Error('Not found'))

    const data = await BenchmarkDataService.fetchBenchmarkData()

    expect(data).toBeDefined()
    expect(data.memory).toEqual(mockMemoryBenchmarks)
    expect(data.lastUpdated).toBeDefined()
  })

  it('should get instance benchmark data', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMemoryBenchmarks),
    } as Response)
    mockFetch.mockRejectedValue(new Error('Not found'))

    const benchmarks =
      await BenchmarkDataService.getInstanceBenchmarks('m7i.large')

    expect(benchmarks).toBeDefined()
    expect(benchmarks?.memory?.stream.triad.bandwidth).toBe(41.9)
    expect(benchmarks?.memory?.cache.memory.latency).toBe(75)
  })

  it('should generate performance insights', () => {
    const benchmarkData = {
      memory: mockMemoryBenchmarks.instances['m7i.large'],
    }

    const insights = BenchmarkDataService.generatePerformanceInsights(
      'm7i.large',
      benchmarkData,
      'genomics'
    )

    expect(insights).toBeDefined()
    expect(insights.length).toBeGreaterThan(0)

    // Should have memory latency insight for < 80ns
    const memoryInsight = insights.find(
      i => i.type === 'memory' && i.message.includes('latency')
    )
    expect(memoryInsight).toBeDefined()
  })

  it('should handle missing benchmark data gracefully', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValue(new Error('Network error'))

    const benchmarks =
      await BenchmarkDataService.getInstanceBenchmarks('unknown.instance')
    expect(benchmarks).toEqual({
      memory: undefined,
      cpu: undefined,
      pricing: undefined,
    })
  })

  it('should check if benchmark data is available', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMemoryBenchmarks),
    } as Response)
    mockFetch.mockRejectedValue(new Error('Not found'))

    const hasData = await BenchmarkDataService.hasBenchmarkData('m7i.large')
    expect(hasData).toBe(true)

    const noData =
      await BenchmarkDataService.hasBenchmarkData('unknown.instance')
    expect(noData).toBe(false)
  })
})
