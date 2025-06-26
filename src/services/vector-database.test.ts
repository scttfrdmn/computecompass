import { describe, it, expect, beforeEach } from 'vitest'
import { VectorDatabaseService, VectorDatabaseError } from './vector-database'
import type {
  VectorDatabaseConfig,
  VectorDocument,
  VectorSearchQuery,
  DocumentType,
} from '../types/rag-system'
import type { InstanceType, BenchmarkData } from '../types/aws-types'
import type { WorkloadPattern } from '../types/consumption'

// Mock configuration for testing
const mockConfig: VectorDatabaseConfig = {
  provider: 'local',
  indexName: 'test-index',
  dimensions: 128, // Smaller for testing
  embeddingModel: 'test-model',
  similarityMetric: 'cosine'
}

// Mock data
const mockInstance: InstanceType = {
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
}

const mockBenchmark: BenchmarkData = {
  instanceType: 'm7i.large',
  suite: 'STREAM',
  results: {
    'memory_bandwidth': { value: 25000, unit: 'MB/s' },
    'memory_latency': { value: 65, unit: 'ns' }
  },
  metadata: {
    testDate: '2024-01-15',
    notes: 'Standard STREAM benchmark'
  }
}

const mockWorkload: WorkloadPattern = {
  id: 'test-workload',
  name: 'Test Genomics Workload',
  description: 'A test workload for genomics analysis',
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
    description: 'Consistent usage year-round'
  },
  timeOfDay: 'any',
  interruptible: true,
  priority: 'normal',
  team: 'bioinformatics',
  project: 'genome-analysis'
}

