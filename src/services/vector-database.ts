/**
 * Vector Database Service
 * 
 * Manages vector embeddings for benchmark data, instance specifications,
 * and research workload patterns to enable semantic search and RAG functionality
 */

import type {
  VectorDocument,
  DocumentType,
  DocumentMetadata,
  VectorSearchQuery,
  VectorSearchResult,
  VectorDatabaseConfig,
  BenchmarkConditions,
} from '../types/rag-system'
import type { InstanceType, BenchmarkData } from '../types/aws-types'
import type { WorkloadPattern } from '../types/consumption'

/**
 * Vector Database Service for managing embeddings and semantic search
 */
export class VectorDatabaseService {
  private static config: VectorDatabaseConfig
  private static documents: Map<string, VectorDocument> = new Map()
  private static isInitialized = false

  /**
   * Initialize the vector database with configuration
   */
  static async initialize(config: VectorDatabaseConfig): Promise<void> {
    this.config = config
    
    // Initialize based on provider
    switch (config.provider) {
      case 'local':
        await this.initializeLocalDatabase()
        break
      case 'pinecone':
        await this.initializePinecone()
        break
      case 'weaviate':
        await this.initializeWeaviate()
        break
      case 'chroma':
        await this.initializeChroma()
        break
      default:
        throw new Error(`Unsupported vector database provider: ${config.provider}`)
    }
    
    this.isInitialized = true
    console.log(`Vector database initialized with provider: ${config.provider}`)
  }

  /**
   * Add a document to the vector database
   */
  static async addDocument(document: Omit<VectorDocument, 'embedding'>): Promise<void> {
    this.ensureInitialized()
    
    // Generate embedding for the document content
    const embedding = await this.generateEmbedding(document.content)
    
    const vectorDocument: VectorDocument = {
      ...document,
      embedding,
      lastUpdated: new Date()
    }
    
    // Store in the database
    await this.storeDocument(vectorDocument)
    
    console.log(`Added document: ${document.id} (${document.type})`)
  }

  /**
   * Add multiple documents in batch
   */
  static async addDocuments(documents: Omit<VectorDocument, 'embedding'>[]): Promise<void> {
    console.log(`Adding ${documents.length} documents to vector database...`)
    
    const batchSize = 10
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      await Promise.all(batch.map(doc => this.addDocument(doc)))
      
      // Progress logging
      const progress = Math.min(i + batchSize, documents.length)
      console.log(`Progress: ${progress}/${documents.length} documents added`)
    }
    
