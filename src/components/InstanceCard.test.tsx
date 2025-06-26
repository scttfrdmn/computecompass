import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InstanceCard } from './InstanceCard'
import type { InstanceMatch } from '../types'
import type {
  InstanceBenchmarkData,
  PerformanceInsight,
} from '../services/benchmark-data'

const mockInstance: InstanceMatch = {
  instance: {
    InstanceType: 'm7i.large',
    VCpuInfo: {
      DefaultVCpus: 2,
      DefaultCores: 1,
      DefaultThreadsPerCore: 2,
    },
    MemoryInfo: { SizeInMiB: 8192 },
    NetworkInfo: {
      NetworkPerformance: 'Up to 12.5 Gigabit',
      MaximumNetworkInterfaces: 2,
      Ipv4AddressesPerInterface: 6,
      Ipv6AddressesPerInterface: 6,
      Ipv6Supported: true,
    },
    ProcessorInfo: {
      Features: ['AVX', 'AVX2', 'AVX512'],
      Manufacturer: 'Intel',
    },
  },
  pricing: {
    onDemand: 0.1008,
    reserved1yr: 0.0605,
    reserved3yr: 0.0403,
    spotCurrent: 0.0302,
  },
  matchScore: 85,
  matchReasons: ['High memory bandwidth', 'Cost efficient for workload'],
}

const mockBenchmarkData: InstanceBenchmarkData = {
  memory: {
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
      memory: { latency: 85, unit: 'ns' },
    },
    numa: {
      socketCount: 1,
      localBandwidth: 41.9,
      remoteBandwidth: 0,
      interSocketLatency: 0,
    },
  },
}

const mockInsights: PerformanceInsight[] = [
  {
    type: 'memory',
    severity: 'info',
    message:
      'Low memory latency (85 ns) benefits latency-sensitive applications',
  },
  {
    type: 'cost',
    severity: 'recommendation',
    message: 'Good value for compute workloads',
  },
]

describe('InstanceCard', () => {
  it('should render instance basic information', () => {
    render(<InstanceCard instance={mockInstance} rank={1} />)

    expect(screen.getByText('m7i.large')).toBeInTheDocument()
    expect(screen.getByText('Rank #1')).toBeInTheDocument()
    expect(screen.getByText('Score: 85')).toBeInTheDocument()
    expect(screen.getAllByText('$0.1008/hr')[0]).toBeInTheDocument() // Header price
  })

  it('should display core specifications', () => {
    render(<InstanceCard instance={mockInstance} rank={1} />)

    expect(screen.getByText('2')).toBeInTheDocument() // vCPUs
    expect(screen.getByText('8 GiB')).toBeInTheDocument() // Memory
    expect(screen.getByText('Up to 12.5 Gigabit')).toBeInTheDocument() // Network
  })

  it('should show processor information when available', () => {
    render(<InstanceCard instance={mockInstance} rank={1} />)

    expect(screen.getByText('Processor')).toBeInTheDocument()
    expect(screen.getByText(/Features:/)).toBeInTheDocument()
  })

  it('should display benchmark data when provided', () => {
    render(
      <InstanceCard
        instance={mockInstance}
        rank={1}
        benchmarkData={mockBenchmarkData}
      />
    )

    expect(screen.getByText('Performance Benchmarks')).toBeInTheDocument()
    expect(screen.getByText('41.9 GB/s')).toBeInTheDocument() // Memory bandwidth
    expect(screen.getByText('Latency: 85 ns')).toBeInTheDocument()
  })

  it('should show performance insights when provided', () => {
    render(
      <InstanceCard
        instance={mockInstance}
        rank={1}
        performanceInsights={mockInsights}
      />
    )

    expect(screen.getByText('Performance Insights')).toBeInTheDocument()
    expect(screen.getByText(/Low memory latency/)).toBeInTheDocument()
    expect(screen.getByText(/Good value for compute/)).toBeInTheDocument()
  })

  it('should display match reasons', () => {
    render(<InstanceCard instance={mockInstance} rank={1} />)

    expect(screen.getByText('Why This Instance?')).toBeInTheDocument()
    expect(screen.getByText('High memory bandwidth')).toBeInTheDocument()
    expect(screen.getByText('Cost efficient for workload')).toBeInTheDocument()
  })

  it('should handle missing optional data gracefully', () => {
    const minimalInstance: InstanceMatch = {
      instance: {
        InstanceType: 't3.micro',
        VCpuInfo: {
          DefaultVCpus: 1,
          DefaultCores: 1,
          DefaultThreadsPerCore: 1,
        },
        MemoryInfo: { SizeInMiB: 1024 },
      },
      pricing: {
        onDemand: 0.0104,
        reserved1yr: 0.0062,
        reserved3yr: 0.0041,
        spotCurrent: 0.0031,
      },
      matchScore: 45,
      matchReasons: [],
    }

    render(<InstanceCard instance={minimalInstance} rank={5} />)

    expect(screen.getByText('t3.micro')).toBeInTheDocument()
    expect(screen.getByText('Score: 45')).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument() // Network should show N/A
  })

  it('should display comprehensive pricing information', () => {
    render(<InstanceCard instance={mockInstance} rank={1} />)

    // Should show pricing options section
    expect(screen.getByText('Pricing Options')).toBeInTheDocument()
    expect(screen.getAllByText('On-Demand')).toHaveLength(2) // Header and pricing card
    expect(screen.getByText('Spot Current')).toBeInTheDocument()
  })

  it('should limit displayed insights to 3', () => {
    const manyInsights: PerformanceInsight[] = [
      ...mockInsights,
      { type: 'cpu', severity: 'info', message: 'Additional insight 1' },
      { type: 'cpu', severity: 'info', message: 'Additional insight 2' },
      { type: 'cpu', severity: 'info', message: 'Additional insight 3' },
    ]

    render(
      <InstanceCard
        instance={mockInstance}
        rank={1}
        performanceInsights={manyInsights}
      />
    )

    expect(screen.getByText('+2 more insights')).toBeInTheDocument()
  })
})