describe('VectorDatabaseService', () => {
  beforeEach(async () => {
    // Initialize with fresh state for each test
    await VectorDatabaseService.initialize(mockConfig)
    await VectorDatabaseService.clearDatabase()
  })

  describe('initialization', () => {
    it('should initialize with local provider', async () => {
      await expect(VectorDatabaseService.initialize(mockConfig))
        .resolves.not.toThrow()
    })

    it('should throw error for unsupported provider', async () => {
      const invalidConfig = {
        ...mockConfig,
        provider: 'unsupported' as any
      }

      await expect(VectorDatabaseService.initialize(invalidConfig))
        .rejects.toThrow('Unsupported vector database provider')
    })

    it('should support different providers', async () => {
      const providers = ['local', 'pinecone', 'weaviate', 'chroma']
      
      for (const provider of providers) {
        const config = { ...mockConfig, provider: provider as any }
        await expect(VectorDatabaseService.initialize(config))
          .resolves.not.toThrow()
      }
    })
  })

  describe('document management', () => {
    it('should add a single document', async () => {
      const document: Omit<VectorDocument, 'embedding'> = {
        id: 'test-doc-1',
        type: 'benchmark_result',
        content: 'Test benchmark data for m7i.large showing excellent memory performance',
        metadata: {
          source: 'test-source',
          category: 'benchmark',
          instanceTypes: ['m7i.large'],
          reliability: 0.9,
          dateRelevance: 0.8
        },
        lastUpdated: new Date()
      }

      await expect(VectorDatabaseService.addDocument(document))
        .resolves.not.toThrow()

      const retrieved = await VectorDatabaseService.getDocumentsByIds(['test-doc-1'])
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].id).toBe('test-doc-1')
      expect(retrieved[0].embedding).toBeDefined()
      expect(retrieved[0].embedding).toHaveLength(mockConfig.dimensions)
    })

    it('should add multiple documents in batch', async () => {
      const documents: Omit<VectorDocument, 'embedding'>[] = [
        {
          id: 'batch-doc-1',
          type: 'instance_specification',
          content: 'AWS m7i.large instance specification',
          metadata: {
            source: 'AWS API',
            category: 'instance',
            instanceTypes: ['m7i.large'],
            reliability: 1.0,
            dateRelevance: 1.0
          },
          lastUpdated: new Date()
        },
        {
          id: 'batch-doc-2',
          type: 'workload_template',
          content: 'Genomics analysis workload pattern',
          metadata: {
            source: 'ComputeCompass',
            category: 'workload',
            workloadTypes: ['genomics'],
            reliability: 0.95,
            dateRelevance: 0.9
          },
          lastUpdated: new Date()
        }
      ]

      await expect(VectorDatabaseService.addDocuments(documents))
        .resolves.not.toThrow()

      const stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(2)
    })

    it('should update existing document', async () => {
      // Add initial document
      const document: Omit<VectorDocument, 'embedding'> = {
        id: 'update-test',
        type: 'benchmark_result',
        content: 'Original content',
        metadata: {
          source: 'test',
          category: 'test',
          reliability: 0.8,
          dateRelevance: 0.7
        },
        lastUpdated: new Date()
      }

      await VectorDatabaseService.addDocument(document)

      // Update the document
      await VectorDatabaseService.updateDocument('update-test', {
        content: 'Updated content',
        metadata: {
          ...document.metadata,
          reliability: 0.9
        }
      })

      const retrieved = await VectorDatabaseService.getDocumentsByIds(['update-test'])
      expect(retrieved[0].content).toBe('Updated content')
      expect(retrieved[0].metadata.reliability).toBe(0.9)
    })

    it('should delete document', async () => {
      const document: Omit<VectorDocument, 'embedding'> = {
        id: 'delete-test',
        type: 'benchmark_result',
        content: 'Document to be deleted',
        metadata: {
          source: 'test',
          category: 'test',
          reliability: 0.8,
          dateRelevance: 0.7
        },
        lastUpdated: new Date()
      }

      await VectorDatabaseService.addDocument(document)
      await VectorDatabaseService.deleteDocument('delete-test')

      const retrieved = await VectorDatabaseService.getDocumentsByIds(['delete-test'])
      expect(retrieved).toHaveLength(0)
    })

    it('should throw error when updating non-existent document', async () => {
      await expect(VectorDatabaseService.updateDocument('non-existent', { content: 'test' }))
        .rejects.toThrow('Document not found')
    })
  })

  describe('vector search', () => {
    beforeEach(async () => {
      // Add test documents for search
      const documents: Omit<VectorDocument, 'embedding'>[] = [
        {
          id: 'search-1',
          type: 'instance_specification',
          content: 'AWS m7i.large instance with excellent memory performance for genomics',
          metadata: {
            source: 'AWS',
            category: 'instance',
            instanceTypes: ['m7i.large'],
            workloadTypes: ['genomics'],
            reliability: 0.9,
            dateRelevance: 0.9
          },
          lastUpdated: new Date()
        },
        {
          id: 'search-2',
          type: 'benchmark_result',
          content: 'STREAM benchmark results showing high memory bandwidth for compute instances',
          metadata: {
            source: 'benchmark',
            category: 'performance',
            instanceTypes: ['c7i.large'],
            performanceMetrics: ['memory_bandwidth'],
            reliability: 0.85,
            dateRelevance: 0.8
          },
          lastUpdated: new Date()
        },
        {
          id: 'search-3',
          type: 'workload_template',
          content: 'Machine learning training workload requiring GPU acceleration',
          metadata: {
            source: 'templates',
            category: 'workload',
            workloadTypes: ['machine_learning'],
            reliability: 0.95,
            dateRelevance: 0.9
          },
          lastUpdated: new Date()
        }
      ]

      await VectorDatabaseService.addDocuments(documents)
    })

    it('should perform basic vector search', async () => {
      const queryEmbedding = await VectorDatabaseService.generateEmbedding('memory performance genomics')
      
      const searchQuery: VectorSearchQuery = {
        embedding: queryEmbedding,
        limit: 5,
        threshold: 0.1
      }

      const results = await VectorDatabaseService.search(searchQuery)
      
      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results.length).toBeLessThanOrEqual(5)
      
      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score)
      }
    })

    it('should filter search results by document type', async () => {
      const queryEmbedding = await VectorDatabaseService.generateEmbedding('performance benchmark')
      
      const searchQuery: VectorSearchQuery = {
        embedding: queryEmbedding,
        filters: {
          documentTypes: ['benchmark_result']
        },
        limit: 5
      }

      const results = await VectorDatabaseService.search(searchQuery)
      
      expect(results.every(r => r.document.type === 'benchmark_result')).toBe(true)
    })

    it('should filter search results by instance types', async () => {
      const queryEmbedding = await VectorDatabaseService.generateEmbedding('instance specification')
      
      const searchQuery: VectorSearchQuery = {
        embedding: queryEmbedding,
        filters: {
          instanceTypes: ['m7i']
        },
        limit: 5
      }

      const results = await VectorDatabaseService.search(searchQuery)
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(r => 
        r.document.metadata.instanceTypes?.some(type => type.includes('m7i'))
      )).toBe(true)
    })

    it('should filter search results by workload types', async () => {
      const queryEmbedding = await VectorDatabaseService.generateEmbedding('workload analysis')
      
      const searchQuery: VectorSearchQuery = {
        embedding: queryEmbedding,
        filters: {
          workloadTypes: ['genomics']
        },
        limit: 5
      }

      const results = await VectorDatabaseService.search(searchQuery)
      
      if (results.length > 0) {
        expect(results.every(r => 
          r.document.metadata.workloadTypes?.includes('genomics')
        )).toBe(true)
      }
    })

    it('should respect threshold parameter', async () => {
      const queryEmbedding = await VectorDatabaseService.generateEmbedding('unrelated query text')
      
      const highThresholdQuery: VectorSearchQuery = {
        embedding: queryEmbedding,
        limit: 10,
        threshold: 0.95 // Very high threshold
      }

      const results = await VectorDatabaseService.search(highThresholdQuery)
      
      // With high threshold, should return fewer or no results
      expect(results.every(r => r.score >= 0.95)).toBe(true)
    })

    it('should limit search results correctly', async () => {
      const queryEmbedding = await VectorDatabaseService.generateEmbedding('test query')
      
      const limitedQuery: VectorSearchQuery = {
        embedding: queryEmbedding,
        limit: 2
      }

      const results = await VectorDatabaseService.search(limitedQuery)
      expect(results.length).toBeLessThanOrEqual(2)
    })
  })

  describe('embedding generation', () => {
    it('should generate embeddings with correct dimensions', async () => {
      const text = 'Test text for embedding generation'
      const embedding = await VectorDatabaseService.generateEmbedding(text)
      
      expect(embedding).toHaveLength(mockConfig.dimensions)
      expect(embedding.every(val => typeof val === 'number')).toBe(true)
    })

    it('should generate consistent embeddings for same text', async () => {
      const text = 'Consistent embedding test'
      const embedding1 = await VectorDatabaseService.generateEmbedding(text)
      const embedding2 = await VectorDatabaseService.generateEmbedding(text)
      
      expect(embedding1).toEqual(embedding2)
    })

    it('should generate different embeddings for different text', async () => {
      const text1 = 'First text sample'
      const text2 = 'Second text sample'
      const embedding1 = await VectorDatabaseService.generateEmbedding(text1)
      const embedding2 = await VectorDatabaseService.generateEmbedding(text2)
      
      expect(embedding1).not.toEqual(embedding2)
    })

    it('should normalize embeddings', async () => {
      const text = 'Normalization test'
      const embedding = await VectorDatabaseService.generateEmbedding(text)
      
      // Check if embedding is normalized (magnitude should be close to 1)
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
      expect(magnitude).toBeCloseTo(1, 5)
    })
  })

  describe('similarity calculations', () => {
    it('should calculate cosine similarity correctly', async () => {
      const text1 = 'memory performance benchmark'
      const text2 = 'memory performance analysis'
      const text3 = 'GPU acceleration machine learning'
      
      const embedding1 = await VectorDatabaseService.generateEmbedding(text1)
      const embedding2 = await VectorDatabaseService.generateEmbedding(text2)
      const embedding3 = await VectorDatabaseService.generateEmbedding(text3)
      
      // Add documents and search
      await VectorDatabaseService.addDocument({
        id: 'sim-test-1',
        type: 'benchmark_result',
        content: text2,
        metadata: { source: 'test', category: 'test', reliability: 0.9, dateRelevance: 0.9 },
        lastUpdated: new Date()
      })
      
      await VectorDatabaseService.addDocument({
        id: 'sim-test-2',
        type: 'benchmark_result',
        content: text3,
        metadata: { source: 'test', category: 'test', reliability: 0.9, dateRelevance: 0.9 },
        lastUpdated: new Date()
      })
      
      const results = await VectorDatabaseService.search({
        embedding: embedding1,
        limit: 2
      })
      
      expect(results).toHaveLength(2)
      
      // More similar text should have higher score
      const result1 = results.find(r => r.document.id === 'sim-test-1')
      const result2 = results.find(r => r.document.id === 'sim-test-2')
      
      if (result1 && result2) {
        expect(result1.score).toBeGreaterThan(result2.score)
      }
    })
  })

  describe('data population', () => {
    it('should populate instance data', async () => {
      const instances = [mockInstance]
      
      await expect(VectorDatabaseService.populateInstanceData(instances))
        .resolves.not.toThrow()
      
      const stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(1)
      expect(stats.documentsByType.instance_specification).toBe(1)
    })

    it('should populate benchmark data', async () => {
      const benchmarks = [mockBenchmark]
      
      await expect(VectorDatabaseService.populateBenchmarkData(benchmarks))
        .resolves.not.toThrow()
      
      const stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(1)
      expect(stats.documentsByType.benchmark_result).toBe(1)
    })

    it('should populate workload patterns', async () => {
      const workloads = [mockWorkload]
      
      await expect(VectorDatabaseService.populateWorkloadPatterns(workloads))
        .resolves.not.toThrow()
      
      const stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(1)
      expect(stats.documentsByType.workload_template).toBe(1)
    })

    it('should populate multiple data types', async () => {
      await VectorDatabaseService.populateInstanceData([mockInstance])
      await VectorDatabaseService.populateBenchmarkData([mockBenchmark])
      await VectorDatabaseService.populateWorkloadPatterns([mockWorkload])
      
      const stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(3)
      expect(stats.documentsByType.instance_specification).toBe(1)
      expect(stats.documentsByType.benchmark_result).toBe(1)
      expect(stats.documentsByType.workload_template).toBe(1)
    })
  })

  describe('database statistics', () => {
    it('should return correct statistics for empty database', async () => {
      const stats = await VectorDatabaseService.getStatistics()
      
      expect(stats.totalDocuments).toBe(0)
      expect(stats.avgEmbeddingSize).toBe(0)
      expect(stats.lastUpdated).toBeNull()
    })

    it('should return correct statistics for populated database', async () => {
      await VectorDatabaseService.populateInstanceData([mockInstance])
      await VectorDatabaseService.populateBenchmarkData([mockBenchmark])
      
      const stats = await VectorDatabaseService.getStatistics()
      
      expect(stats.totalDocuments).toBe(2)
      expect(stats.avgEmbeddingSize).toBe(mockConfig.dimensions)
      expect(stats.lastUpdated).toBeInstanceOf(Date)
      expect(stats.documentsByType.instance_specification).toBe(1)
      expect(stats.documentsByType.benchmark_result).toBe(1)
    })
  })

  describe('error handling', () => {
    it('should throw error when not initialized', async () => {
      // Create a fresh service instance
      const freshService = Object.create(VectorDatabaseService)
      freshService.isInitialized = false
      
      await expect(freshService.search({ embedding: [], limit: 1 }))
        .rejects.toThrow('Vector database not initialized')
    })

    it('should handle invalid embedding dimensions', async () => {
      // This would be caught by the similarity calculation
      const document: Omit<VectorDocument, 'embedding'> = {
        id: 'invalid-dim-test',
        type: 'benchmark_result',
        content: 'Test content',
        metadata: {
          source: 'test',
          category: 'test',
          reliability: 0.9,
          dateRelevance: 0.9
        },
        lastUpdated: new Date()
      }
      
      await VectorDatabaseService.addDocument(document)
      
      const invalidEmbedding = Array(64).fill(0) // Wrong dimensions
      
      await expect(VectorDatabaseService.search({
        embedding: invalidEmbedding,
        limit: 1
      })).rejects.toThrow('Embedding dimensions must match')
    })
  })

  describe('database operations', () => {
    it('should clear database successfully', async () => {
      await VectorDatabaseService.populateInstanceData([mockInstance])
      
      let stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(1)
      
      await VectorDatabaseService.clearDatabase()
      
      stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(0)
    })

    it('should handle batch operations efficiently', async () => {
      const batchSize = 5
      const documents: Omit<VectorDocument, 'embedding'>[] = Array(batchSize).fill(null).map((_, i) => ({
        id: `batch-${i}`,
        type: 'benchmark_result',
        content: `Batch document ${i} with test content`,
        metadata: {
          source: 'batch-test',
          category: 'test',
          reliability: 0.9,
          dateRelevance: 0.9
        },
        lastUpdated: new Date()
      }))
      
      const startTime = Date.now()
      await VectorDatabaseService.addDocuments(documents)
      const endTime = Date.now()
      
      const stats = await VectorDatabaseService.getStatistics()
      expect(stats.totalDocuments).toBe(batchSize)
      
      // Should complete reasonably quickly
      expect(endTime - startTime).toBeLessThan(5000)
    })
  })
})