import { InstanceType } from '../types'

export const MOCK_INSTANCE_TYPES: InstanceType[] = [
  {
    InstanceType: 'm5.large',
    CurrentGeneration: true,
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64'],
      SustainedClockSpeedInGhz: 3.1,
    },
    VCpuInfo: {
      DefaultVCpus: 2,
      DefaultCores: 1,
      DefaultThreadsPerCore: 2,
      ValidCores: [1],
      ValidThreadsPerCore: [1, 2],
    },
    MemoryInfo: {
      SizeInMiB: 8192,
    },
    NetworkInfo: {
      NetworkPerformance: 'Up to 10 Gigabit',
      MaximumNetworkInterfaces: 3,
      Ipv4AddressesPerInterface: 10,
      Ipv6AddressesPerInterface: 10,
      Ipv6Supported: true,
    },
    InstanceStorageInfo: {
      TotalSizeInGB: 0,
      Disks: [],
      NvmeSupport: 'required',
    },
  },
  {
    InstanceType: 'c5.xlarge',
    CurrentGeneration: true,
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64'],
      SustainedClockSpeedInGhz: 3.4,
    },
    VCpuInfo: {
      DefaultVCpus: 4,
      DefaultCores: 2,
      DefaultThreadsPerCore: 2,
      ValidCores: [1, 2],
      ValidThreadsPerCore: [1, 2],
    },
    MemoryInfo: {
      SizeInMiB: 8192,
    },
    NetworkInfo: {
      NetworkPerformance: 'Up to 10 Gigabit',
      MaximumNetworkInterfaces: 4,
      Ipv4AddressesPerInterface: 15,
      Ipv6AddressesPerInterface: 15,
      Ipv6Supported: true,
    },
    InstanceStorageInfo: {
      TotalSizeInGB: 0,
      Disks: [],
      NvmeSupport: 'required',
    },
  },
  {
    InstanceType: 'r5.2xlarge',
    CurrentGeneration: true,
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64'],
      SustainedClockSpeedInGhz: 3.1,
    },
    VCpuInfo: {
      DefaultVCpus: 8,
      DefaultCores: 4,
      DefaultThreadsPerCore: 2,
      ValidCores: [1, 2, 3, 4],
      ValidThreadsPerCore: [1, 2],
    },
    MemoryInfo: {
      SizeInMiB: 65536,
    },
    NetworkInfo: {
      NetworkPerformance: 'Up to 10 Gigabit',
      MaximumNetworkInterfaces: 4,
      Ipv4AddressesPerInterface: 15,
      Ipv6AddressesPerInterface: 15,
      Ipv6Supported: true,
    },
    InstanceStorageInfo: {
      TotalSizeInGB: 0,
      Disks: [],
      NvmeSupport: 'required',
    },
  },
  {
    InstanceType: 'p3.2xlarge',
    CurrentGeneration: true,
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64'],
      SustainedClockSpeedInGhz: 2.7,
    },
    VCpuInfo: {
      DefaultVCpus: 8,
      DefaultCores: 4,
      DefaultThreadsPerCore: 2,
      ValidCores: [1, 2, 3, 4],
      ValidThreadsPerCore: [1, 2],
    },
    MemoryInfo: {
      SizeInMiB: 62464,
    },
    NetworkInfo: {
      NetworkPerformance: 'Up to 10 Gigabit',
      MaximumNetworkInterfaces: 4,
      Ipv4AddressesPerInterface: 15,
      Ipv6AddressesPerInterface: 15,
      Ipv6Supported: true,
    },
    InstanceStorageInfo: {
      TotalSizeInGB: 0,
      Disks: [],
      NvmeSupport: 'required',
    },
    GpuInfo: {
      Gpus: [
        {
          Name: 'V100',
          Manufacturer: 'NVIDIA',
          Count: 1,
          MemoryInfo: {
            SizeInMiB: 16384,
          },
        },
      ],
      TotalGpuMemoryInMiB: 16384,
    },
  },
  {
    InstanceType: 'm6i.32xlarge',
    CurrentGeneration: true,
    ProcessorInfo: {
      SupportedArchitectures: ['x86_64'],
      SustainedClockSpeedInGhz: 3.5,
    },
    VCpuInfo: {
      DefaultVCpus: 128,
      DefaultCores: 64,
      DefaultThreadsPerCore: 2,
      ValidCores: Array.from({ length: 64 }, (_, i) => i + 1),
      ValidThreadsPerCore: [1, 2],
    },
    MemoryInfo: {
      SizeInMiB: 524288,
    },
    NetworkInfo: {
      NetworkPerformance: '50 Gigabit',
      MaximumNetworkInterfaces: 15,
      Ipv4AddressesPerInterface: 50,
      Ipv6AddressesPerInterface: 50,
      Ipv6Supported: true,
    },
    InstanceStorageInfo: {
      TotalSizeInGB: 0,
      Disks: [],
      NvmeSupport: 'required',
    },
  },
]

export const MOCK_PRICING_DATA = {
  'm5.large': {
    onDemand: 0.096,
    reserved1yr: 0.069,
    reserved3yr: 0.045,
    spotCurrent: 0.028,
  },
  'c5.xlarge': {
    onDemand: 0.192,
    reserved1yr: 0.138,
    reserved3yr: 0.089,
    spotCurrent: 0.056,
  },
  'r5.2xlarge': {
    onDemand: 0.504,
    reserved1yr: 0.362,
    reserved3yr: 0.234,
    spotCurrent: 0.147,
  },
  'p3.2xlarge': {
    onDemand: 3.06,
    reserved1yr: 2.196,
    reserved3yr: 1.423,
    spotCurrent: 0.918,
  },
  'm6i.32xlarge': {
    onDemand: 6.144,
    reserved1yr: 4.413,
    reserved3yr: 2.855,
    spotCurrent: 1.843,
  },
}
