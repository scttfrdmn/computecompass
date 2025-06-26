/**
 * RAG Integration Service
 * 
 * Provides a high-level interface for integrating the RAG system with 
 * ComputeCompass, handling initialization, data population, and query processing
 */

import { RAGService } from './rag-service'
import { VectorDatabaseInitService } from './vector-database-init'
import type {
  RAGSystemConfig,
  RAGQuery,
  RAGResponse,
  RAGContext,
  ActionableRecommendation,
  PerformanceInsight,
} from '../types/rag-system'
import type { InstanceMatch } from '../types/instance-types'
import type { OptimizationResult, WorkloadPattern } from '../types/consumption'
import type { ComputeRequirements } from '../types/aws-types'

/**
 * Configuration for RAG system integration
 */
export interface RAGIntegrationConfig {
  // Vector database configuration
  vectorDatabase: {
    provider: 'local' | 'pinecone' | 'weaviate' | 'chroma'
    indexName?: string
    dimensions?: number
    embeddingModel?: string
  }
  
  // AI model configuration
  aiModel: {
    provider: 'anthropic' | 'openai' | 'local'
    modelId?: string
    temperature?: number
    maxTokens?: number
  }
  
  // Feature flags
  features: {
    enableAutoInit?: boolean
    enableCaching?: boolean
    enableFeedbackLearning?: boolean
  }
  
  // Performance settings
  performance: {
    maxDocuments?: number
    relevanceThreshold?: number
    queryTimeout?: number
  }
}

/**
 * Default configuration for development and testing
 */
const DEFAULT_CONFIG: RAGIntegrationConfig = {
  vectorDatabase: {
    provider: 'local',
    indexName: 'computecompass-rag',
    dimensions: 768,
    embeddingModel: 'text-embedding-ada-002'
  },
  aiModel: {
    provider: 'local',
    modelId: 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 2000
  },
  features: {
    enableAutoInit: true,
    enableCaching: true,
    enableFeedbackLearning: true
  },
  performance: {
    maxDocuments: 20,
    relevanceThreshold: 0.7,
    queryTimeout: 30000 // 30 seconds
  }
}

/**
 * High-level RAG integration service
 */
export class RAGIntegrationService {
  private static config: RAGIntegrationConfig
  private static isInitialized = false
  private static initializationPromise: Promise<void> | null = null

  /**
   * Initialize the RAG system with configuration
   */
  static async initialize(config: Partial<RAGIntegrationConfig> = {}): Promise<void> {
    // Merge with defaults
    this.config = this.mergeConfig(DEFAULT_CONFIG, config)
    
    console.log('🤖 Initializing RAG Integration Service...')
    
    // Convert to RAG system config format
    const ragConfig: RAGSystemConfig = {
      vectorDatabase: {
        provider: this.config.vectorDatabase.provider,
        indexName: this.config.vectorDatabase.indexName || 'computecompass-rag',
        dimensions: this.config.vectorDatabase.dimensions || 768,
        embeddingModel: this.config.vectorDatabase.embeddingModel || 'text-embedding-ada-002',
        similarityMetric: 'cosine'
      },
      aiModel: {
        modelId: this.config.aiModel.modelId || 'claude-3-sonnet',
        provider: this.config.aiModel.provider,
        temperature: this.config.aiModel.temperature || 0.7,
        maxTokens: this.config.aiModel.maxTokens || 2000,
        systemPrompt: 'You are an expert AWS compute optimization consultant specializing in research computing.',
        contextWindow: 8000
      },
      retrievalSettings: {
        maxDocuments: this.config.performance.maxDocuments || 20,
        relevanceThreshold: this.config.performance.relevanceThreshold || 0.7,
        diversityWeight: 0.3,
        recencyWeight: 0.2,
        authorityWeight: 0.5
      },
      generationSettings: {
        maxResponseLength: 2000,
        citationStyle: 'inline',
        explanationLevel: 'balanced',
        includeUncertainty: true
      },
      caching: {
        enableQueryCache: this.config.features.enableCaching || false,
        cacheTTL: 3600,
        enableEmbeddingCache: true,
        maxCacheSize: 1000
      }
    }
    
    // Initialize RAG service
    await RAGService.initialize(ragConfig)
    
    // Initialize and populate vector database if enabled
    if (this.config.features.enableAutoInit) {
      await VectorDatabaseInitService.initializeAndPopulate(ragConfig.vectorDatabase)
    }
    
    this.isInitialized = true
    console.log('✅ RAG Integration Service initialized successfully')
  }

