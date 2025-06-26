# Benchmark Integration Plan: ComputeCompass + aws-instance-benchmarks

## Repository Structure

### aws-instance-benchmarks Repository

```
aws-instance-benchmarks/
├── README.md
├── data/
│   ├── raw/                    # Raw benchmark results by date
│   │   ├── 2024-06-26/
│   │   │   ├── m7i.large.json
│   │   │   ├── m7i.xlarge.json
│   │   │   └── ...
│   ├── processed/              # Aggregated, validated data
│   │   ├── latest/
│   │   │   ├── memory-benchmarks.json
│   │   │   ├── cpu-benchmarks.json
│   │   │   ├── instance-rankings.json
│   │   │   └── price-performance.json
│   │   ├── historical/
│   │   │   ├── 2024-06/
│   │   │   └── ...
│   └── schemas/                # JSON schemas for validation
│       ├── benchmark-result.json
│       ├── instance-spec.json
│       └── performance-summary.json
├── tools/                      # Benchmark collection tools
│   ├── containers/
│   ├── spack-configs/
│   ├── deployment/
│   └── analysis/
├── scripts/
│   ├── validate-data.py
│   ├── generate-summaries.py
│   └── update-rankings.py
└── docs/
    ├── methodology.md
    ├── data-format.md
    └── api.md
```

## Open Data Format

### Standardized JSON Schema

```typescript
// benchmark-result.schema.ts
interface BenchmarkResult {
  metadata: {
    instanceType: string
    instanceFamily: string
    region: string
    availabilityZone: string
    processorArchitecture:
      | 'intel'
      | 'amd'
      | 'graviton'
      | 'inferentia'
      | 'trainium'
    processorGeneration: string
    numaTopology: {
      socketCount: number
      coresPerSocket: number
      threadsPerCore: number
      memoryChannels: number
    }
    benchmark: {
      suite: string
      version: string
      compiler: string
      compilerFlags: string[]
      optimizationLevel: string
    }
    environment: {
      containerImage: string
      kernelVersion: string
      gccVersion: string
      timestamp: string
      duration: number
    }
  }

  performance: {
    memory: {
      stream: {
        copy: { bandwidth: number; unit: 'GB/s' }
        scale: { bandwidth: number; unit: 'GB/s' }
        add: { bandwidth: number; unit: 'GB/s' }
        triad: { bandwidth: number; unit: 'GB/s' }
      }
      cache: {
        l1: { latency: number; bandwidth: number; unit: 'cycles|GB/s' }
        l2: { latency: number; bandwidth: number; unit: 'cycles|GB/s' }
        l3: { latency: number; bandwidth: number; unit: 'cycles|GB/s' }
        memory: { latency: number; unit: 'ns' }
      }
      numa: {
        localBandwidth: number
        remoteBandwidth: number
        interSocketLatency: number
      }
    }

    cpu: {
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
        sse2: number
        avx2: number
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

    pricing: {
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
  }

  validation: {
    checksums: {
      md5: string
      sha256: string
    }
    reproducibility: {
      runs: number
      stddev: number
      confidence: number
    }
  }
}
```

## ComputeCompass Integration

### Benchmark Data Service

```typescript
// src/services/benchmark-data.ts
export class BenchmarkDataService {
  private static readonly GITHUB_BASE_URL =
    'https://raw.githubusercontent.com/scttfrdmn/aws-instance-benchmarks/main/data/processed/latest'

  /**
   * Fetch latest benchmark data from GitHub
   */
  static async fetchBenchmarkData(): Promise<BenchmarkDatabase> {
    const [memory, cpu, rankings, pricing] = await Promise.all([
      fetch(`${this.GITHUB_BASE_URL}/memory-benchmarks.json`).then(r =>
        r.json()
      ),
      fetch(`${this.GITHUB_BASE_URL}/cpu-benchmarks.json`).then(r => r.json()),
      fetch(`${this.GITHUB_BASE_URL}/instance-rankings.json`).then(r =>
        r.json()
      ),
      fetch(`${this.GITHUB_BASE_URL}/price-performance.json`).then(r =>
        r.json()
      ),
    ])

    return {
      memory,
      cpu,
      rankings,
      pricing,
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Get performance data for specific instance
   */
  static getInstancePerformance(
    instanceType: string
  ): InstancePerformance | null {
    const data = this.cachedBenchmarkData
    return data?.instances[instanceType] || null
  }

  /**
   * Compare instances by performance metric
   */
  static compareInstances(
    instanceTypes: string[],
    metric: 'memory-bandwidth' | 'cpu-performance' | 'cost-efficiency'
  ): InstanceComparison[] {
    // Implementation for performance comparisons
  }
}
```

### Enhanced Instance Matching with Benchmarks

