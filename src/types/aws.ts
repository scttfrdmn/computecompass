export interface ProcessorInfo {
  SupportedArchitectures: string[]
  SustainedClockSpeedInGhz?: number
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
}

export interface GpuInfo {
  Name: string
  Manufacturer: string
  Count: number
  MemoryInfo: GpuMemoryInfo
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
  }
  matchScore: number
  matchReasons: string[]
}
