/**
 * RAG (Retrieval-Augmented Generation) System Types
 * 
 * Defines the architecture for performance-aware AI recommendations
 * that combine vector search over benchmark data with LLM generation
 */

// Core RAG System Types
export interface RAGQuery {
  id: string
  type: 'instance_recommendation' | 'cost_optimization' | 'performance_analysis' | 'workload_matching'
  userQuery: string
  context: RAGContext
  timestamp: Date
  priority: 'low' | 'normal' | 'high'
}

export interface RAGContext {
  // Current user requirements
  computeRequirements?: ComputeRequirements
  workloadPattern?: WorkloadPattern
  budgetConstraints?: BudgetConstraints
  
  // Current analysis state
  currentInstances?: InstanceMatch[]
  optimizationResults?: OptimizationResult
  
  // User session context
  researchDomain?: string
  institutionType?: 'academic' | 'commercial' | 'government'
  experienceLevel?: 'beginner' | 'intermediate' | 'expert'
}

export interface RAGResponse {
  id: string
  queryId: string
  response: string
  confidence: number
  citations: Citation[]
  recommendations: ActionableRecommendation[]
  insights: PerformanceInsight[]
  metadata: RAGResponseMetadata
  timestamp: Date
}

// Vector Database Types
export interface VectorDocument {
  id: string
  type: DocumentType
  content: string
  metadata: DocumentMetadata
  embedding: number[]
  lastUpdated: Date
}

export type DocumentType = 
  | 'benchmark_result'
  | 'instance_specification' 
  | 'workload_template'
  | 'optimization_case_study'
  | 'performance_pattern'
  | 'cost_analysis'
  | 'research_paper'
  | 'user_feedback'

export interface DocumentMetadata {
  source: string
  category: string
  instanceTypes?: string[]
  workloadTypes?: string[]
  performanceMetrics?: string[]
  costData?: boolean
  reliability: number // 0-1 score based on data quality
  dateRelevance: number // 0-1 score based on how recent the data is
  
  // Benchmark-specific metadata
  benchmarkSuite?: string
  testConditions?: BenchmarkConditions
  
  // Research-specific metadata
  researchDomain?: string
  publicationYear?: number
  citationCount?: number
}

export interface BenchmarkConditions {
  softwareVersion?: string
  optimizationFlags?: string[]
  dataSize?: string
  parallelization?: 'single-thread' | 'multi-thread' | 'distributed'
  environment?: 'bare-metal' | 'virtualized' | 'containerized'
}

// Knowledge Graph Types
export interface KnowledgeNode {
  id: string
  type: NodeType
  properties: Record<string, any>
  relationships: KnowledgeRelationship[]
}

export type NodeType = 
  | 'instance_type'
  | 'workload'
  | 'benchmark'
  | 'optimization_strategy'
  | 'research_domain'
  | 'cost_pattern'

export interface KnowledgeRelationship {
  targetId: string
  type: RelationshipType
  weight: number
  metadata?: Record<string, any>
}

export type RelationshipType =
  | 'performs_well_on'
  | 'cost_effective_for'
  | 'similar_to'
  | 'prerequisite_for'
  | 'alternative_to'
  | 'optimized_by'
  | 'used_in_domain'

// AI Model Integration Types
export interface AIModelConfig {
  modelId: string
  provider: 'anthropic' | 'openai' | 'local'
  temperature: number
  maxTokens: number
  systemPrompt: string
  contextWindow: number
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: PromptVariable[]
  examples: PromptExample[]
  category: 'recommendation' | 'analysis' | 'explanation' | 'comparison'
}

export interface PromptVariable {
  name: string
  type: 'string' | 'number' | 'object' | 'array'
  required: boolean
  description: string
  defaultValue?: any
}

export interface PromptExample {
  input: Record<string, any>
  expectedOutput: string
  quality: 'good' | 'excellent'
}

// Recommendation System Types
export interface ActionableRecommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  impact: ImpactAssessment
  implementation: ImplementationGuide
  confidence: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
}

export type RecommendationType =
  | 'instance_change'
  | 'cost_optimization'
  | 'performance_tuning'
  | 'architecture_modification'
  | 'procurement_strategy'
  | 'monitoring_setup'

export interface ImpactAssessment {
  costSavings?: {
    monthly: number
    annual: number
    percentage: number
  }
  performanceGain?: {
    metric: string
    improvement: number
    unit: string
  }
  reliability?: {
    current: number
    projected: number
  }
  complexity: 'low' | 'medium' | 'high'
}

