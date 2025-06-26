import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VectorDatabaseInitService } from './vector-database-init'
import { VectorDatabaseService } from './vector-database'
import { AWSService } from './aws-service'
import { BenchmarkDataService } from './benchmark-data'
import type { VectorDatabaseConfig } from '../types/rag-system'
import type { InstanceType } from '../types/aws-types'

// Mock configuration for testing
const mockConfig: VectorDatabaseConfig = {
  provider: 'local',
  indexName: 'test-rag-index',
  dimensions: 128,
  embeddingModel: 'test-embedding-model',
  similarityMetric: 'cosine'
}

// Mock instance data
const mockInstances: InstanceType[] = [
  {
    InstanceType: 'm7i.large',
    VCpuInfo: {
      DefaultVCpus: 2,
      DefaultCores: 1
    },
    MemoryInfo: {
      SizeInMiB: 8192
    },
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64']
    },
    NetworkInfo: {
      NetworkPerformance: 'Up to 12.5 Gigabit'
    }
  },
  {
    InstanceType: 'c7i.xlarge',
    VCpuInfo: {
      DefaultVCpus: 4,
      DefaultCores: 2
    },
    MemoryInfo: {
      SizeInMiB: 8192
    },
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64']
    },
    NetworkInfo: {
      NetworkPerformance: 'Up to 12.5 Gigabit'
    }
  },
  {
    InstanceType: 'p4d.24xlarge',
    VCpuInfo: {
      DefaultVCpus: 96,
      DefaultCores: 48
    },
    MemoryInfo: {
      SizeInMiB: 1179648
    },
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64']
    },
    NetworkInfo: {
      NetworkPerformance: '400 Gigabit'
    },
    GpuInfo: {
      Gpus: [
        {
          Name: 'A100',
          Manufacturer: 'NVIDIA',
          Count: 8,
          MemoryInfo: {
            SizeInMiB: 40960
          }
        }
      ]
    }
  }
]

// Mock benchmark data
const mockBenchmarkData = {
  instances: {
    'm7i.large': {
      benchmarks: {
        'STREAM': {
          memory_bandwidth: 25600,
          memory_latency: 65
        }
      }
    },
    'c7i.xlarge': {
      benchmarks: {
        'LINPACK': {
          compute_performance: 45.2,
          parallel_efficiency: 0.92
        }
      }
    }
  }
}

// Mock services
vi.mock('./aws-service', () => ({
  AWSService: {
    getInstanceTypes: vi.fn()
  }
}))

vi.mock('./benchmark-data', () => ({
  BenchmarkDataService: {
    isDataAvailable: vi.fn(),
    fetchBenchmarkData: vi.fn()
  }
}))

vi.mock('./vector-database', () => ({
  VectorDatabaseService: {
    initialize: vi.fn(),
    clearDatabase: vi.fn(),
    addDocuments: vi.fn(),
    getStatistics: vi.fn()
  }
}))

