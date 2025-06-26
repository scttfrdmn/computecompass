// Import removed as it's not used

/**
 * Benchmark data interfaces matching aws-instance-benchmarks schema
 */
export interface BenchmarkMemoryData {
  stream: {
    copy: { bandwidth: number; unit: string }
    scale: { bandwidth: number; unit: string }
    add: { bandwidth: number; unit: string }
    triad: { bandwidth: number; unit: string }
  }
  cache: {
    l1: { latency: number; bandwidth: number; unit: string }
    l2: { latency: number; bandwidth: number; unit: string }
    l3: { latency: number; bandwidth: number; unit: string }
    memory: { latency: number; unit: string }
  }
  numa: {
    socketCount: number
    localBandwidth: number
    remoteBandwidth: number
    interSocketLatency: number
  }
}

export interface BenchmarkCpuData {
  linpack: {
    gflops: number
    efficiency: number
    problemSize: number
  }
  coremark: {
    score: number
    coremarkMhz: number
  }
  vectorization: {
    sse2?: number
    avx2?: number
    avx512?: number
    neon?: number
    sve?: number
  }
  scaling: {
    singleThread: number
    allCores: number
    smtEfficiency: number
  }
}

export interface BenchmarkPricingData {
  onDemand: number
  spot: {
    current: number
    average7d: number
    reliability: number
  }
  reserved: {
    term1yr: number
    term3yr: number
  }
  costEfficiency: {
    costPerGflop: number
    costPerGBs: number
  }
}

export interface InstanceBenchmarkData {
  memory?: BenchmarkMemoryData
  cpu?: BenchmarkCpuData
  pricing?: BenchmarkPricingData
}

export interface BenchmarkDatabase {
  memory: {
    version: string
    lastUpdated: string
    instances: Record<string, BenchmarkMemoryData>
    rankings: {
      triad_bandwidth: Array<{
        instanceType: string
        bandwidth: number
        architecture: string
      }>
      memory_latency: Array<{
        instanceType: string
        latency: number
        architecture: string
      }>
    }
    summary: {
      totalInstances: number
      architectures: string[]
      bestMemoryBandwidth: {
        instanceType: string
        bandwidth: number
        unit: string
      }
      bestMemoryLatency: { instanceType: string; latency: number; unit: string }
    }
  }
  cpu?: {
    version: string
    lastUpdated: string
    instances: Record<string, BenchmarkCpuData>
    rankings: {
      peak_gflops: Array<{
        instanceType: string
        gflops: number
        architecture: string
      }>
      coremark_score: Array<{
        instanceType: string
        score: number
        architecture: string
      }>
    }
  }
  pricing?: {
    version: string
    lastUpdated: string
    instances: Record<string, BenchmarkPricingData>
  }
  lastUpdated: string
}

export interface PerformanceInsight {
  type: 'memory' | 'cpu' | 'cost' | 'architecture'
  severity: 'info' | 'warning' | 'recommendation'
  message: string
  data?: Record<string, unknown>
}

/**
 * Service to fetch and manage benchmark data from aws-instance-benchmarks repository
 */
export class BenchmarkDataService {
  private static readonly GITHUB_BASE_URL =
    'https://raw.githubusercontent.com/scttfrdmn/aws-instance-benchmarks/main/data/processed/latest'
  private static cachedData: BenchmarkDatabase | null = null
  private static lastFetch: Date | null = null
  private static readonly CACHE_DURATION = 1000 * 60 * 60 // 1 hour