```typescript
// src/services/instance-matcher.ts - Enhanced
export class InstanceMatcher {
  constructor(private benchmarkData: BenchmarkDataService) {}

  async matchInstancesWithPerformance(
    requirements: ComputeRequirements,
    performancePriorities: PerformancePriorities
  ): Promise<EnhancedInstanceMatch[]> {
    const instances = await this.getMatchingInstances(requirements)

    return instances.map(instance => {
      const benchmarkData = this.benchmarkData.getInstancePerformance(
        instance.InstanceType
      )

      return {
        instance,
        performanceScore: this.calculatePerformanceScore(
          instance,
          benchmarkData,
          performancePriorities
        ),
        benchmarkData,
        insights: this.generatePerformanceInsights(instance, benchmarkData),
        recommendations: this.generateOptimizationRecommendations(
          instance,
          benchmarkData
        ),
      }
    })
  }

  private generatePerformanceInsights(
    instance: InstanceType,
    benchmarks: BenchmarkResult
  ): string[] {
    const insights = []

    // Memory-bound workload insights
    if (benchmarks?.performance.memory.stream.triad.bandwidth > 200) {
      insights.push(
        `Excellent memory bandwidth (${benchmarks.performance.memory.stream.triad.bandwidth} GB/s) for memory-intensive workloads`
      )
    }

    // NUMA insights
    if (benchmarks?.metadata.numaTopology.socketCount > 1) {
      const efficiency =
        benchmarks.performance.memory.numa.remoteBandwidth /
        benchmarks.performance.memory.numa.localBandwidth
      insights.push(
        `Multi-socket NUMA efficiency: ${(efficiency * 100).toFixed(1)}% - consider workload memory locality`
      )
    }

    // Cost-performance insights
    if (benchmarks?.performance.pricing.costEfficiency.costPerGflop < 0.001) {
      insights.push(
        `Outstanding cost/performance ratio: $${benchmarks.performance.pricing.costEfficiency.costPerGflop}/GFLOP`
      )
    }

    return insights
  }
}
```

## GitHub-Based Open Database Benefits

### 1. **Accessibility & Transparency**

```yaml
# GitHub releases for versioned datasets
Release: v2024.06.26
Assets:
  - aws-benchmarks-complete.tar.gz # Full dataset
  - aws-benchmarks-summary.json # Lightweight summary
  - aws-benchmarks-intel.json # Intel instances only
  - aws-benchmarks-graviton.json # Graviton instances only
```

### 2. **Community Contributions**

```yaml
# Pull request workflow for community benchmarks
community-contributions/
├── templates/
│   ├── benchmark-submission.md
│   └── instance-request.md
├── validation/
│   ├── automated-checks.yml
│   └── peer-review.md
└── credits/
└── contributors.md
```

### 3. **Data Validation Pipeline**

```yaml
# .github/workflows/validate-benchmarks.yml
name: Validate Benchmark Data
on:
  pull_request:
    paths: ['data/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Schema Validation
        run: python scripts/validate-data.py
      - name: Performance Sanity Checks
        run: python scripts/sanity-checks.py
      - name: Generate Summary Reports
        run: python scripts/generate-summaries.py
```

## Integration Timeline

### Phase 1: Repository Setup (Week 1)

1. Create `aws-instance-benchmarks` repository
2. Define JSON schemas and data formats
3. Set up validation pipeline
4. Create initial benchmark collection tools

### Phase 2: Data Collection (Weeks 2-4)

1. Deploy benchmark containers across instance families
2. Collect initial dataset (50+ instance types)
3. Validate and process results
4. Generate first public release

### Phase 3: ComputeCompass Integration (Week 3-4)

1. Implement BenchmarkDataService in ComputeCompass
2. Enhance instance matching with performance data
3. Add performance insights to UI
4. Test integration with real benchmark data

### Phase 4: Community & RAG (Weeks 5-8)

1. Open repository for community contributions
2. Implement RAG system with benchmark data
3. Add AI chat interface with performance awareness
4. Continuous data collection and updates

## Data Usage Examples

### API Access Patterns

```javascript
// For other tools to consume
fetch(
  'https://raw.githubusercontent.com/scttfrdmn/aws-instance-benchmarks/main/data/processed/latest/instance-rankings.json'
)
  .then(response => response.json())
  .then(data => {
    // Use benchmark data in other applications
    const bestMemoryInstances = data.rankings.memory_bandwidth.top10
    const bestCostPerformance = data.rankings.cost_efficiency.top10
  })
```

This approach creates a truly open, community-driven database that benefits the entire research computing community while providing ComputeCompass with unparalleled performance insights.

Would you like me to proceed with creating the `aws-instance-benchmarks` repository structure and initial schemas?
