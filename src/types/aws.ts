export interface ProcessorInfo {
  SupportedArchitectures: string[]
  SustainedClockSpeedInGhz?: number
  // Enhanced processor details
  Manufacturer?: string // Intel, AMD, AWS
  Family?: string // Xeon, EPYC, Graviton
  Model?: string // Platinum 8259CL, EPYC 7R32, Graviton3
  Generation?: string // Ice Lake, Zen 3, etc.
  CodeName?: string // Manufacturer code name
  Features?: string[] // AVX, AVX2, AVX-512, etc.
}

export interface VCpuInfo {
  DefaultVCpus: number
  DefaultCores: number
  DefaultThreadsPerCore: number
  ValidCores?: number[]
  ValidThreadsPerCore?: number[]
}

export interface MemoryInfo {
  SizeInMiB: number
  // Enhanced memory specifications
  Type?: string // DDR3, DDR4, DDR5
  Speed?: string // 2400 MHz, 3200 MHz, etc.
  Channels?: number // Number of memory channels
  EccSupported?: boolean // Error-correcting code support
}

export interface NetworkInfo {
  NetworkPerformance: string
  MaximumNetworkInterfaces: number
  Ipv4AddressesPerInterface: number
  Ipv6AddressesPerInterface: number
  Ipv6Supported: boolean
}

export interface DiskInfo {
  SizeInGB: number
  Count: number
  Type: string
}

export interface InstanceStorageInfo {
  TotalSizeInGB: number
  Disks: DiskInfo[]
  NvmeSupport?: string
}

export interface GpuMemoryInfo {
  SizeInMiB: number
  // Enhanced GPU memory specifications
  Type?: string // HBM2, HBM2e, GDDR6, GDDR6X
  Bandwidth?: string // Memory bandwidth in GB/s
  BusWidth?: number // Memory bus width in bits
}

export interface GpuInfo {
  Name: string
  Manufacturer: string // NVIDIA, AMD, Intel
  Count: number
  MemoryInfo: GpuMemoryInfo
  // Enhanced GPU specifications
  Model?: string // Tesla V100, A100, H100, etc.
  Generation?: string // Ampere, Ada Lovelace, RDNA2, etc.
  Architecture?: string // Hopper, Ada, etc.
  CodeName?: string // Manufacturer code name
  ComputeCapability?: string // CUDA compute capability
  Cores?: {
    Cuda?: number // CUDA cores
    RT?: number // RT cores
    Tensor?: number // Tensor cores
  }
  ClockSpeed?: {
    Base?: number // Base clock in MHz
    Boost?: number // Boost clock in MHz
  }
  Features?: string[] // Ray tracing, Tensor cores, etc.
}

export interface InstanceGpuInfo {
  Gpus: GpuInfo[]
  TotalGpuMemoryInMiB: number
}

export interface InstanceType {
  InstanceType: string
  CurrentGeneration: boolean
  ProcessorInfo: ProcessorInfo
  VCpuInfo: VCpuInfo
  MemoryInfo: MemoryInfo
  NetworkInfo: NetworkInfo
  InstanceStorageInfo?: InstanceStorageInfo
  GpuInfo?: InstanceGpuInfo
}

export interface PriceDimension {
  unit: string
  pricePerUnit: {
    USD: string
  }
}

export interface OnDemandTerm {
  priceDimensions: Record<string, PriceDimension>
}

export interface ReservedTerm {
  termAttributes: {
    LeaseContractLength: '1yr' | '3yr'
    OfferingClass: 'standard' | 'convertible'
    PurchaseOption: 'No Upfront' | 'Partial Upfront' | 'All Upfront'
  }
  priceDimensions: Record<string, PriceDimension>
}

export interface PricingTerms {
  OnDemand?: Record<string, OnDemandTerm>
  Reserved?: Record<string, ReservedTerm>
}

export interface PriceListItem {
  product: {
    productFamily: string
    attributes: {
      instanceType: string
      memory: string
      vcpu: string
      operatingSystem: string
      location?: string
    }
  }
  terms: PricingTerms
}

export interface SpotPriceHistoryItem {
  AvailabilityZone: string
  InstanceType: string
  ProductDescription: string
  SpotPrice: string
  Timestamp: string
}

export interface ComputeRequirements {
  minVCpus?: number
  maxVCpus?: number
  minMemoryGiB?: number
  maxMemoryGiB?: number
  requireGpu?: boolean
  minGpuMemoryGiB?: number
  architecture?: 'x86_64' | 'arm64'
  networkPerformance?: string[]
  storageType?: 'ebs' | 'instance' | 'any'
}

export interface ResearchWorkload {
  id: string
  name: string
  description: string
  category:
    | 'genomics'
    | 'climate'
    | 'ml'
    | 'physics'
    | 'chemistry'
    | 'engineering'
  requirements: ComputeRequirements
  estimatedRuntime?: {
    min: number
    max: number
    unit: 'hours' | 'days' | 'weeks'
  }
}

export interface InstanceMatch {
  instance: InstanceType
  pricing: {
    onDemand: number
    reserved1yr: number
    reserved3yr: number
    spotCurrent: number
    spotAverage24h?: number
    savingsPlans1yr?: number
    savingsPlans3yr?: number
  }
  matchScore: number
  matchReasons: string[]
}

export interface InstanceFamily {
  family: string
  name: string
  description: string
  category:
    | 'general'
    | 'compute'
    | 'memory'
    | 'storage'
    | 'gpu'
    | 'ai-ml'
    | 'fpga'
  processor: 'intel' | 'amd' | 'graviton' | 'inferentia' | 'trainium'
  generation: number
  instances: InstanceType[]
  spotAvailable: boolean
}