  /**
   * Fetch latest benchmark data from GitHub repository
   */
  static async fetchBenchmarkData(
    forceRefresh = false
  ): Promise<BenchmarkDatabase> {
    const now = new Date()

    // Return cached data if still fresh
    if (
      !forceRefresh &&
      this.cachedData &&
      this.lastFetch &&
      now.getTime() - this.lastFetch.getTime() < this.CACHE_DURATION
    ) {
      return this.cachedData
    }

    try {
      console.log('Fetching benchmark data from repository...')

      // Fetch all benchmark data files in parallel
      const [memoryResponse, cpuResponse, pricingResponse] =
        await Promise.allSettled([
          fetch(`${this.GITHUB_BASE_URL}/memory-benchmarks.json`),
          fetch(`${this.GITHUB_BASE_URL}/cpu-benchmarks.json`),
          fetch(`${this.GITHUB_BASE_URL}/price-performance.json`),
        ])

      const database: BenchmarkDatabase = {
        lastUpdated: now.toISOString(),
      } as BenchmarkDatabase

      // Process memory benchmarks (required)
      if (memoryResponse.status === 'fulfilled' && memoryResponse.value.ok) {
        database.memory = await memoryResponse.value.json()
      } else {
        console.warn('Memory benchmark data not available, using fallback')
        // Provide fallback or minimal data structure
        database.memory = {
          version: 'fallback',
          lastUpdated: now.toISOString(),
          instances: {},
          rankings: { triad_bandwidth: [], memory_latency: [] },
          summary: {
            totalInstances: 0,
            architectures: [],
            bestMemoryBandwidth: {
              instanceType: '',
              bandwidth: 0,
              unit: 'GB/s',
            },
            bestMemoryLatency: { instanceType: '', latency: 0, unit: 'ns' },
          },
        }
      }

      // Process CPU benchmarks (optional)
      if (cpuResponse.status === 'fulfilled' && cpuResponse.value.ok) {
        database.cpu = await cpuResponse.value.json()
      }

      // Process pricing data (optional)
      if (pricingResponse.status === 'fulfilled' && pricingResponse.value.ok) {
        database.pricing = await pricingResponse.value.json()
      }

      this.cachedData = database
      this.lastFetch = now

      console.log(
        `Benchmark data loaded: ${database.memory?.summary.totalInstances || 0} instances`
      )
      return database
    } catch (error) {
      console.error('Failed to fetch benchmark data:', error)

      // Return cached data if available, otherwise minimal structure
      if (this.cachedData) {
        return this.cachedData
      }

      throw new Error('Benchmark data unavailable and no cache available')
    }
  }

  /**
   * Get benchmark data for a specific instance type
   */
  static async getInstanceBenchmarks(
    instanceType: string
  ): Promise<InstanceBenchmarkData | null> {
    try {
      const database = await this.fetchBenchmarkData()

      return {
        memory: database.memory?.instances[instanceType],
        cpu: database.cpu?.instances[instanceType],
        pricing: database.pricing?.instances[instanceType],
      }
    } catch (error) {
      console.error(`Failed to get benchmarks for ${instanceType}:`, error)
      return null
    }
  }

  /**
   * Generate performance insights for an instance based on benchmark data
   */
  static generatePerformanceInsights(
    instanceType: string,
    benchmarks: InstanceBenchmarkData,
    workloadType?: string
  ): PerformanceInsight[] {
    // workloadType could be used for workload-specific insights in the future
    void workloadType
    const insights: PerformanceInsight[] = []

    if (!benchmarks.memory && !benchmarks.cpu) {
      insights.push({
        type: 'architecture',
        severity: 'info',
        message: `No benchmark data available for ${instanceType}. Consider using a well-benchmarked alternative.`,
      })
      return insights
    }

    // Memory performance insights
    if (benchmarks.memory) {
      const triadBandwidth = benchmarks.memory.stream.triad.bandwidth
      const memoryLatency = benchmarks.memory.cache.memory.latency

      // High memory bandwidth detection
      if (triadBandwidth > 200) {
        insights.push({
          type: 'memory',
          severity: 'recommendation',
          message: `Excellent memory bandwidth (${triadBandwidth} GB/s) - ideal for memory-intensive workloads like genomics or climate modeling`,
          data: { bandwidth: triadBandwidth, unit: 'GB/s' },
        })
      }

      // Low memory latency detection
      if (memoryLatency < 80) {
        insights.push({
          type: 'memory',
          severity: 'info',
          message: `Low memory latency (${memoryLatency} ns) benefits latency-sensitive applications`,
          data: { latency: memoryLatency, unit: 'ns' },
        })
      }

      // NUMA topology insights
      if (benchmarks.memory.numa.socketCount > 1) {
        const numaEfficiency =
          benchmarks.memory.numa.remoteBandwidth /
          benchmarks.memory.numa.localBandwidth
        if (numaEfficiency < 0.7) {
          insights.push({
            type: 'memory',
            severity: 'warning',
            message: `Multi-socket NUMA penalty detected (${(numaEfficiency * 100).toFixed(1)}% remote efficiency). Consider memory locality optimizations.`,
            data: {
              numaEfficiency,
              socketCount: benchmarks.memory.numa.socketCount,
            },
          })
        }
      }
    }

    // CPU performance insights
    if (benchmarks.cpu) {
      const gflops = benchmarks.cpu.linpack.gflops
      const smtEfficiency = benchmarks.cpu.scaling.smtEfficiency

      // High compute performance
      if (gflops > 500) {
        insights.push({
          type: 'cpu',
          severity: 'recommendation',
          message: `High compute performance (${gflops.toFixed(1)} GFLOPS) - excellent for CPU-intensive research workloads`,
          data: { gflops },
        })
      }

      // SMT/Hyperthreading efficiency
      if (smtEfficiency > 1.3) {
        insights.push({
          type: 'cpu',
          severity: 'info',
          message: `Good SMT scaling (${smtEfficiency.toFixed(2)}x) - benefits from enabling hyperthreading`,
          data: { smtEfficiency },
        })
      } else if (smtEfficiency < 1.1) {
        insights.push({
          type: 'cpu',
          severity: 'warning',
          message: `Poor SMT scaling (${smtEfficiency.toFixed(2)}x) - consider disabling hyperthreading for this workload`,
          data: { smtEfficiency },
        })
      }

      // Vectorization capabilities
      if (
        benchmarks.cpu.vectorization.avx512 &&
        benchmarks.cpu.vectorization.avx512 >
          benchmarks.cpu.vectorization.avx2! * 1.5
      ) {
        insights.push({
          type: 'cpu',
          severity: 'recommendation',
          message:
            'Strong AVX-512 performance - compile with -mavx512f for optimal results',
          data: {
            avx512: benchmarks.cpu.vectorization.avx512,
            avx2: benchmarks.cpu.vectorization.avx2,
          },
        })
      }
    }

    // Cost efficiency insights
    if (benchmarks.pricing) {
      const costPerGflop = benchmarks.pricing.costEfficiency.costPerGflop
      const spotReliability = benchmarks.pricing.spot.reliability

      if (costPerGflop < 0.001) {
        insights.push({
          type: 'cost',
          severity: 'recommendation',
          message: `Outstanding cost efficiency ($${costPerGflop.toFixed(4)}/GFLOP) - excellent value for compute workloads`,
          data: { costPerGflop },
        })
      }

      if (spotReliability > 0.99) {
        insights.push({
          type: 'cost',
          severity: 'recommendation',
          message: `High spot instance reliability (${(spotReliability * 100).toFixed(1)}%) with ${((1 - benchmarks.pricing.spot.current / benchmarks.pricing.onDemand) * 100).toFixed(0)}% cost savings`,
          data: {
            reliability: spotReliability,
            savings:
              1 - benchmarks.pricing.spot.current / benchmarks.pricing.onDemand,
          },
        })
      }
    }

    return insights
  }

