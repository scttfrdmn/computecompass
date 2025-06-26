import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RAGIntegrationService, RAGIntegrationError } from './rag-integration'
import { RAGService } from './rag-service'
import { VectorDatabaseInitService } from './vector-database-init'
import type { ComputeRequirements } from '../types/aws-types'
import type { WorkloadPattern, OptimizationResult } from '../types/consumption'
import type { InstanceMatch } from '../types/instance-types'

// Mock dependencies
vi.mock('./rag-service', () => ({
  RAGService: {
    initialize: vi.fn(),
    recommendInstances: vi.fn(),
    optimizeCostStrategy: vi.fn(),
    analyzeWorkloadPerformance: vi.fn(),
    processQuery: vi.fn()
  }
}))

vi.mock('./vector-database-init', () => ({
  VectorDatabaseInitService: {
    initializeAndPopulate: vi.fn(),
    isVectorDatabaseReady: vi.fn(),
    getPopulationStats: vi.fn(),
    refreshDatabase: vi.fn()
  }
}))

// Mock data
const mockRequirements: ComputeRequirements = {
  minVCpus: 4,
  maxVCpus: 16,
  minMemoryGiB: 8,
  maxMemoryGiB: 32,
  gpuRequired: false,
  architecture: ['x86_64']
}

const mockWorkloadPattern: WorkloadPattern = {
  id: 'test-workload',
  name: 'Test Genomics Analysis',
  description: 'Test workload for genomics research',
  runsPerDay: 5,
  avgDurationHours: 2,
  daysPerWeek: 5,
  instanceRequirements: {
    vCpus: 8,
    memoryGiB: 16,
    gpuRequired: false,
    storageGiB: 100
  },
  seasonality: {
    type: 'steady',
    description: 'Consistent usage'
  },
  timeOfDay: 'any',
  interruptible: true,
  priority: 'normal',
  team: 'bioinformatics',
  project: 'genome-analysis'
}

const mockOptimizationResult: OptimizationResult = {
  id: 'test-optimization',
  optimalStrategy: [
    {
      id: 'strategy-1',
      instanceType: 'm7i.large',
      quantity: 2,
      purchaseType: 'reserved',
      commitment: '1yr',
      hourlyCost: 0.08,
      monthlyCost: 115.2,
      estimatedUtilization: 85,
      purpose: 'Base capacity',
      coveredWorkloads: ['test-workload'],
      riskLevel: 'low'
    }
  ],
  alternativeScenarios: [],
  costSavings: {
    monthlySavings: 500,
    annualSavings: 6000,
    savingsPercentage: 25
  },
  riskAssessment: {
    overall: 'low',
    spotInterruption: 0.05,
    costVariability: 'low',
    commitmentRisk: 'low'
  },
  recommendations: ['Consider increasing reserved capacity'],
  confidenceLevel: 85,
  optimizationMetrics: {
    strategiesCount: 1,
    purchaseTypeDistribution: { reserved: 1 },
    averageUtilization: 85,
    riskDistribution: { low: 1, medium: 0, high: 0 }
  }
}

const mockInstanceMatches: InstanceMatch[] = [
  {
    instanceType: 'm7i.large',
    score: 85.5,
    reasons: ['Good CPU performance', 'Cost effective'],
    specifications: {
      vCpus: 2,
      memoryGiB: 8,
      gpuCount: 0,
      storageGiB: 0,
      networkPerformance: 'Up to 12.5 Gbps',
      architecture: 'x86_64'
    },
    pricing: {
      onDemand: { pricePerHour: '0.10', region: 'us-east-1' },
      reserved1yr: { pricePerHour: '0.08', region: 'us-east-1' },
      reserved3yr: { pricePerHour: '0.06', region: 'us-east-1' },
      spot: { pricePerHour: '0.04', region: 'us-east-1', availability: 'high' }
    },
    performanceInsights: []
  }
]