describe('VectorDatabaseInitService', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup default mock implementations
    vi.mocked(AWSService.getInstanceTypes).mockResolvedValue(mockInstances)
    vi.mocked(BenchmarkDataService.isDataAvailable).mockReturnValue(true)
    vi.mocked(BenchmarkDataService.fetchBenchmarkData).mockResolvedValue(mockBenchmarkData)
    vi.mocked(VectorDatabaseService.initialize).mockResolvedValue()
    vi.mocked(VectorDatabaseService.clearDatabase).mockResolvedValue()
    vi.mocked(VectorDatabaseService.addDocuments).mockResolvedValue()
    vi.mocked(VectorDatabaseService.getStatistics).mockResolvedValue({
      totalDocuments: 25,
      documentsByType: {
        instance_specification: 3,
        benchmark_result: 2,
        workload_template: 8,
        optimization_case_study: 3,
        performance_pattern: 3,
        research_paper: 0,
        user_feedback: 0,
        cost_analysis: 0
      },
      avgEmbeddingSize: 128,
      lastUpdated: new Date()
    })
  })

  describe('initialization and population', () => {
    it('should initialize and populate database successfully', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      expect(VectorDatabaseService.initialize).toHaveBeenCalledWith(mockConfig)
      expect(VectorDatabaseService.clearDatabase).toHaveBeenCalled()
      expect(VectorDatabaseService.addDocuments).toHaveBeenCalled()
      expect(VectorDatabaseService.getStatistics).toHaveBeenCalled()
      
      const stats = VectorDatabaseInitService.getPopulationStats()
      expect(stats.totalDocuments).toBe(25)
      expect(stats.instances).toBeGreaterThan(0)
      expect(stats.benchmarks).toBeGreaterThan(0)
      expect(stats.workloads).toBeGreaterThan(0)
      expect(stats.caseStudies).toBeGreaterThan(0)
      expect(stats.performancePatterns).toBeGreaterThan(0)
    })

    it('should handle AWS service errors gracefully', async () => {
      vi.mocked(AWSService.getInstanceTypes).mockRejectedValue(new Error('AWS API Error'))

      await expect(VectorDatabaseInitService.initializeAndPopulate(mockConfig))
        .resolves.not.toThrow()

      expect(VectorDatabaseService.initialize).toHaveBeenCalled()
      
      // Should still populate other data types even if instances fail
      const stats = VectorDatabaseInitService.getPopulationStats()
      expect(stats.instances).toBe(0) // Failed to populate
      expect(stats.workloads).toBeGreaterThan(0) // Other data still populated
    })

    it('should use synthetic benchmark data when real data unavailable', async () => {
      vi.mocked(BenchmarkDataService.isDataAvailable).mockReturnValue(false)

      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      expect(BenchmarkDataService.fetchBenchmarkData).not.toHaveBeenCalled()
      
      const stats = VectorDatabaseInitService.getPopulationStats()
      expect(stats.benchmarks).toBeGreaterThan(0) // Synthetic data added
    })

    it('should fall back to synthetic data on benchmark fetch error', async () => {
      vi.mocked(BenchmarkDataService.fetchBenchmarkData).mockRejectedValue(new Error('Fetch error'))

      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const stats = VectorDatabaseInitService.getPopulationStats()
      expect(stats.benchmarks).toBeGreaterThan(0) // Fallback synthetic data
    })
  })

  describe('instance specification population', () => {
    it('should create comprehensive instance specification documents', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      // Check that addDocuments was called with instance specifications
      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const instanceCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'instance_specification')
      )
      
      expect(instanceCalls.length).toBeGreaterThan(0)
      
      const instanceDocs = instanceCalls[0][0]
      expect(instanceDocs).toHaveLength(3) // mockInstances.length
      
      // Check document structure
      const doc = instanceDocs[0]
      expect(doc.id).toMatch(/^instance-spec-/)
      expect(doc.type).toBe('instance_specification')
      expect(doc.content).toContain('AWS')
      expect(doc.content).toContain('vCPUs')
      expect(doc.metadata.source).toBe('AWS EC2 API')
      expect(doc.metadata.instanceTypes).toHaveLength(1)
      expect(doc.metadata.reliability).toBe(1.0)
    })

    it('should handle different instance types correctly', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const instanceCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'instance_specification')
      )
      
      const instanceDocs = instanceCalls[0][0]
      
      // Check GPU instance handling
      const gpuDoc = instanceDocs.find(doc => doc.content.includes('p4d.24xlarge'))
      expect(gpuDoc).toBeDefined()
      expect(gpuDoc!.content).toContain('GPU')
      expect(gpuDoc!.content).toContain('A100')

      // Check general purpose instance
      const generalDoc = instanceDocs.find(doc => doc.content.includes('m7i.large'))
      expect(generalDoc).toBeDefined()
      expect(generalDoc!.content).toContain('general-purpose')
    })
  })

  describe('benchmark data population', () => {
    it('should create benchmark documents from real data', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const benchmarkCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'benchmark_result')
      )
      
      expect(benchmarkCalls.length).toBeGreaterThan(0)
      
      const benchmarkDocs = benchmarkCalls[0][0]
      expect(benchmarkDocs.length).toBeGreaterThan(0)
      
      // Check document structure
      const doc = benchmarkDocs[0]
      expect(doc.id).toMatch(/^benchmark-/)
      expect(doc.type).toBe('benchmark_result')
      expect(doc.content).toContain('benchmark')
      expect(doc.metadata.category).toBe('performance_benchmark')
      expect(doc.metadata.benchmarkSuite).toBeDefined()
      expect(doc.metadata.performanceMetrics).toBeDefined()
    })

    it('should generate synthetic benchmark data when needed', async () => {
      vi.mocked(BenchmarkDataService.isDataAvailable).mockReturnValue(false)

      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const benchmarkCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'benchmark_result')
      )
      
      expect(benchmarkCalls.length).toBeGreaterThan(0)
      
      const benchmarkDocs = benchmarkCalls[0][0]
      expect(benchmarkDocs.length).toBeGreaterThan(0)
      
      // Check synthetic data characteristics
      const syntheticDoc = benchmarkDocs[0]
      expect(syntheticDoc.id).toMatch(/^synthetic-benchmark-/)
      expect(syntheticDoc.metadata.source).toBe('ComputeCompass Synthetic Benchmarks')
      expect(syntheticDoc.metadata.reliability).toBe(0.8) // Lower reliability for synthetic
    })

    it('should include performance analysis in benchmark content', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const benchmarkCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'benchmark_result')
      )
      
      const benchmarkDocs = benchmarkCalls[0][0]
      
      // Should include analysis based on performance metrics
      const hasAnalysis = benchmarkDocs.some(doc => 
        doc.content.includes('performance') && 
        (doc.content.includes('excellent') || doc.content.includes('good') || doc.content.includes('ideal'))
      )
      expect(hasAnalysis).toBe(true)
    })
  })

  describe('workload pattern population', () => {
    it('should populate workload templates and domain patterns', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const workloadCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'workload_template')
      )
      
      expect(workloadCalls.length).toBeGreaterThan(0)
      
      const workloadDocs = workloadCalls[0][0]
      expect(workloadDocs.length).toBeGreaterThan(0)
      
      // Should include both template workloads and domain-specific patterns
      const hasTemplateWorkloads = workloadDocs.some(doc => 
        doc.id.includes('workload-pattern-') && 
        doc.metadata.source === 'ComputeCompass Research Templates'
      )
      expect(hasTemplateWorkloads).toBe(true)
      
      const hasDomainPatterns = workloadDocs.some(doc => 
        doc.id.includes('domain-pattern-') && 
        doc.metadata.source === 'ComputeCompass Domain Analysis'
      )
      expect(hasDomainPatterns).toBe(true)
    })

    it('should include comprehensive domain-specific patterns', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const workloadCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'workload_template')
      )
      
      const workloadDocs = workloadCalls[0][0]
      const domainPatterns = workloadDocs.filter(doc => doc.id.includes('domain-pattern-'))
      
      // Should cover major research domains
      const domains = domainPatterns.map(doc => doc.content.toLowerCase())
      expect(domains.some(content => content.includes('computational biology'))).toBe(true)
      expect(domains.some(content => content.includes('climate modeling'))).toBe(true)
      expect(domains.some(content => content.includes('machine learning'))).toBe(true)
      expect(domains.some(content => content.includes('financial modeling'))).toBe(true)
    })
  })

  describe('optimization case studies population', () => {
    it('should create meaningful case study documents', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const caseStudyCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'optimization_case_study')
      )
      
      expect(caseStudyCalls.length).toBeGreaterThan(0)
      
      const caseStudyDocs = caseStudyCalls[0][0]
      expect(caseStudyDocs.length).toBeGreaterThan(0)
      
      // Check document structure
      const doc = caseStudyDocs[0]
      expect(doc.id).toMatch(/^case-study-/)
      expect(doc.type).toBe('optimization_case_study')
      expect(doc.content).toContain('cost')
      expect(doc.content).toMatch(/\d+%/) // Should contain percentage savings
      expect(doc.metadata.category).toBe('cost_optimization')
      expect(doc.metadata.costSavings).toBeGreaterThan(0)
    })

    it('should cover different optimization scenarios', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const caseStudyCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'optimization_case_study')
      )
      
      const caseStudyDocs = caseStudyCalls[0][0]
      
      // Should cover different workload types
      const workloadTypes = caseStudyDocs.flatMap(doc => doc.metadata.workloadTypes || [])
      expect(workloadTypes).toContain('genomics')
      expect(workloadTypes).toContain('climate_modeling')
      expect(workloadTypes).toContain('machine_learning')
    })
  })

  describe('performance pattern population', () => {
    it('should create performance insight documents', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const patternCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'performance_pattern')
      )
      
      expect(patternCalls.length).toBeGreaterThan(0)
      
      const patternDocs = patternCalls[0][0]
      expect(patternDocs.length).toBeGreaterThan(0)
      
      // Check document structure
      const doc = patternDocs[0]
      expect(doc.id).toMatch(/^performance-pattern-/)
      expect(doc.type).toBe('performance_pattern')
      expect(doc.content).toContain('performance')
      expect(doc.metadata.category).toBe('performance_pattern')
      expect(doc.metadata.performanceMetrics).toBeDefined()
    })

    it('should include various performance insights', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const patternCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'performance_pattern')
      )
      
      const patternDocs = patternCalls[0][0]
      
      // Should cover different performance aspects
      const patterns = patternDocs.map(doc => doc.content.toLowerCase())
      expect(patterns.some(content => content.includes('memory bandwidth'))).toBe(true)
      expect(patterns.some(content => content.includes('gpu utilization'))).toBe(true)
      expect(patterns.some(content => content.includes('network performance'))).toBe(true)
    })
  })

  describe('database management', () => {
    it('should track population statistics correctly', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const stats = VectorDatabaseInitService.getPopulationStats()
      
      expect(stats.instances).toBeGreaterThanOrEqual(0)
      expect(stats.benchmarks).toBeGreaterThanOrEqual(0)
      expect(stats.workloads).toBeGreaterThanOrEqual(0)
      expect(stats.caseStudies).toBeGreaterThanOrEqual(0)
      expect(stats.performancePatterns).toBeGreaterThanOrEqual(0)
      expect(stats.totalDocuments).toBe(25) // From mock statistics
    })

    it('should report database readiness correctly', async () => {
      expect(VectorDatabaseInitService.isVectorDatabaseReady()).toBe(false)
      
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)
      
      expect(VectorDatabaseInitService.isVectorDatabaseReady()).toBe(true)
    })

    it('should refresh database successfully', async () => {
      // First initialize
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)
      
      // Then refresh
      await VectorDatabaseInitService.refreshDatabase()
      
      // Should clear and repopulate
      expect(VectorDatabaseService.clearDatabase).toHaveBeenCalledTimes(2) // Once for init, once for refresh
      
      const stats = VectorDatabaseInitService.getPopulationStats()
      expect(stats.totalDocuments).toBe(25)
    })

    it('should throw error when refreshing uninitialized database', async () => {
      await expect(VectorDatabaseInitService.refreshDatabase())
        .rejects.toThrow('Database not initialized')
    })
  })

  describe('content generation', () => {
    it('should generate appropriate use case descriptions for instance families', async () => {
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const instanceCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'instance_specification')
      )
      
      const instanceDocs = instanceCalls[0][0]
      
      // Check that different families get appropriate descriptions
      const m7iDoc = instanceDocs.find(doc => doc.content.includes('m7i.large'))
      expect(m7iDoc?.content).toContain('general-purpose')
      
      const c7iDoc = instanceDocs.find(doc => doc.content.includes('c7i.xlarge'))
      expect(c7iDoc?.content).toContain('compute-intensive')
      
      const p4dDoc = instanceDocs.find(doc => doc.content.includes('p4d.24xlarge'))
      expect(p4dDoc?.content).toContain('machine learning')
    })

    it('should generate performance analysis for benchmarks', async () => {
      vi.mocked(BenchmarkDataService.isDataAvailable).mockReturnValue(false)
      
      await VectorDatabaseInitService.initializeAndPopulate(mockConfig)

      const addDocumentsCalls = vi.mocked(VectorDatabaseService.addDocuments).mock.calls
      const benchmarkCalls = addDocumentsCalls.filter(call => 
        call[0].some(doc => doc.type === 'benchmark_result')
      )
      
      const benchmarkDocs = benchmarkCalls[0][0]
      
      // Should include qualitative analysis
      const hasQualitativeAnalysis = benchmarkDocs.some(doc => 
        doc.content.includes('excellent') || 
        doc.content.includes('ideal') || 
        doc.content.includes('optimized')
      )
      expect(hasQualitativeAnalysis).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle partial failures gracefully', async () => {
      // Mock one service to fail
      vi.mocked(AWSService.getInstanceTypes).mockRejectedValue(new Error('Service unavailable'))
      
      await expect(VectorDatabaseInitService.initializeAndPopulate(mockConfig))
        .resolves.not.toThrow()
      
      // Should still populate other data types
      const stats = VectorDatabaseInitService.getPopulationStats()
      expect(stats.instances).toBe(0) // Failed
      expect(stats.workloads).toBeGreaterThan(0) // Succeeded
      expect(stats.totalDocuments).toBeGreaterThan(0) // Overall success
    })

    it('should handle database service errors', async () => {
      vi.mocked(VectorDatabaseService.addDocuments).mockRejectedValue(new Error('Database error'))
      
      await expect(VectorDatabaseInitService.initializeAndPopulate(mockConfig))
        .resolves.not.toThrow()
      
      // Should handle gracefully and continue with other operations
      expect(VectorDatabaseService.initialize).toHaveBeenCalled()
    })
  })
})