  /**
   * Ensure the service is initialized (lazy initialization)
   */
  static async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return
    }
    
    if (this.initializationPromise) {
      return this.initializationPromise
    }
    
    this.initializationPromise = this.initialize()
    return this.initializationPromise
  }

  /**
   * Get AI-powered instance recommendations
   */
  static async getInstanceRecommendations(
    requirements: ComputeRequirements,
    workloadPattern?: WorkloadPattern,
    candidateInstances?: InstanceMatch[]
  ): Promise<{
    recommendations: ActionableRecommendation[]
    insights: PerformanceInsight[]
    reasoning: string
    confidence: number
  }> {
    await this.ensureInitialized()
    
    const context: RAGContext = {
      computeRequirements: requirements,
      workloadPattern,
      currentInstances: candidateInstances,
      researchDomain: workloadPattern?.team ? this.inferDomain(workloadPattern.team) : undefined,
      experienceLevel: 'intermediate' // Default for now
    }
    
    const result = await RAGService.recommendInstances(
      context,
      candidateInstances || []
    )
    
    return {
      ...result,
      confidence: this.calculateRecommendationConfidence(result, context)
    }
  }

  /**
   * Get AI-powered cost optimization suggestions
   */
  static async getCostOptimizationSuggestions(
    workloadPattern: WorkloadPattern,
    currentOptimization: OptimizationResult,
    budgetConstraints?: {
      maxMonthlyCost?: number
      spotInstanceTolerance?: number
    }
  ): Promise<{
    recommendations: ActionableRecommendation[]
    insights: PerformanceInsight[]
    alternativeStrategies: string[]
    potentialSavings: number
  }> {
    await this.ensureInitialized()
    
    const context: RAGContext = {
      workloadPattern,
      optimizationResults: currentOptimization,
      budgetConstraints,
      researchDomain: this.inferDomain(workloadPattern.team),
      experienceLevel: 'intermediate'
    }
    
    const result = await RAGService.optimizeCostStrategy(context, currentOptimization)
    
    // Estimate potential additional savings
    const potentialSavings = this.estimateAdditionalSavings(
      result.recommendations,
      currentOptimization.costSavings.savingsPercentage
    )
    
    return {
      ...result,
      potentialSavings
    }
  }

  /**
   * Get AI-powered workload performance analysis
   */
  static async getWorkloadPerformanceAnalysis(
    workloadPattern: WorkloadPattern,
    requirements: ComputeRequirements
  ): Promise<{
    insights: PerformanceInsight[]
    optimizationOpportunities: ActionableRecommendation[]
    benchmarkComparisons: string[]
    performanceScore: number
  }> {
    await this.ensureInitialized()
    
    const context: RAGContext = {
      computeRequirements: requirements,
      workloadPattern,
      researchDomain: this.inferDomain(workloadPattern.team),
      experienceLevel: 'intermediate'
    }
    
    const result = await RAGService.analyzeWorkloadPerformance(context)
    
    return {
      ...result,
      performanceScore: this.calculatePerformanceScore(result.insights)
    }
  }

  /**
   * Process natural language queries about AWS optimization
   */
  static async processNaturalLanguageQuery(
    query: string,
    context?: {
      currentInstances?: InstanceMatch[]
      workloadPattern?: WorkloadPattern
      optimizationResults?: OptimizationResult
    }
  ): Promise<RAGResponse> {
    await this.ensureInitialized()
    
    const ragQuery: RAGQuery = {
      id: `nl-query-${Date.now()}`,
      type: this.inferQueryType(query),
      userQuery: query,
      context: {
        ...context,
        experienceLevel: this.inferExperienceLevel(query)
      },
      timestamp: new Date(),
      priority: 'normal'
    }
    
    return await RAGService.processQuery(ragQuery)
  }

  /**
   * Get system status and readiness
   */
  static getSystemStatus(): {
    isInitialized: boolean
    databaseReady: boolean
    populationStats: any
    configuration: RAGIntegrationConfig
  } {
    return {
      isInitialized: this.isInitialized,
      databaseReady: VectorDatabaseInitService.isVectorDatabaseReady(),
      populationStats: VectorDatabaseInitService.getPopulationStats(),
      configuration: this.config
    }
  }

  /**
   * Refresh the knowledge base with latest data
   */
  static async refreshKnowledgeBase(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('RAG Integration Service not initialized')
    }
    
    console.log('🔄 Refreshing RAG knowledge base...')
    await VectorDatabaseInitService.refreshDatabase()
    console.log('✅ Knowledge base refresh completed')
  }

  // Private utility methods

  private static mergeConfig(
    defaultConfig: RAGIntegrationConfig,
    userConfig: Partial<RAGIntegrationConfig>
  ): RAGIntegrationConfig {
    return {
      vectorDatabase: { ...defaultConfig.vectorDatabase, ...userConfig.vectorDatabase },
      aiModel: { ...defaultConfig.aiModel, ...userConfig.aiModel },
      features: { ...defaultConfig.features, ...userConfig.features },
      performance: { ...defaultConfig.performance, ...userConfig.performance }
    }
  }

  private static inferDomain(team: string): string {
    const domainMap: Record<string, string> = {
      'bioinformatics': 'computational_biology',
      'ai-research': 'machine_learning',
      'climate': 'climate_modeling',
      'physics': 'high_energy_physics',
      'finance': 'financial_modeling',
      'chemistry': 'computational_chemistry'
    }
    return domainMap[team] || 'general_research'
  }

  private static inferQueryType(query: string): 'instance_recommendation' | 'cost_optimization' | 'performance_analysis' | 'workload_matching' {
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('cost') || queryLower.includes('save') || queryLower.includes('budget')) {
      return 'cost_optimization'
    }
    if (queryLower.includes('performance') || queryLower.includes('benchmark') || queryLower.includes('speed')) {
      return 'performance_analysis'
    }
    if (queryLower.includes('workload') || queryLower.includes('match')) {
      return 'workload_matching'
    }
    return 'instance_recommendation'
  }

  private static inferExperienceLevel(query: string): 'beginner' | 'intermediate' | 'expert' {
    const queryLower = query.toLowerCase()
    const technicalTerms = ['optimization', 'throughput', 'latency', 'numa', 'vectorization']
    const advancedTerms = ['simd', 'cache', 'bandwidth', 'ipc', 'topology']
    
    const technicalCount = technicalTerms.filter(term => queryLower.includes(term)).length
    const advancedCount = advancedTerms.filter(term => queryLower.includes(term)).length
    
    if (advancedCount > 0) return 'expert'
    if (technicalCount > 2) return 'intermediate'
    return 'beginner'
  }

  private static calculateRecommendationConfidence(
    result: { recommendations: ActionableRecommendation[]; insights: PerformanceInsight[] },
    context: RAGContext
  ): number {
    let confidence = 0.7 // Base confidence
    
    // Increase confidence based on available context
    if (context.workloadPattern) confidence += 0.1
    if (context.currentInstances && context.currentInstances.length > 0) confidence += 0.1
    if (context.computeRequirements) confidence += 0.05
    
    // Increase confidence based on recommendation quality
    if (result.recommendations.length > 0) confidence += 0.05
    if (result.insights.length > 0) confidence += 0.05
    
    return Math.min(0.95, confidence)
  }

  private static estimateAdditionalSavings(
    recommendations: ActionableRecommendation[],
    currentSavings: number
  ): number {
    // Estimate potential additional savings based on recommendations
    let additionalSavings = 0
    
    for (const rec of recommendations) {
      if (rec.impact.costSavings) {
        additionalSavings += rec.impact.costSavings.percentage || 0
      }
    }
    
    // Cap at reasonable maximum additional savings
    return Math.min(additionalSavings, 25 - currentSavings)
  }

  private static calculatePerformanceScore(insights: PerformanceInsight[]): number {
    if (insights.length === 0) return 0.5
    
    // Calculate average confidence of insights as performance score
    const avgConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length
    return avgConfidence
  }
}

/**
 * Error class for RAG integration operations
 */
export class RAGIntegrationError extends Error {
  constructor(message: string, public details: Record<string, any>) {
    super(message)
    this.name = 'RAGIntegrationError'
  }
}