export interface ImplementationGuide {
  steps: ImplementationStep[]
  estimatedTime: string
  prerequisites: string[]
  risks: Risk[]
  rollbackPlan?: string
}

export interface ImplementationStep {
  order: number
  title: string
  description: string
  commands?: string[]
  validation: string
  estimatedDuration: string
}

export interface Risk {
  description: string
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  mitigation: string
}

// Citation and Source Tracking
export interface Citation {
  id: string
  source: CitationSource
  relevance: number
  excerpt: string
  metadata: CitationMetadata
}

export interface CitationSource {
  type: 'benchmark' | 'documentation' | 'research_paper' | 'case_study' | 'user_report'
  title: string
  url?: string
  authors?: string[]
  date?: Date
  version?: string
}

export interface CitationMetadata {
  instanceTypes: string[]
  workloadTypes: string[]
  metrics: string[]
  contextRelevance: number
  dataQuality: number
}

// Performance Analysis Types
export interface PerformanceInsight {
  id: string
  type: InsightType
  title: string
  description: string
  metrics: PerformanceMetric[]
  comparison?: PerformanceComparison
  confidence: number
  implications: string[]
}

export type InsightType =
  | 'bottleneck_identification'
  | 'scaling_behavior'
  | 'cost_efficiency'
  | 'optimization_opportunity'
  | 'architectural_recommendation'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  benchmark?: string
  context: string
  significance: 'low' | 'medium' | 'high'
}

export interface PerformanceComparison {
  baseline: {
    instanceType: string
    value: number
    context: string
  }
  alternatives: {
    instanceType: string
    value: number
    improvement: number
    context: string
  }[]
}

// RAG Service Response Metadata
export interface RAGResponseMetadata {
  processingTime: number
  documentsRetrieved: number
  vectorSearchTime: number
  llmGenerationTime: number
  confidenceBreakdown: {
    retrieval: number
    generation: number
    overall: number
  }
  modelUsed: string
  tokensUsed: {
    input: number
    output: number
  }
}

// Search and Retrieval Types
export interface VectorSearchQuery {
  embedding: number[]
  filters?: VectorSearchFilters
  limit: number
  threshold?: number
}

export interface VectorSearchFilters {
  documentTypes?: DocumentType[]
  instanceTypes?: string[]
  workloadTypes?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  reliability?: {
    min: number
  }
}

export interface VectorSearchResult {
  document: VectorDocument
  score: number
  explanation?: string
}

// RAG System Configuration
export interface RAGSystemConfig {
  vectorDatabase: VectorDatabaseConfig
  aiModel: AIModelConfig
  retrievalSettings: RetrievalSettings
  generationSettings: GenerationSettings
  caching: CachingConfig
}

export interface VectorDatabaseConfig {
  provider: 'pinecone' | 'weaviate' | 'chroma' | 'local'
  indexName: string
  dimensions: number
  embeddingModel: string
  similarityMetric: 'cosine' | 'euclidean' | 'dot_product'
}

export interface RetrievalSettings {
  maxDocuments: number
  relevanceThreshold: number
  diversityWeight: number
  recencyWeight: number
  authorityWeight: number
}

export interface GenerationSettings {
  maxResponseLength: number
  citationStyle: 'inline' | 'footnotes' | 'bibliography'
  explanationLevel: 'technical' | 'balanced' | 'accessible'
  includeUncertainty: boolean
}

export interface CachingConfig {
  enableQueryCache: boolean
  cacheTTL: number
  enableEmbeddingCache: boolean
  maxCacheSize: number
}

// Learning and Feedback Types
export interface UserFeedback {
  id: string
  queryId: string
  responseId: string
  rating: number // 1-5
  aspectRatings: {
    accuracy: number
    helpfulness: number
    clarity: number
    completeness: number
  }
  textFeedback?: string
  followUpQuestions?: string[]
  implementationSuccess?: boolean
  timestamp: Date
}

export interface LearningSignal {
  type: 'positive' | 'negative' | 'neutral'
  source: 'explicit_feedback' | 'implicit_behavior' | 'outcome_tracking'
  strength: number
  context: LearningContext
}

export interface LearningContext {
  queryType: string
  userProfile: string
  domainExpertise: string
  contextComplexity: number
}

// Import necessary types from existing modules
import type { ComputeRequirements } from './aws-types'
import type { WorkloadPattern, OptimizationResult } from './consumption'
import type { InstanceMatch } from './instance-types'

interface BudgetConstraints {
  maxMonthlyCost?: number
  maxAnnualCost?: number
  preferredPaymentModel?: 'on-demand' | 'reserved' | 'mixed'
  spotInstanceTolerance?: number
}