    console.log('Batch document addition completed')
  }

  /**
   * Search for similar documents using vector similarity
   */
  static async search(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    this.ensureInitialized()
    
    // Get all documents that match filters
    const candidateDocuments = await this.getFilteredDocuments(query.filters)
    
    // Calculate similarity scores
    const results: VectorSearchResult[] = []
    
    for (const document of candidateDocuments) {
      const score = this.calculateSimilarity(
        query.embedding,
        document.embedding,
        this.config.similarityMetric
      )
      
      if (score >= (query.threshold || 0.1)) {
        results.push({
          document,
          score,
          explanation: this.generateSearchExplanation(score, document)
        })
      }
    }
    
    // Sort by score (descending) and limit results
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, query.limit)
  }

  /**
   * Generate embedding for text content
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    // In a real implementation, this would call an embedding model API
    // For now, we'll use a deterministic mock based on text content
    return this.mockEmbedding(text)
  }

  /**
   * Get documents by their IDs
   */
  static async getDocumentsByIds(ids: string[]): Promise<VectorDocument[]> {
    this.ensureInitialized()
    
    const documents: VectorDocument[] = []
    for (const id of ids) {
      const document = this.documents.get(id)
      if (document) {
        documents.push(document)
      }
    }
    
    return documents
  }

  /**
   * Update document metadata and re-index if necessary
   */
  static async updateDocument(
    id: string,
    updates: Partial<Omit<VectorDocument, 'id' | 'embedding'>>
  ): Promise<void> {
    this.ensureInitialized()
    
    const existingDocument = this.documents.get(id)
    if (!existingDocument) {
      throw new Error(`Document not found: ${id}`)
    }
    
    // Update document
    const updatedDocument: VectorDocument = {
      ...existingDocument,
      ...updates,
      lastUpdated: new Date()
    }
    
    // Re-generate embedding if content changed
    if (updates.content && updates.content !== existingDocument.content) {
      updatedDocument.embedding = await this.generateEmbedding(updates.content)
    }
    
    await this.storeDocument(updatedDocument)
    console.log(`Updated document: ${id}`)
  }

  /**
   * Delete document from the database
   */
  static async deleteDocument(id: string): Promise<void> {
    this.ensureInitialized()
    
    this.documents.delete(id)
    console.log(`Deleted document: ${id}`)
  }

  /**
   * Populate database with AWS instance specifications
   */
  static async populateInstanceData(instances: InstanceType[]): Promise<void> {
    console.log('Populating vector database with instance specifications...')
    
    const documents: Omit<VectorDocument, 'embedding'>[] = instances.map(instance => ({
      id: `instance-${instance.InstanceType}`,
      type: 'instance_specification',
      content: this.createInstanceContent(instance),
      metadata: this.createInstanceMetadata(instance),
      lastUpdated: new Date()
    }))
    
    await this.addDocuments(documents)
  }

  /**
   * Populate database with benchmark data
   */
  static async populateBenchmarkData(benchmarks: BenchmarkData[]): Promise<void> {
    console.log('Populating vector database with benchmark data...')
    
    const documents: Omit<VectorDocument, 'embedding'>[] = benchmarks.map(benchmark => ({
      id: `benchmark-${benchmark.instanceType}-${benchmark.suite}`,
      type: 'benchmark_result',
      content: this.createBenchmarkContent(benchmark),
      metadata: this.createBenchmarkMetadata(benchmark),
      lastUpdated: new Date()
    }))
    
    await this.addDocuments(documents)
  }

  /**
   * Populate database with workload patterns
   */
  static async populateWorkloadPatterns(workloads: WorkloadPattern[]): Promise<void> {
    console.log('Populating vector database with workload patterns...')
    
    const documents: Omit<VectorDocument, 'embedding'>[] = workloads.map(workload => ({
      id: `workload-${workload.id}`,
      type: 'workload_template',
      content: this.createWorkloadContent(workload),
      metadata: this.createWorkloadMetadata(workload),
      lastUpdated: new Date()
    }))
    
    await this.addDocuments(documents)
  }

  /**
   * Get database statistics
   */
  static async getStatistics(): Promise<{
    totalDocuments: number
    documentsByType: Record<DocumentType, number>
    avgEmbeddingSize: number
    lastUpdated: Date | null
  }> {
    this.ensureInitialized()
    
    const totalDocuments = this.documents.size
    const documentsByType: Record<DocumentType, number> = {} as any
    let totalEmbeddingSize = 0
    let lastUpdated: Date | null = null
    
    for (const document of this.documents.values()) {
      // Count by type
      documentsByType[document.type] = (documentsByType[document.type] || 0) + 1
      
      // Calculate embedding sizes
      totalEmbeddingSize += document.embedding.length
      
      // Track latest update
      if (!lastUpdated || document.lastUpdated > lastUpdated) {
        lastUpdated = document.lastUpdated
      }
    }
    
    return {
      totalDocuments,
      documentsByType,
      avgEmbeddingSize: totalDocuments > 0 ? totalEmbeddingSize / totalDocuments : 0,
      lastUpdated
    }
  }

  /**
   * Clear all documents from the database
   */
  static async clearDatabase(): Promise<void> {
    this.ensureInitialized()
    
    this.documents.clear()
    console.log('Vector database cleared')
  }

  // Private implementation methods

  private static ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Vector database not initialized. Call initialize() first.')
    }
  }

  private static async initializeLocalDatabase(): Promise<void> {
    // Local implementation using in-memory storage
    this.documents = new Map()
  }

  private static async initializePinecone(): Promise<void> {
    // Would implement Pinecone initialization
    console.log('Pinecone initialization not implemented in mock')
    this.documents = new Map()
  }

  private static async initializeWeaviate(): Promise<void> {
    // Would implement Weaviate initialization
    console.log('Weaviate initialization not implemented in mock')
    this.documents = new Map()
  }

  private static async initializeChroma(): Promise<void> {
    // Would implement Chroma initialization
    console.log('Chroma initialization not implemented in mock')
    this.documents = new Map()
  }

  private static async storeDocument(document: VectorDocument): Promise<void> {
    this.documents.set(document.id, document)
  }

  private static async getFilteredDocuments(filters?: any): Promise<VectorDocument[]> {
    const allDocuments = Array.from(this.documents.values())
    
    if (!filters) {
      return allDocuments
    }
    
    return allDocuments.filter(doc => {
      // Filter by document types
      if (filters.documentTypes && !filters.documentTypes.includes(doc.type)) {
        return false
      }
      
      // Filter by instance types
      if (filters.instanceTypes && doc.metadata.instanceTypes) {
        const hasMatchingInstance = filters.instanceTypes.some((type: string) =>
          doc.metadata.instanceTypes!.some(docType => docType.includes(type))
        )
        if (!hasMatchingInstance) {
          return false
        }
      }
      
      // Filter by workload types
      if (filters.workloadTypes && doc.metadata.workloadTypes) {
        const hasMatchingWorkload = filters.workloadTypes.some((type: string) =>
          doc.metadata.workloadTypes!.includes(type)
        )
        if (!hasMatchingWorkload) {
          return false
        }
      }
      
      // Filter by date range
      if (filters.dateRange) {
        if (doc.lastUpdated < filters.dateRange.start || 
            doc.lastUpdated > filters.dateRange.end) {
          return false
        }
      }
      
      // Filter by reliability
      if (filters.reliability && doc.metadata.reliability < filters.reliability.min) {
        return false
      }
      
      return true
    })
  }

  private static calculateSimilarity(
    embedding1: number[],
    embedding2: number[],
    metric: string
  ): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embedding dimensions must match')
    }
    
    switch (metric) {
      case 'cosine':
        return this.cosineSimilarity(embedding1, embedding2)
      case 'euclidean':
        return 1 / (1 + this.euclideanDistance(embedding1, embedding2))
      case 'dot_product':
        return this.dotProduct(embedding1, embedding2)
      default:
        throw new Error(`Unsupported similarity metric: ${metric}`)
    }
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = this.dotProduct(a, b)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }
    
    return dotProduct / (magnitudeA * magnitudeB)
  }

  private static euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    )
  }

  private static dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0)
  }

  private static generateSearchExplanation(score: number, document: VectorDocument): string {
    if (score > 0.9) return 'Very high relevance match'
    if (score > 0.8) return 'High relevance match'
    if (score > 0.7) return 'Good relevance match'
    if (score > 0.6) return 'Moderate relevance match'
    return 'Low relevance match'
  }

  private static mockEmbedding(text: string): number[] {
    // Simple deterministic mock embedding based on text hash
    const dimensions = this.config.dimensions
    const embedding: number[] = []
    
    // Use text content to generate deterministic values
    for (let i = 0; i < dimensions; i++) {
      const charCode = text.charCodeAt(i % text.length)
      const value = (Math.sin(charCode + i) + Math.cos(charCode * i)) / 2
      embedding.push(value)
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  // Content creation methods

  private static createInstanceContent(instance: InstanceType): string {
    return `AWS ${instance.InstanceType} instance: ${instance.VCpuInfo?.DefaultVCpus} vCPUs, 
            ${instance.MemoryInfo?.SizeInMiB ? Math.round(instance.MemoryInfo.SizeInMiB / 1024) : 'unknown'} GiB memory.
            ${instance.ProcessorInfo?.SupportedArchitectures?.join(', ')} architecture.
            ${instance.GpuInfo ? `GPU: ${instance.GpuInfo.Gpus?.map(g => g.Name).join(', ')}` : 'No GPU'}.
            Network: ${instance.NetworkInfo?.NetworkPerformance}.
            Storage: ${instance.InstanceStorageInfo?.TotalSizeInGB ? `${instance.InstanceStorageInfo.TotalSizeInGB} GB local storage` : 'EBS only'}.`
  }

  private static createInstanceMetadata(instance: InstanceType): DocumentMetadata {
    return {
      source: 'AWS EC2 API',
      category: 'instance_specification',
      instanceTypes: [instance.InstanceType!],
      reliability: 1.0, // AWS API data is highly reliable
      dateRelevance: 1.0, // Current instance data
    }
  }

  private static createBenchmarkContent(benchmark: BenchmarkData): string {
    const results = Object.entries(benchmark.results)
      .map(([test, result]) => `${test}: ${result.value} ${result.unit}`)
      .join(', ')
    
    return `Performance benchmark for ${benchmark.instanceType} using ${benchmark.suite}.
            Results: ${results}.
            Test conditions: ${benchmark.metadata?.testDate ? `tested on ${benchmark.metadata.testDate}` : 'unknown date'}.
            ${benchmark.metadata?.notes || ''}`
  }

  private static createBenchmarkMetadata(benchmark: BenchmarkData): DocumentMetadata {
    return {
      source: `${benchmark.suite} benchmark suite`,
      category: 'performance_benchmark',
      instanceTypes: [benchmark.instanceType],
      performanceMetrics: Object.keys(benchmark.results),
      benchmarkSuite: benchmark.suite,
      reliability: 0.9, // Benchmark data is generally reliable
      dateRelevance: 0.8, // Performance data ages over time
    }
  }

  private static createWorkloadContent(workload: WorkloadPattern): string {
    return `${workload.name}: ${workload.description}.
            Compute requirements: ${workload.instanceRequirements.vCpus} vCPUs, 
            ${workload.instanceRequirements.memoryGiB} GiB memory,
            ${workload.instanceRequirements.gpuRequired ? 'GPU required' : 'CPU only'}.
            Usage pattern: ${workload.runsPerDay} runs per day, 
            ${workload.avgDurationHours} hours average duration,
            ${workload.daysPerWeek} days per week.
            Priority: ${workload.priority}, ${workload.interruptible ? 'interruptible' : 'non-interruptible'}.
            Seasonality: ${workload.seasonality.description}.`
  }

  private static createWorkloadMetadata(workload: WorkloadPattern): DocumentMetadata {
    return {
      source: 'ComputeCompass workload templates',
      category: 'workload_pattern',
      workloadTypes: [workload.name.toLowerCase().replace(/\s+/g, '_')],
      reliability: 0.95, // Template data is highly reliable
      dateRelevance: 0.9, // Workload patterns are relatively stable
    }
  }
}

/**
 * Error class for vector database operations
 */
export class VectorDatabaseError extends Error {
  constructor(message: string, public details: Record<string, any>) {
    super(message)
    this.name = 'VectorDatabaseError'
  }
}