describe('RAGIntegrationService', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup default mock implementations
    vi.mocked(RAGService.initialize).mockResolvedValue()
    vi.mocked(VectorDatabaseInitService.initializeAndPopulate).mockResolvedValue()
    vi.mocked(VectorDatabaseInitService.isVectorDatabaseReady).mockReturnValue(true)
    vi.mocked(VectorDatabaseInitService.getPopulationStats).mockReturnValue({
      instances: 10,
      benchmarks: 5,
      workloads: 8,
      caseStudies: 3,
      performancePatterns: 3,
      totalDocuments: 29
    })
    
    // Mock RAG service responses
    vi.mocked(RAGService.recommendInstances).mockResolvedValue({
      recommendations: [
        {
          id: 'rec-1',
          type: 'instance_change',
          title: 'Switch to m7i.large',
          description: 'Better price-performance ratio',
          impact: {
            costSavings: { monthly: 200, annual: 2400, percentage: 15 },
            complexity: 'low'
          },
          implementation: {
            steps: [],
            estimatedTime: '2 hours',
            prerequisites: [],
            risks: []
          },
          confidence: 0.9,
          priority: 'medium',
          timeframe: 'short_term'
        }
      ],
      insights: [
        {
          id: 'insight-1',
          type: 'optimization_opportunity',
          title: 'Memory bandwidth optimization',
          description: 'Current setup underutilizes memory bandwidth',
          metrics: [],
          confidence: 0.8,
          implications: []
        }
      ],
      reasoning: 'Based on workload analysis, m7i.large provides optimal performance'
    })
    
    vi.mocked(RAGService.optimizeCostStrategy).mockResolvedValue({
      recommendations: [
        {
          id: 'cost-rec-1',
          type: 'cost_optimization',
          title: 'Add spot instances',
          description: 'Use spot instances for fault-tolerant workloads',
          impact: {
            costSavings: { monthly: 150, annual: 1800, percentage: 10 },
            complexity: 'medium'
          },
          implementation: {
            steps: [],
            estimatedTime: '4 hours',
            prerequisites: [],
            risks: []
          },
          confidence: 0.85,
          priority: 'high',
          timeframe: 'short_term'
        }
      ],
      insights: [],
      alternativeStrategies: ['Conservative Reserved-heavy approach', 'Aggressive Spot strategy']
    })
    
    vi.mocked(RAGService.analyzeWorkloadPerformance).mockResolvedValue({
      insights: [
        {
          id: 'perf-insight-1',
          type: 'bottleneck_identification',
          title: 'CPU utilization pattern',
          description: 'Workload shows consistent CPU utilization',
          metrics: [],
          confidence: 0.9,
          implications: []
        }
      ],
      optimizationOpportunities: [
        {
          id: 'perf-opt-1',
          type: 'performance_tuning',
          title: 'Optimize CPU allocation',
          description: 'Adjust vCPU count for better performance',
          impact: {
            performanceGain: { metric: 'throughput', improvement: 25, unit: '%' },
            complexity: 'low'
          },
          implementation: {
            steps: [],
            estimatedTime: '1 hour',
            prerequisites: [],
            risks: []
          },
          confidence: 0.8,
          priority: 'medium',
          timeframe: 'immediate'
        }
      ],
      benchmarkComparisons: ['m7i.large vs c7i.large: 20% better memory bandwidth']
    })
    
    vi.mocked(RAGService.processQuery).mockResolvedValue({
      id: 'response-1',
      queryId: 'query-1',
      response: 'For genomics workloads, I recommend m7i instances for balanced performance.',
      confidence: 0.85,
      citations: [],
      recommendations: [],
      insights: [],
      metadata: {
        processingTime: 1500,
        documentsRetrieved: 5,
        vectorSearchTime: 200,
        llmGenerationTime: 800,
        confidenceBreakdown: {
          retrieval: 0.9,
          generation: 0.8,
          overall: 0.85
        },
        modelUsed: 'claude-3-sonnet',
        tokensUsed: { input: 500, output: 150 }
      },
      timestamp: new Date()
    })
  })

  describe('initialization', () => {
    it('should initialize with default configuration', async () => {
      await RAGIntegrationService.initialize()

      expect(RAGService.initialize).toHaveBeenCalled()
      expect(VectorDatabaseInitService.initializeAndPopulate).toHaveBeenCalled()
      
      const status = RAGIntegrationService.getSystemStatus()
      expect(status.isInitialized).toBe(true)
    })

    it('should initialize with custom configuration', async () => {
      const customConfig = {
        vectorDatabase: {
          provider: 'pinecone' as const,
          dimensions: 1024
        },
        aiModel: {
          provider: 'openai' as const,
          temperature: 0.5
        },
        features: {
          enableAutoInit: false
        }
      }

      await RAGIntegrationService.initialize(customConfig)

      expect(RAGService.initialize).toHaveBeenCalled()
      
      // Should not auto-initialize database when disabled
      expect(VectorDatabaseInitService.initializeAndPopulate).not.toHaveBeenCalled()
      
      const status = RAGIntegrationService.getSystemStatus()
      expect(status.configuration.vectorDatabase.provider).toBe('pinecone')
      expect(status.configuration.aiModel.temperature).toBe(0.5)
    })

    it('should handle lazy initialization', async () => {
      // First call should trigger initialization
      await RAGIntegrationService.ensureInitialized()
      expect(RAGService.initialize).toHaveBeenCalledTimes(1)
      
      // Second call should not trigger initialization again
      await RAGIntegrationService.ensureInitialized()
      expect(RAGService.initialize).toHaveBeenCalledTimes(1)
    })
  })

  describe('instance recommendations', () => {
    it('should get AI-powered instance recommendations', async () => {
      const result = await RAGIntegrationService.getInstanceRecommendations(
        mockRequirements,
        mockWorkloadPattern,
        mockInstanceMatches
      )

      expect(result.recommendations).toHaveLength(1)
      expect(result.insights).toHaveLength(1)
      expect(result.reasoning).toBeTruthy()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
      
      expect(RAGService.recommendInstances).toHaveBeenCalledWith(
        expect.objectContaining({
          computeRequirements: mockRequirements,
          workloadPattern: mockWorkloadPattern,
          currentInstances: mockInstanceMatches,
          researchDomain: 'computational_biology'
        }),
        mockInstanceMatches
      )
    })

    it('should work without workload pattern or candidate instances', async () => {
      const result = await RAGIntegrationService.getInstanceRecommendations(
        mockRequirements
      )

      expect(result.recommendations).toBeDefined()
      expect(result.insights).toBeDefined()
      expect(result.reasoning).toBeTruthy()
      
      expect(RAGService.recommendInstances).toHaveBeenCalledWith(
        expect.objectContaining({
          computeRequirements: mockRequirements
        }),
        []
      )
    })

    it('should calculate recommendation confidence correctly', async () => {
      const result = await RAGIntegrationService.getInstanceRecommendations(
        mockRequirements,
        mockWorkloadPattern,
        mockInstanceMatches
      )

      // Should have high confidence with full context
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  describe('cost optimization', () => {
    it('should get cost optimization suggestions', async () => {
      const budgetConstraints = {
        maxMonthlyCost: 2000,
        spotInstanceTolerance: 0.3
      }

      const result = await RAGIntegrationService.getCostOptimizationSuggestions(
        mockWorkloadPattern,
        mockOptimizationResult,
        budgetConstraints
      )

      expect(result.recommendations).toHaveLength(1)
      expect(result.alternativeStrategies).toHaveLength(2)
      expect(result.potentialSavings).toBeGreaterThanOrEqual(0)
      
      expect(RAGService.optimizeCostStrategy).toHaveBeenCalledWith(
        expect.objectContaining({
          workloadPattern: mockWorkloadPattern,
          optimizationResults: mockOptimizationResult,
          budgetConstraints
        }),
        mockOptimizationResult
      )
    })

    it('should estimate additional savings correctly', async () => {
      const result = await RAGIntegrationService.getCostOptimizationSuggestions(
        mockWorkloadPattern,
        mockOptimizationResult
      )

      // Should estimate additional savings based on recommendations
      expect(result.potentialSavings).toBeGreaterThan(0)
      expect(result.potentialSavings).toBeLessThanOrEqual(25)
    })

    it('should work without budget constraints', async () => {
      const result = await RAGIntegrationService.getCostOptimizationSuggestions(
        mockWorkloadPattern,
        mockOptimizationResult
      )

      expect(result.recommendations).toBeDefined()
      expect(result.alternativeStrategies).toBeDefined()
    })
  })

  describe('workload performance analysis', () => {
    it('should analyze workload performance', async () => {
      const result = await RAGIntegrationService.getWorkloadPerformanceAnalysis(
        mockWorkloadPattern,
        mockRequirements
      )

      expect(result.insights).toHaveLength(1)
      expect(result.optimizationOpportunities).toHaveLength(1)
      expect(result.benchmarkComparisons).toHaveLength(1)
      expect(result.performanceScore).toBeGreaterThan(0)
      expect(result.performanceScore).toBeLessThanOrEqual(1)
      
      expect(RAGService.analyzeWorkloadPerformance).toHaveBeenCalledWith(
        expect.objectContaining({
          computeRequirements: mockRequirements,
          workloadPattern: mockWorkloadPattern,
          researchDomain: 'computational_biology'
        })
      )
    })

    it('should calculate performance score correctly', async () => {
      const result = await RAGIntegrationService.getWorkloadPerformanceAnalysis(
        mockWorkloadPattern,
        mockRequirements
      )

      // Performance score should be based on insights confidence
      expect(result.performanceScore).toBe(0.9) // From mock insight confidence
    })

    it('should handle empty insights gracefully', async () => {
      vi.mocked(RAGService.analyzeWorkloadPerformance).mockResolvedValue({
        insights: [],
        optimizationOpportunities: [],
        benchmarkComparisons: []
      })

      const result = await RAGIntegrationService.getWorkloadPerformanceAnalysis(
        mockWorkloadPattern,
        mockRequirements
      )

      expect(result.performanceScore).toBe(0.5) // Default score for no insights
    })
  })

  describe('natural language queries', () => {
    it('should process natural language query about cost optimization', async () => {
      const query = 'How can I reduce costs for my genomics workload?'
      
      const result = await RAGIntegrationService.processNaturalLanguageQuery(query)

      expect(result.response).toBeTruthy()
      expect(result.confidence).toBeGreaterThan(0)
      
      expect(RAGService.processQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cost_optimization',
          userQuery: query,
          context: expect.objectContaining({
            experienceLevel: 'beginner'
          })
        })
      )
    })

    it('should process query about performance', async () => {
      const query = 'What is the best instance for high-performance computing with NUMA optimization?'
      
      await RAGIntegrationService.processNaturalLanguageQuery(query)

      expect(RAGService.processQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'performance_analysis',
          userQuery: query,
          context: expect.objectContaining({
            experienceLevel: 'expert' // Should detect technical terms
          })
        })
      )
    })

    it('should process query with context', async () => {
      const query = 'What do you recommend for my current setup?'
      const context = {
        currentInstances: mockInstanceMatches,
        workloadPattern: mockWorkloadPattern
      }
      
      await RAGIntegrationService.processNaturalLanguageQuery(query, context)

      expect(RAGService.processQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            currentInstances: mockInstanceMatches,
            workloadPattern: mockWorkloadPattern
          })
        })
      )
    })

    it('should infer query type correctly', async () => {
      const testCases = [
        { query: 'save money on AWS costs', expectedType: 'cost_optimization' },
        { query: 'benchmark performance comparison', expectedType: 'performance_analysis' },
        { query: 'match my workload requirements', expectedType: 'workload_matching' },
        { query: 'recommend instance type', expectedType: 'instance_recommendation' }
      ]

      for (const testCase of testCases) {
        await RAGIntegrationService.processNaturalLanguageQuery(testCase.query)
        
        expect(RAGService.processQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            type: testCase.expectedType
          })
        )
      }
    })
  })

  describe('system management', () => {
    it('should provide system status', () => {
      const status = RAGIntegrationService.getSystemStatus()

      expect(status.isInitialized).toBe(false) // Not initialized in this test
      expect(status.databaseReady).toBe(true) // From mock
      expect(status.populationStats).toBeDefined()
      expect(status.configuration).toBeDefined()
    })

    it('should refresh knowledge base', async () => {
      // First initialize
      await RAGIntegrationService.initialize()
      
      // Then refresh
      await RAGIntegrationService.refreshKnowledgeBase()
      
      expect(VectorDatabaseInitService.refreshDatabase).toHaveBeenCalled()
    })

    it('should throw error when refreshing uninitialized system', async () => {
      await expect(RAGIntegrationService.refreshKnowledgeBase())
        .rejects.toThrow('RAG Integration Service not initialized')
    })
  })

  describe('utility methods', () => {
    it('should infer research domains correctly', async () => {
      const testCases = [
        { team: 'bioinformatics', expectedDomain: 'computational_biology' },
        { team: 'ai-research', expectedDomain: 'machine_learning' },
        { team: 'climate', expectedDomain: 'climate_modeling' },
        { team: 'unknown', expectedDomain: 'general_research' }
      ]

      for (const testCase of testCases) {
        const workload = { ...mockWorkloadPattern, team: testCase.team }
        
        await RAGIntegrationService.getInstanceRecommendations(
          mockRequirements,
          workload
        )

        expect(RAGService.recommendInstances).toHaveBeenCalledWith(
          expect.objectContaining({
            researchDomain: testCase.expectedDomain
          }),
          expect.any(Array)
        )
      }
    })

    it('should infer experience levels correctly', async () => {
      const testCases = [
        { query: 'simple recommendation please', expectedLevel: 'beginner' },
        { query: 'optimize throughput and latency', expectedLevel: 'intermediate' },
        { query: 'SIMD vectorization and cache hierarchy', expectedLevel: 'expert' }
      ]

      for (const testCase of testCases) {
        await RAGIntegrationService.processNaturalLanguageQuery(testCase.query)
        
        expect(RAGService.processQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            context: expect.objectContaining({
              experienceLevel: testCase.expectedLevel
            })
          })
        )
      }
    })
  })

  describe('error handling', () => {
    it('should handle RAG service initialization errors', async () => {
      vi.mocked(RAGService.initialize).mockRejectedValue(new Error('RAG init failed'))

      await expect(RAGIntegrationService.initialize())
        .rejects.toThrow('RAG init failed')
    })

    it('should handle vector database initialization errors', async () => {
      vi.mocked(VectorDatabaseInitService.initializeAndPopulate).mockRejectedValue(
        new Error('Database init failed')
      )

      await expect(RAGIntegrationService.initialize())
        .rejects.toThrow('Database init failed')
    })

    it('should handle recommendation service errors gracefully', async () => {
      vi.mocked(RAGService.recommendInstances).mockRejectedValue(
        new Error('Recommendation failed')
      )

      await expect(
        RAGIntegrationService.getInstanceRecommendations(mockRequirements)
      ).rejects.toThrow('Recommendation failed')
    })
  })

  describe('configuration merging', () => {
    it('should merge configurations correctly', async () => {
      const customConfig = {
        vectorDatabase: {
          dimensions: 1024 // Override default
        },
        aiModel: {
          temperature: 0.3 // Override default
        }
        // Other settings should use defaults
      }

      await RAGIntegrationService.initialize(customConfig)

      const status = RAGIntegrationService.getSystemStatus()
      expect(status.configuration.vectorDatabase.dimensions).toBe(1024)
      expect(status.configuration.aiModel.temperature).toBe(0.3)
      expect(status.configuration.vectorDatabase.provider).toBe('local') // Default
      expect(status.configuration.features.enableAutoInit).toBe(true) // Default
    })
  })
})