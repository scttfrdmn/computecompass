import type { WorkloadTemplate, SeasonalPattern } from '../types/consumption'

/**
 * Predefined workload templates for common research computing patterns
 */

// Common seasonal patterns
const ACADEMIC_SEASONALITY: SeasonalPattern = {
  type: 'academic',
  peakMonths: [8, 9, 10, 1, 2, 3], // Fall and Spring semesters
  lowMonths: [5, 6, 7, 11], // Summer and winter breaks
  peakMultiplier: 1.8,
  description: 'Academic calendar with higher usage during semesters',
}

const GRANT_CYCLE_SEASONALITY: SeasonalPattern = {
  type: 'grant-based',
  peakMonths: [8, 9, 10, 11], // End of fiscal year push
  lowMonths: [0, 1], // Beginning of fiscal year
  peakMultiplier: 2.5,
  description: 'Grant spending cycles with end-of-year usage spikes',
}

const STEADY_SEASONALITY: SeasonalPattern = {
  type: 'steady',
  description: 'Consistent usage throughout the year',
}

export const WORKLOAD_TEMPLATES: WorkloadTemplate[] = [
  // Batch Computing Templates
  {
    id: 'genomics-batch',
    name: 'Genomics Batch Processing',
    category: 'batch-computing',
    description:
      'Large-scale genomic sequence analysis with periodic batch jobs',
    defaultPattern: {
      runsPerDay: 2,
      avgDurationHours: 8,
      daysPerWeek: 5,
      instanceRequirements: {
        vCpus: 16,
        memoryGiB: 64,
        gpuRequired: false,
        storageGiB: 1000,
      },
      seasonality: ACADEMIC_SEASONALITY,
      timeOfDay: 'off-hours',
      interruptible: true,
      priority: 'normal',
      burstCapacity: {
        enabled: true,
        maxConcurrentJobs: 10,
        burstDurationHours: 24,
        burstFrequency: 'weekly',
      },
    },
    configurableFields: [
      'runsPerDay',
      'avgDurationHours',
      'instanceRequirements',
      'seasonality',
    ],
    examples: [
      'Whole genome sequencing analysis',
      'RNA-seq data processing',
      'Variant calling pipelines',
      'Population genetics studies',
    ],
    bestPractices: [
      'Use spot instances for cost savings (70-90% discount)',
      'Scale up during grant deadlines and conference submissions',
      'Consider memory-optimized instances for large datasets',
      'Use burst capacity for urgent analysis requests',
    ],
  },

  {
    id: 'climate-modeling',
    name: 'Climate Simulation',
    category: 'batch-computing',
    description: 'Long-running climate models and weather simulations',
    defaultPattern: {
      runsPerDay: 1,
      avgDurationHours: 24,
      daysPerWeek: 7,
      instanceRequirements: {
        vCpus: 32,
        memoryGiB: 128,
        gpuRequired: false,
        storageGiB: 2000,
        networkIntensive: true,
      },
      seasonality: GRANT_CYCLE_SEASONALITY,
      timeOfDay: 'any',
      interruptible: false,
      priority: 'critical',
      burstCapacity: {
        enabled: true,
        maxConcurrentJobs: 5,
        burstDurationHours: 72,
        burstFrequency: 'monthly',
      },
    },
    configurableFields: [
      'avgDurationHours',
      'instanceRequirements',
      'interruptible',
    ],
    examples: [
      'Global climate models (GCMs)',
      'Regional weather forecasting',
      'Hurricane track prediction',
      'Climate change impact studies',
    ],
    bestPractices: [
      'Use compute-optimized instances for CPU-intensive models',
      'Consider Reserved Instances for predictable, long-running jobs',
      'Enable enhanced networking for multi-node simulations',
      'Plan capacity for seasonal weather event analysis',
    ],
  },

  // Machine Learning Templates
  {
    id: 'ml-training-gpu',
    name: 'Deep Learning Training',
    category: 'ml-training',
    description: 'GPU-accelerated machine learning model training',
    defaultPattern: {
      runsPerDay: 3,
      avgDurationHours: 6,
      daysPerWeek: 6,
      instanceRequirements: {
        vCpus: 8,
        memoryGiB: 32,
        gpuRequired: true,
        storageGiB: 500,
      },
      seasonality: ACADEMIC_SEASONALITY,
      timeOfDay: 'any',
      interruptible: true,
      priority: 'normal',
      burstCapacity: {
        enabled: true,
        maxConcurrentJobs: 8,
        burstDurationHours: 12,
        burstFrequency: 'daily',
      },
    },
    configurableFields: [
      'runsPerDay',
      'avgDurationHours',
      'instanceRequirements',
      'interruptible',
    ],
    examples: [
      'Computer vision model training',
      'Natural language processing',
      'Reinforcement learning experiments',
      'Hyperparameter tuning',
    ],
    bestPractices: [
      'Use GPU spot instances for significant cost savings',
      'Implement checkpointing for interruptible workloads',
      'Consider multiple smaller training runs vs single large run',
      'Use mixed precision training to optimize GPU utilization',
    ],
  },

  {
    id: 'ml-inference',
    name: 'ML Model Inference',
    category: 'web-services',
    description: 'Real-time machine learning model serving and inference',
    defaultPattern: {
      runsPerDay: 24, // Always running
      avgDurationHours: 24,
      daysPerWeek: 7,
      instanceRequirements: {
        vCpus: 4,
        memoryGiB: 16,
        gpuRequired: false,
        storageGiB: 100,
      },
      seasonality: STEADY_SEASONALITY,
      timeOfDay: 'any',
      interruptible: false,
      priority: 'critical',
    },
    configurableFields: ['instanceRequirements'],
    examples: [
      'API-based model serving',
      'Real-time image classification',
      'Chatbot inference',
      'Recommendation systems',
    ],
    bestPractices: [
      'Use Reserved Instances or Savings Plans for always-on services',
      'Consider auto-scaling for variable demand',
      'Use Graviton instances for cost-effective inference',
      'Implement load balancing across availability zones',
    ],
  },

  // Data Processing Templates
  {
    id: 'data-pipeline',
    name: 'ETL Data Pipeline',
    category: 'data-processing',
    description: 'Extract, transform, load operations for research data',
    defaultPattern: {
      runsPerDay: 4,
      avgDurationHours: 3,
      daysPerWeek: 7,
      instanceRequirements: {
        vCpus: 8,
        memoryGiB: 32,
        gpuRequired: false,
        storageGiB: 200,
      },
      seasonality: STEADY_SEASONALITY,
      timeOfDay: 'scheduled',
      interruptible: true,
      priority: 'normal',
    },
    configurableFields: [
      'runsPerDay',
      'avgDurationHours',
      'instanceRequirements',
    ],
    examples: [
      'Data cleaning and preprocessing',
      'Feature engineering pipelines',
      'Database synchronization',
      'Report generation',
    ],
    bestPractices: [
      'Use spot instances for scheduled ETL jobs',
      'Optimize instance size for data volume',
      'Consider memory-optimized instances for large datasets',
      'Implement retry logic for spot interruptions',
    ],
  },

  // Interactive Computing Templates
  {
    id: 'jupyter-interactive',
    name: 'Interactive Research',
    category: 'interactive',
    description: 'Jupyter notebooks and interactive data analysis',
    defaultPattern: {
      runsPerDay: 8, // 8 hours of interactive use
      avgDurationHours: 1, // Per session
      daysPerWeek: 5,
      instanceRequirements: {
        vCpus: 4,
        memoryGiB: 16,
        gpuRequired: false,
        storageGiB: 100,
      },
      seasonality: ACADEMIC_SEASONALITY,
      timeOfDay: 'business-hours',
      interruptible: false,
      priority: 'normal',
    },
    configurableFields: ['runsPerDay', 'instanceRequirements', 'daysPerWeek'],
    examples: [
      'Jupyter notebook development',
      'Data exploration and visualization',
      'Prototyping and experimentation',
      'Educational computing labs',
    ],
    bestPractices: [
      'Use on-demand instances for interactive workloads',
      'Consider Reserved Instances for dedicated lab environments',
      'Right-size instances based on typical data size',
      'Implement auto-shutdown for idle instances',
    ],
  },

  {
    id: 'bioinformatics-analysis',
    name: 'Bioinformatics Analysis',
    category: 'batch-computing',
    description: 'Computational biology and bioinformatics workflows',
    defaultPattern: {
      runsPerDay: 3,
      avgDurationHours: 4,
      daysPerWeek: 6,
      instanceRequirements: {
        vCpus: 16,
        memoryGiB: 128,
        gpuRequired: false,
        storageGiB: 500,
      },
      seasonality: ACADEMIC_SEASONALITY,
      timeOfDay: 'any',
      interruptible: true,
      priority: 'normal',
      burstCapacity: {
        enabled: true,
        maxConcurrentJobs: 6,
        burstDurationHours: 8,
        burstFrequency: 'weekly',
      },
    },
    configurableFields: [
      'runsPerDay',
      'avgDurationHours',
      'instanceRequirements',
    ],
    examples: [
      'Protein structure prediction',
      'Phylogenetic analysis',
      'Gene expression analysis',
      'Metabolomics data processing',
    ],
    bestPractices: [
      'Use memory-optimized instances for large biological datasets',
      'Consider spot instances for non-time-critical analysis',
      'Scale compute based on dataset complexity',
      'Use burst capacity for peer review deadlines',
    ],
  },
]

/**
 * Get workload template by ID
 */
export function getWorkloadTemplate(id: string): WorkloadTemplate | undefined {
  return WORKLOAD_TEMPLATES.find(template => template.id === id)
}

/**
 * Get workload templates by category
 */
export function getWorkloadTemplatesByCategory(
  category: WorkloadTemplate['category']
): WorkloadTemplate[] {
  return WORKLOAD_TEMPLATES.filter(template => template.category === category)
}

/**
 * Get all available categories
 */
export function getWorkloadCategories(): WorkloadTemplate['category'][] {
  return Array.from(
    new Set(WORKLOAD_TEMPLATES.map(template => template.category))
  )
}