  /**
   * Compare multiple instances based on benchmark data
   */
  static async compareInstances(
    instanceTypes: string[],
    metric:
      | 'memory-bandwidth'
      | 'cpu-performance'
      | 'cost-efficiency' = 'memory-bandwidth'
  ): Promise<
    Array<{
      instanceType: string
      score: number
      benchmarks: InstanceBenchmarkData
    }>
  > {
    await this.fetchBenchmarkData()

    const comparisons = await Promise.all(
      instanceTypes.map(async instanceType => {
        const benchmarks = await this.getInstanceBenchmarks(instanceType)
        let score = 0

        if (benchmarks) {
          switch (metric) {
            case 'memory-bandwidth':
              score = benchmarks.memory?.stream.triad.bandwidth || 0
              break
            case 'cpu-performance':
              score = benchmarks.cpu?.linpack.gflops || 0
              break
            case 'cost-efficiency':
              score = benchmarks.pricing
                ? 1 /
                  (benchmarks.pricing.costEfficiency.costPerGflop || Infinity)
                : 0
              break
          }
        }

        return {
          instanceType,
          score,
          benchmarks: benchmarks || {},
        }
      })
    )

    return comparisons.sort((a, b) => b.score - a.score)
  }

  /**
   * Get top performing instances by category
   */
  static async getTopPerformers(
    category: 'memory' | 'cpu' | 'cost',
    count = 10
  ): Promise<
    Array<{ instanceType: string; value: number; architecture: string }>
  > {
    const database = await this.fetchBenchmarkData()

    switch (category) {
      case 'memory':
        return (
          database.memory?.rankings.triad_bandwidth
            .slice(0, count)
            .map(item => ({ ...item, value: item.bandwidth })) || []
        )
      case 'cpu':
        return (
          database.cpu?.rankings.peak_gflops
            ?.slice(0, count)
            .map(item => ({ ...item, value: item.gflops })) || []
        )
      case 'cost':
        // Would come from pricing rankings when available
        return []
    }
  }

  /**
   * Check if benchmark data is available for an instance
   */
  static async hasBenchmarkData(instanceType: string): Promise<boolean> {
    try {
      const benchmarks = await this.getInstanceBenchmarks(instanceType)
      return !!(benchmarks?.memory || benchmarks?.cpu)
    } catch {
      return false
    }
  }
}
