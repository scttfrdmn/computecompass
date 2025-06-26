import type {
  ProcessorInfo,
  MemoryInfo,
  GpuInfo,
  InstanceType,
  InstanceFamily,
} from '../types'

/**
 * Hardware specification database for AWS instance types
 * This service enriches AWS instance data with detailed processor, memory, and GPU specs
 */

// Processor specifications database
export const PROCESSOR_SPECS: Record<string, Partial<ProcessorInfo>> = {
  // Intel Xeon processors
  'Intel Xeon Platinum 8259CL': {
    Manufacturer: 'Intel',
    Family: 'Xeon Platinum',
    Model: '8259CL',
    Generation: 'Cascade Lake',
    CodeName: 'Cascade Lake',
    Features: ['AVX', 'AVX2', 'AVX-512', 'Intel Turbo Boost'],
  },
  'Intel Xeon Platinum 8275CL': {
    Manufacturer: 'Intel',
    Family: 'Xeon Platinum',
    Model: '8275CL',
    Generation: 'Cascade Lake',
    CodeName: 'Cascade Lake',
    Features: ['AVX', 'AVX2', 'AVX-512', 'Intel Turbo Boost'],
  },
  'Intel Xeon Platinum 8175': {
    Manufacturer: 'Intel',
    Family: 'Xeon Platinum',
    Model: '8175',
    Generation: 'Skylake',
    CodeName: 'Skylake-SP',
    Features: ['AVX', 'AVX2', 'AVX-512', 'Intel Turbo Boost'],
  },
  'Intel Skylake E5 2686 v5': {
    Manufacturer: 'Intel',
    Family: 'Xeon E5',
    Model: '2686 v5',
    Generation: 'Skylake',
    CodeName: 'Skylake-SP',
    Features: ['AVX', 'AVX2', 'Intel Turbo Boost'],
  },
  'Intel Ice Lake': {
    Manufacturer: 'Intel',
    Family: 'Xeon',
    Generation: 'Ice Lake',
    CodeName: 'Ice Lake-SP',
    Features: ['AVX', 'AVX2', 'AVX-512', 'Intel DL Boost'],
  },

  // AMD EPYC processors
  'AMD EPYC 7R32': {
    Manufacturer: 'AMD',
    Family: 'EPYC',
    Model: '7R32',
    Generation: 'Zen 2',
    CodeName: 'Rome',
    Features: ['AVX', 'AVX2', 'AMD Precision Boost'],
  },
  'AMD EPYC 7R13': {
    Manufacturer: 'AMD',
    Family: 'EPYC',
    Model: '7R13',
    Generation: 'Zen 3',
    CodeName: 'Milan',
    Features: ['AVX', 'AVX2', 'AMD Precision Boost 2'],
  },
  'AMD EPYC 9R14': {
    Manufacturer: 'AMD',
    Family: 'EPYC',
    Model: '9R14',
    Generation: 'Zen 4',
    CodeName: 'Genoa',
    Features: ['AVX', 'AVX2', 'AVX-512', 'AMD Precision Boost 2'],
  },

  // AWS Graviton processors (all versions)
  'AWS Graviton': {
    Manufacturer: 'AWS',
    Family: 'Graviton',
    Model: 'Graviton',
    Generation: 'Graviton1',
    CodeName: 'Annapurna Labs AL73400',
    Features: ['ARM Neon', 'ARM Cortex-A72'],
  },
  'AWS Graviton2': {
    Manufacturer: 'AWS',
    Family: 'Graviton',
    Model: 'Graviton2',
    Generation: 'Graviton2',
    CodeName: 'Annapurna Labs AL324',
    Features: ['ARM Neon', 'ARM64', 'ARM Cortex-A76', '256-bit SVE'],
  },
  'AWS Graviton3': {
    Manufacturer: 'AWS',
    Family: 'Graviton',
    Model: 'Graviton3',
    Generation: 'Graviton3',
    CodeName: 'Annapurna Labs AL375',
    Features: [
      'ARM Neon',
      'ARM64',
      'DDR5',
      'ARM Cortex-A78C',
      '256-bit SVE',
      'Pointer Authentication',
    ],
  },
  'AWS Graviton3E': {
    Manufacturer: 'AWS',
    Family: 'Graviton',
    Model: 'Graviton3E',
    Generation: 'Graviton3E',
    CodeName: 'Annapurna Labs AL375E',
    Features: [
      'ARM Neon',
      'ARM64',
      'DDR5',
      'ARM Cortex-A78C',
      '256-bit SVE',
      'Vector Processing',
      'HPC Optimizations',
    ],
  },
  'AWS Graviton4': {
    Manufacturer: 'AWS',
    Family: 'Graviton',
    Model: 'Graviton4',
    Generation: 'Graviton4',
    CodeName: 'Annapurna Labs AL425',
    Features: [
      'ARM Neon',
      'ARM64',
      'DDR5',
      'ARM Cortex-A720',
      '512-bit SVE2',
      'Advanced Vector Extensions',
    ],
  },

  // AWS AI/ML processors
  'AWS Inferentia': {
    Manufacturer: 'AWS',
    Family: 'Inferentia',
    Model: 'Inferentia',
    Generation: 'Inferentia1',
    CodeName: 'Inferentia Chip',
    Features: [
      'Neural Processing Unit',
      'INT8/FP16/BF16',
      'Systolic Arrays',
      'High Throughput Inference',
    ],
  },
  'AWS Inferentia2': {
    Manufacturer: 'AWS',
    Family: 'Inferentia',
    Model: 'Inferentia2',
    Generation: 'Inferentia2',
    CodeName: 'Inferentia2 Chip',
    Features: [
      'Neural Processing Unit',
      'INT8/FP16/BF16/FP32',
      'NeuronCore v2',
      '4x Performance vs Inferentia1',
      'Transformer Optimizations',
    ],
  },
  'AWS Trainium': {
    Manufacturer: 'AWS',
    Family: 'Trainium',
    Model: 'Trainium',
    Generation: 'Trainium1',
    CodeName: 'Trainium Chip',
    Features: [
      'Neural Processing Unit',
      'FP32/BF16/FP16',
      'NeuronCore-v2',
      'High Bandwidth Memory',
      'ML Training Optimized',
    ],
  },
  'AWS Trainium2': {
    Manufacturer: 'AWS',
    Family: 'Trainium',
    Model: 'Trainium2',
    Generation: 'Trainium2',
    CodeName: 'Trainium2 Chip',
    Features: [
      'Neural Processing Unit',
      'FP32/BF16/FP16/FP8',
      'NeuronCore-v3',
      'Ultra High Bandwidth Memory',
      '4x Performance vs Trainium1',
    ],
  },
}

// Memory type specifications by instance family
export const MEMORY_SPECS: Record<string, Partial<MemoryInfo>> = {
  // Current generation instances typically use DDR4
  m5: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },
  m6i: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  m6a: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  m7i: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },
  m7a: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },
  m7g: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },

  c5: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },
  c6i: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  c6a: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  c7i: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },
  c7a: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },
  c7g: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },

  r5: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },
  r6i: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  r6a: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  r7i: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },
  r7a: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },
  r7g: { Type: 'DDR5', Speed: '4800 MHz', Channels: 4, EccSupported: true },

  // Older generation instances
  t3: { Type: 'DDR4', Speed: '2400 MHz', Channels: 2, EccSupported: false },
  t2: { Type: 'DDR3', Speed: '1600 MHz', Channels: 2, EccSupported: false },
  m4: { Type: 'DDR4', Speed: '2133 MHz', Channels: 4, EccSupported: true },
  c4: { Type: 'DDR4', Speed: '2133 MHz', Channels: 4, EccSupported: true },
  r4: { Type: 'DDR4', Speed: '2133 MHz', Channels: 4, EccSupported: true },

  // High memory instances
  x1: { Type: 'DDR4', Speed: '2133 MHz', Channels: 4, EccSupported: true },
  x1e: { Type: 'DDR4', Speed: '2400 MHz', Channels: 4, EccSupported: true },
  x2i: { Type: 'DDR4', Speed: '3200 MHz', Channels: 8, EccSupported: true },
  x2g: { Type: 'DDR4', Speed: '3200 MHz', Channels: 8, EccSupported: true },

  // GPU instances
  p3: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },
  p4: { Type: 'DDR4', Speed: '3200 MHz', Channels: 8, EccSupported: true },
  p5: { Type: 'DDR5', Speed: '4800 MHz', Channels: 8, EccSupported: true },
  g4: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },
  g5: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },

  // FPGA instances
  f1: { Type: 'DDR4', Speed: '2133 MHz', Channels: 4, EccSupported: true },
  f2: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },

  // AMD GPU instances
  g4ad: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },
  g5g: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },

  // AWS AI/ML instances
  inf1: { Type: 'DDR4', Speed: '2666 MHz', Channels: 4, EccSupported: true },
  inf2: { Type: 'DDR5', Speed: '4800 MHz', Channels: 8, EccSupported: true },
  trn1: { Type: 'DDR4', Speed: '3200 MHz', Channels: 8, EccSupported: true },
  trn1n: { Type: 'DDR4', Speed: '3200 MHz', Channels: 8, EccSupported: true },
  trn2: { Type: 'DDR5', Speed: '5600 MHz', Channels: 12, EccSupported: true },

  // Additional Graviton instances
  a1: { Type: 'DDR4', Speed: '2400 MHz', Channels: 4, EccSupported: true },
  t4g: { Type: 'DDR4', Speed: '3200 MHz', Channels: 2, EccSupported: false },
  m6g: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  m6gd: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  c6g: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  c6gd: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  r6g: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  r6gd: { Type: 'DDR4', Speed: '3200 MHz', Channels: 4, EccSupported: true },
  hpc7g: { Type: 'DDR5', Speed: '4800 MHz', Channels: 8, EccSupported: true },
}

// GPU specifications database
export const GPU_SPECS: Record<string, Partial<GpuInfo>> = {
  // NVIDIA Tesla/Data Center GPUs
  'Tesla V100': {
    Manufacturer: 'NVIDIA',
    Model: 'Tesla V100',
    Generation: 'Volta',
    Architecture: 'Volta',
    CodeName: 'GV100',
    ComputeCapability: '7.0',
    Cores: { Cuda: 5120, Tensor: 640 },
    ClockSpeed: { Base: 1245, Boost: 1380 },
    MemoryInfo: { Type: 'HBM2', Bandwidth: '900 GB/s', BusWidth: 4096 },
    Features: ['Tensor Cores', 'NVLink', 'ECC'],
  },
  'Tesla A100': {
    Manufacturer: 'NVIDIA',
    Model: 'Tesla A100',
    Generation: 'Ampere',
    Architecture: 'Ampere',
    CodeName: 'GA100',
    ComputeCapability: '8.0',
    Cores: { Cuda: 6912, Tensor: 432 },
    ClockSpeed: { Base: 765, Boost: 1410 },
    MemoryInfo: { Type: 'HBM2e', Bandwidth: '1555 GB/s', BusWidth: 5120 },
    Features: ['3rd Gen Tensor Cores', 'NVLink', 'ECC', 'MIG'],
  },
  'Tesla H100': {
    Manufacturer: 'NVIDIA',
    Model: 'Tesla H100',
    Generation: 'Hopper',
    Architecture: 'Hopper',
    CodeName: 'GH100',
    ComputeCapability: '9.0',
    Cores: { Cuda: 16896, Tensor: 528 },
    ClockSpeed: { Base: 1095, Boost: 1980 },
    MemoryInfo: { Type: 'HBM3', Bandwidth: '3350 GB/s', BusWidth: 5120 },
    Features: [
      '4th Gen Tensor Cores',
      'NVLink',
      'ECC',
      'MIG',
      'Transformer Engine',
    ],
  },
  'Tesla T4': {
    Manufacturer: 'NVIDIA',
    Model: 'Tesla T4',
    Generation: 'Turing',
    Architecture: 'Turing',
    CodeName: 'TU104',
    ComputeCapability: '7.5',
    Cores: { Cuda: 2560, RT: 40, Tensor: 320 },
    ClockSpeed: { Base: 585, Boost: 1590 },
    MemoryInfo: { Type: 'GDDR6', Bandwidth: '320 GB/s', BusWidth: 256 },
    Features: ['RT Cores', 'Tensor Cores', 'NVENC/NVDEC'],
  },
  'Tesla K80': {
    Manufacturer: 'NVIDIA',
    Model: 'Tesla K80',
    Generation: 'Kepler',
    Architecture: 'Kepler',
    CodeName: 'GK210',
    ComputeCapability: '3.7',
    Cores: { Cuda: 4992 },
    ClockSpeed: { Base: 562, Boost: 875 },
    MemoryInfo: { Type: 'GDDR5', Bandwidth: '480 GB/s', BusWidth: 768 },
    Features: ['ECC', 'Dynamic Parallelism'],
  },

  // AMD GPUs on AWS
  'Radeon Pro V520': {
    Manufacturer: 'AMD',
    Model: 'Radeon Pro V520',
    Generation: 'RDNA2',
    Architecture: 'RDNA2',
    CodeName: 'Navi 21',
    Cores: { Cuda: 2560 }, // Stream processors
    ClockSpeed: { Base: 1181, Boost: 1815 },
    MemoryInfo: { Type: 'GDDR6', Bandwidth: '448 GB/s', BusWidth: 256 },
    Features: [
      'Hardware-accelerated Ray Tracing',
      'Variable Rate Shading',
      'AMD Infinity Cache',
    ],
  },
  'Radeon Pro V620': {
    Manufacturer: 'AMD',
    Model: 'Radeon Pro V620',
    Generation: 'RDNA2',
    Architecture: 'RDNA2',
    CodeName: 'Navi 21',
    Cores: { Cuda: 2560 }, // Stream processors
    ClockSpeed: { Base: 1181, Boost: 1815 },
    MemoryInfo: { Type: 'GDDR6', Bandwidth: '512 GB/s', BusWidth: 256 },
    Features: [
      'Hardware-accelerated Ray Tracing',
      'Variable Rate Shading',
      'AMD Infinity Cache',
      'SR-IOV',
    ],
  },
  'Radeon Pro VII': {
    Manufacturer: 'AMD',
    Model: 'Radeon Pro VII',
    Generation: 'Vega',
    Architecture: 'Vega 20',
    CodeName: 'Vega 20',
    Cores: { Cuda: 3840 }, // Stream processors
    ClockSpeed: { Base: 1400, Boost: 1750 },
    MemoryInfo: { Type: 'HBM2', Bandwidth: '1024 GB/s', BusWidth: 4096 },
    Features: ['ECC', 'High Bandwidth Memory', 'Rapid Packed Math'],
  },

  // Intel GPUs (emerging on AWS)
  'Intel Data Center GPU Max': {
    Manufacturer: 'Intel',
    Model: 'Data Center GPU Max',
    Generation: 'Xe-HPC',
    Architecture: 'Xe-HPC',
    CodeName: 'Ponte Vecchio',
    MemoryInfo: { Type: 'HBM2e', Bandwidth: '3200 GB/s', BusWidth: 8192 },
    Features: ['Xe Matrix Extensions', 'Ray Tracing', 'Variable Rate Shading'],
  },

  // FPGA offerings on AWS
  'Xilinx Alveo U200': {
    Manufacturer: 'Xilinx',
    Model: 'Alveo U200',
    Generation: 'UltraScale+',
    Architecture: 'UltraScale+',
    CodeName: 'VU9P',
    MemoryInfo: { Type: 'DDR4', Bandwidth: '77 GB/s', BusWidth: 512 },
    Features: ['FPGA', 'Programmable Logic', 'PCIe Gen3 x16', 'HBM'],
  },
  'Xilinx Alveo U250': {
    Manufacturer: 'Xilinx',
    Model: 'Alveo U250',
    Generation: 'UltraScale+',
    Architecture: 'UltraScale+',
    CodeName: 'VU13P',
    MemoryInfo: { Type: 'DDR4', Bandwidth: '77 GB/s', BusWidth: 512 },
    Features: ['FPGA', 'Programmable Logic', 'PCIe Gen3 x16', 'HBM'],
  },
  'Xilinx Alveo U280': {
    Manufacturer: 'Xilinx',
    Model: 'Alveo U280',
    Generation: 'UltraScale+',
    Architecture: 'UltraScale+',
    CodeName: 'VU37P',
    MemoryInfo: { Type: 'HBM2', Bandwidth: '460 GB/s', BusWidth: 8192 },
    Features: [
      'FPGA',
      'Programmable Logic',
      'PCIe Gen4 x16',
      'HBM2',
      'AES/SHA Acceleration',
    ],
  },
  'Xilinx Versal VCK5000': {
    Manufacturer: 'Xilinx',
    Model: 'Versal VCK5000',
    Generation: 'Versal',
    Architecture: 'Versal ACAP',
    CodeName: 'VC1902',
    MemoryInfo: { Type: 'LPDDR4', Bandwidth: '34 GB/s', BusWidth: 256 },
    Features: [
      'FPGA',
      'AI Engine',
      'Programmable Logic',
      'PCIe Gen4 x16',
      'Scalar Engines',
    ],
  },
  'Intel Stratix 10': {
    Manufacturer: 'Intel',
    Model: 'Stratix 10',
    Generation: 'Stratix 10',
    Architecture: 'Stratix 10',
    CodeName: 'Stratix 10',
    MemoryInfo: { Type: 'DDR4', Bandwidth: '51 GB/s', BusWidth: 512 },
    Features: [
      'FPGA',
      'Programmable Logic',
      'PCIe Gen3 x8',
      'Hardened IP blocks',
    ],
  },
  'Intel Arria 10': {
    Manufacturer: 'Intel',
    Model: 'Arria 10',
    Generation: 'Arria 10',
    Architecture: 'Arria 10',
    CodeName: 'Arria 10',
    MemoryInfo: { Type: 'DDR3/DDR4', Bandwidth: '34 GB/s', BusWidth: 256 },
    Features: ['FPGA', 'Programmable Logic', 'PCIe Gen3 x8', 'DSP blocks'],
  },

  // AWS AI/ML accelerators
  'AWS Inferentia': {
    Manufacturer: 'AWS',
    Model: 'Inferentia',
    Generation: 'Inferentia1',
    Architecture: 'Neural Processing Unit',
    CodeName: 'Inferentia Chip',
    MemoryInfo: { Type: 'HBM', Bandwidth: '100+ GB/s', BusWidth: 1024 },
    Features: [
      'Neural Processing Unit',
      'INT8/FP16/BF16',
      'Systolic Arrays',
      'Inference Optimized',
      'NeuronCore',
    ],
  },
  'AWS Inferentia2': {
    Manufacturer: 'AWS',
    Model: 'Inferentia2',
    Generation: 'Inferentia2',
    Architecture: 'Neural Processing Unit',
    CodeName: 'Inferentia2 Chip',
    MemoryInfo: { Type: 'HBM2e', Bandwidth: '400+ GB/s', BusWidth: 2048 },
    Features: [
      'Neural Processing Unit',
      'INT8/FP16/BF16/FP32',
      'NeuronCore v2',
      '4x Performance vs Inf1',
      'Transformer Optimized',
    ],
  },
  'AWS Trainium': {
    Manufacturer: 'AWS',
    Model: 'Trainium',
    Generation: 'Trainium1',
    Architecture: 'Neural Processing Unit',
    CodeName: 'Trainium Chip',
    MemoryInfo: { Type: 'HBM2e', Bandwidth: '820 GB/s', BusWidth: 4096 },
    Features: [
      'Neural Processing Unit',
      'FP32/BF16/FP16',
      'NeuronCore-v2',
      'Training Optimized',
      'Collective Communication',
    ],
  },
  'AWS Trainium2': {
    Manufacturer: 'AWS',
    Model: 'Trainium2',
    Generation: 'Trainium2',
    Architecture: 'Neural Processing Unit',
    CodeName: 'Trainium2 Chip',
    MemoryInfo: { Type: 'HBM3', Bandwidth: '3200+ GB/s', BusWidth: 8192 },
    Features: [
      'Neural Processing Unit',
      'FP32/BF16/FP16/FP8',
      'NeuronCore-v3',
      '4x Performance vs Trn1',
      'Scalable Training',
    ],
  },
}

// Instance family definitions for grouping and spot selection
export const INSTANCE_FAMILIES: Record<
  string,
  Omit<InstanceFamily, 'instances'>
> = {
  // General Purpose instances
  t2: {
    family: 't2',
    name: 'T2 Burstable',
    description: 'Burstable performance instances with Intel processors',
    category: 'general',
    processor: 'intel',
    generation: 2,
    spotAvailable: true,
  },
  t3: {
    family: 't3',
    name: 'T3 Burstable',
    description: 'Burstable performance instances with Intel processors',
    category: 'general',
    processor: 'intel',
    generation: 3,
    spotAvailable: true,
  },
  t4g: {
    family: 't4g',
    name: 'T4g Burstable',
    description:
      'Burstable performance instances with AWS Graviton2 processors',
    category: 'general',
    processor: 'graviton',
    generation: 4,
    spotAvailable: true,
  },
  m5: {
    family: 'm5',
    name: 'M5 General Purpose',
    description:
      'General purpose instances with Intel Xeon Platinum processors',
    category: 'general',
    processor: 'intel',
    generation: 5,
    spotAvailable: true,
  },
  m6i: {
    family: 'm6i',
    name: 'M6i General Purpose',
    description:
      'General purpose instances with 3rd Gen Intel Xeon Scalable processors',
    category: 'general',
    processor: 'intel',
    generation: 6,
    spotAvailable: true,
  },
  m6a: {
    family: 'm6a',
    name: 'M6a General Purpose',
    description: 'General purpose instances with AMD EPYC processors',
    category: 'general',
    processor: 'amd',
    generation: 6,
    spotAvailable: true,
  },
  m6g: {
    family: 'm6g',
    name: 'M6g General Purpose',
    description: 'General purpose instances with AWS Graviton2 processors',
    category: 'general',
    processor: 'graviton',
    generation: 6,
    spotAvailable: true,
  },
  m7i: {
    family: 'm7i',
    name: 'M7i General Purpose',
    description:
      'General purpose instances with 4th Gen Intel Xeon Scalable processors',
    category: 'general',
    processor: 'intel',
    generation: 7,
    spotAvailable: true,
  },
  m7a: {
    family: 'm7a',
    name: 'M7a General Purpose',
    description: 'General purpose instances with AMD EPYC processors',
    category: 'general',
    processor: 'amd',
    generation: 7,
    spotAvailable: true,
  },
  m7g: {
    family: 'm7g',
    name: 'M7g General Purpose',
    description: 'General purpose instances with AWS Graviton3 processors',
    category: 'general',
    processor: 'graviton',
    generation: 7,
    spotAvailable: true,
  },

  // Compute Optimized instances
  c5: {
    family: 'c5',
    name: 'C5 Compute Optimized',
    description:
      'Compute optimized instances with Intel Xeon Platinum processors',
    category: 'compute',
    processor: 'intel',
    generation: 5,
    spotAvailable: true,
  },
  c6i: {
    family: 'c6i',
    name: 'C6i Compute Optimized',
    description:
      'Compute optimized instances with 3rd Gen Intel Xeon Scalable processors',
    category: 'compute',
    processor: 'intel',
    generation: 6,
    spotAvailable: true,
  },
  c6a: {
    family: 'c6a',
    name: 'C6a Compute Optimized',
    description: 'Compute optimized instances with AMD EPYC processors',
    category: 'compute',
    processor: 'amd',
    generation: 6,
    spotAvailable: true,
  },
  c6g: {
    family: 'c6g',
    name: 'C6g Compute Optimized',
    description: 'Compute optimized instances with AWS Graviton2 processors',
    category: 'compute',
    processor: 'graviton',
    generation: 6,
    spotAvailable: true,
  },
  c7i: {
    family: 'c7i',
    name: 'C7i Compute Optimized',
    description:
      'Compute optimized instances with 4th Gen Intel Xeon Scalable processors',
    category: 'compute',
    processor: 'intel',
    generation: 7,
    spotAvailable: true,
  },
  c7a: {
    family: 'c7a',
    name: 'C7a Compute Optimized',
    description: 'Compute optimized instances with AMD EPYC processors',
    category: 'compute',
    processor: 'amd',
    generation: 7,
    spotAvailable: true,
  },
  c7g: {
    family: 'c7g',
    name: 'C7g Compute Optimized',
    description: 'Compute optimized instances with AWS Graviton3 processors',
    category: 'compute',
    processor: 'graviton',
    generation: 7,
    spotAvailable: true,
  },
  hpc7g: {
    family: 'hpc7g',
    name: 'HPC7g High Performance Computing',
    description: 'HPC instances with AWS Graviton3E processors',
    category: 'compute',
    processor: 'graviton',
    generation: 7,
    spotAvailable: false,
  },

  // Memory Optimized instances
  r5: {
    family: 'r5',
    name: 'R5 Memory Optimized',
    description:
      'Memory optimized instances with Intel Xeon Platinum processors',
    category: 'memory',
    processor: 'intel',
    generation: 5,
    spotAvailable: true,
  },
  r6i: {
    family: 'r6i',
    name: 'R6i Memory Optimized',
    description:
      'Memory optimized instances with 3rd Gen Intel Xeon Scalable processors',
    category: 'memory',
    processor: 'intel',
    generation: 6,
    spotAvailable: true,
  },
  r6a: {
    family: 'r6a',
    name: 'R6a Memory Optimized',
    description: 'Memory optimized instances with AMD EPYC processors',
    category: 'memory',
    processor: 'amd',
    generation: 6,
    spotAvailable: true,
  },
  r6g: {
    family: 'r6g',
    name: 'R6g Memory Optimized',
    description: 'Memory optimized instances with AWS Graviton2 processors',
    category: 'memory',
    processor: 'graviton',
    generation: 6,
    spotAvailable: true,
  },
  r7i: {
    family: 'r7i',
    name: 'R7i Memory Optimized',
    description:
      'Memory optimized instances with 4th Gen Intel Xeon Scalable processors',
    category: 'memory',
    processor: 'intel',
    generation: 7,
    spotAvailable: true,
  },
  r7a: {
    family: 'r7a',
    name: 'R7a Memory Optimized',
    description: 'Memory optimized instances with AMD EPYC processors',
    category: 'memory',
    processor: 'amd',
    generation: 7,
    spotAvailable: true,
  },
  r7g: {
    family: 'r7g',
    name: 'R7g Memory Optimized',
    description: 'Memory optimized instances with AWS Graviton3 processors',
    category: 'memory',
    processor: 'graviton',
    generation: 7,
    spotAvailable: true,
  },
  x1: {
    family: 'x1',
    name: 'X1 High Memory',
    description: 'High memory instances with Intel Xeon E7 processors',
    category: 'memory',
    processor: 'intel',
    generation: 1,
    spotAvailable: true,
  },
  x1e: {
    family: 'x1e',
    name: 'X1e High Memory',
    description: 'High memory instances with Intel Xeon E7 processors',
    category: 'memory',
    processor: 'intel',
    generation: 1,
    spotAvailable: true,
  },
  x2i: {
    family: 'x2i',
    name: 'X2i High Memory',
    description: 'High memory instances with Intel processors',
    category: 'memory',
    processor: 'intel',
    generation: 2,
    spotAvailable: true,
  },
  x2g: {
    family: 'x2g',
    name: 'X2g High Memory',
    description: 'High memory instances with AWS Graviton2 processors',
    category: 'memory',
    processor: 'graviton',
    generation: 2,
    spotAvailable: true,
  },

  // GPU instances
  p3: {
    family: 'p3',
    name: 'P3 GPU Compute',
    description: 'GPU instances with NVIDIA Tesla V100 for ML training',
    category: 'gpu',
    processor: 'intel',
    generation: 3,
    spotAvailable: true,
  },
  p4: {
    family: 'p4',
    name: 'P4 GPU Compute',
    description: 'GPU instances with NVIDIA Tesla A100 for ML training',
    category: 'gpu',
    processor: 'intel',
    generation: 4,
    spotAvailable: true,
  },
  p5: {
    family: 'p5',
    name: 'P5 GPU Compute',
    description: 'GPU instances with NVIDIA H100 for ML training',
    category: 'gpu',
    processor: 'intel',
    generation: 5,
    spotAvailable: false,
  },
  g4dn: {
    family: 'g4dn',
    name: 'G4dn GPU Graphics',
    description: 'GPU instances with NVIDIA Tesla T4 for graphics workloads',
    category: 'gpu',
    processor: 'intel',
    generation: 4,
    spotAvailable: true,
  },
  g4ad: {
    family: 'g4ad',
    name: 'G4ad GPU Graphics',
    description: 'GPU instances with AMD Radeon Pro V520',
    category: 'gpu',
    processor: 'amd',
    generation: 4,
    spotAvailable: true,
  },
  g5: {
    family: 'g5',
    name: 'G5 GPU Graphics',
    description: 'GPU instances with NVIDIA A10G for graphics workloads',
    category: 'gpu',
    processor: 'intel',
    generation: 5,
    spotAvailable: true,
  },
  g5g: {
    family: 'g5g',
    name: 'G5g GPU Graphics',
    description: 'GPU instances with NVIDIA Tesla T4G and AWS Graviton2',
    category: 'gpu',
    processor: 'graviton',
    generation: 5,
    spotAvailable: true,
  },

  // AI/ML instances
  inf1: {
    family: 'inf1',
    name: 'Inf1 ML Inference',
    description: 'ML inference instances with AWS Inferentia chips',
    category: 'ai-ml',
    processor: 'inferentia',
    generation: 1,
    spotAvailable: true,
  },
  inf2: {
    family: 'inf2',
    name: 'Inf2 ML Inference',
    description: 'ML inference instances with AWS Inferentia2 chips',
    category: 'ai-ml',
    processor: 'inferentia',
    generation: 2,
    spotAvailable: true,
  },
  trn1: {
    family: 'trn1',
    name: 'Trn1 ML Training',
    description: 'ML training instances with AWS Trainium chips',
    category: 'ai-ml',
    processor: 'trainium',
    generation: 1,
    spotAvailable: false,
  },
  trn1n: {
    family: 'trn1n',
    name: 'Trn1n ML Training',
    description: 'Network-optimized ML training instances with AWS Trainium',
    category: 'ai-ml',
    processor: 'trainium',
    generation: 1,
    spotAvailable: false,
  },
  trn2: {
    family: 'trn2',
    name: 'Trn2 ML Training',
    description: 'Next-gen ML training instances with AWS Trainium2',
    category: 'ai-ml',
    processor: 'trainium',
    generation: 2,
    spotAvailable: false,
  },

  // FPGA instances
  f1: {
    family: 'f1',
    name: 'F1 FPGA',
    description: 'FPGA instances with Xilinx UltraScale+ VU9P FPGAs',
    category: 'fpga',
    processor: 'intel',
    generation: 1,
    spotAvailable: true,
  },

  // Storage Optimized instances
  i3: {
    family: 'i3',
    name: 'I3 Storage Optimized',
    description: 'Storage optimized instances with NVMe SSD storage',
    category: 'storage',
    processor: 'intel',
    generation: 3,
    spotAvailable: true,
  },
  i4i: {
    family: 'i4i',
    name: 'I4i Storage Optimized',
    description: 'Storage optimized instances with NVMe SSD storage',
    category: 'storage',
    processor: 'intel',
    generation: 4,
    spotAvailable: true,
  },
  i4g: {
    family: 'i4g',
    name: 'I4g Storage Optimized',
    description: 'Storage optimized instances with AWS Graviton2 and NVMe SSD',
    category: 'storage',
    processor: 'graviton',
    generation: 4,
    spotAvailable: true,
  },
  d3: {
    family: 'd3',
    name: 'D3 Dense Storage',
    description: 'Dense storage instances with HDD storage',
    category: 'storage',
    processor: 'intel',
    generation: 3,
    spotAvailable: true,
  },
}

/**
 * Service to enrich AWS instance data with detailed hardware specifications
 */
export class HardwareSpecsService {
  /**
   * Enhance processor information with detailed specs
   */
  static enhanceProcessorInfo(
    processorName: string,
    baseInfo: ProcessorInfo
  ): ProcessorInfo {
    const specs = PROCESSOR_SPECS[processorName] || {}

    // Try to match partial processor names
    if (!specs.Manufacturer) {
      for (const [key, value] of Object.entries(PROCESSOR_SPECS)) {
        if (processorName.includes(key) || key.includes(processorName)) {
          Object.assign(specs, value)
          break
        }
      }
    }

    return { ...baseInfo, ...specs }
  }

  /**
   * Enhance memory information with detailed specs
   */
  static enhanceMemoryInfo(
    instanceType: string,
    baseInfo: MemoryInfo
  ): MemoryInfo {
    const instanceFamily = instanceType.split('.')[0]
    const specs = MEMORY_SPECS[instanceFamily] || {}

    return { ...baseInfo, ...specs }
  }

  /**
   * Enhance GPU information with detailed specs
   */
  static enhanceGpuInfo(gpuName: string, baseInfo: GpuInfo): GpuInfo {
    const specs = GPU_SPECS[gpuName] || {}

    // Try to match partial GPU names
    if (!specs.Manufacturer) {
      for (const [key, value] of Object.entries(GPU_SPECS)) {
        if (gpuName.includes(key) || key.includes(gpuName)) {
          Object.assign(specs, value)
          break
        }
      }
    }

    // Merge memory info properly
    if (specs.MemoryInfo && baseInfo.MemoryInfo) {
      specs.MemoryInfo = { ...baseInfo.MemoryInfo, ...specs.MemoryInfo }
    }

    return { ...baseInfo, ...specs }
  }

  /**
   * Get processor generation and features summary
   */
  static getProcessorSummary(processorInfo: ProcessorInfo): string {
    const parts = []

    if (processorInfo.Manufacturer) {
      parts.push(processorInfo.Manufacturer)
    }

    if (processorInfo.Family) {
      parts.push(processorInfo.Family)
    }

    if (processorInfo.Model) {
      parts.push(processorInfo.Model)
    }

    if (processorInfo.Generation) {
      parts.push(`(${processorInfo.Generation})`)
    }

    return parts.join(' ') || 'Unknown Processor'
  }

  /**
   * Get memory type and speed summary
   */
  static getMemorySummary(memoryInfo: MemoryInfo): string {
    const parts = []

    if (memoryInfo.Type) {
      parts.push(memoryInfo.Type)
    }

    if (memoryInfo.Speed) {
      parts.push(memoryInfo.Speed)
    }

    if (memoryInfo.EccSupported) {
      parts.push('ECC')
    }

    return parts.join(' ') || 'Standard Memory'
  }

  /**
   * Get GPU model and architecture summary
   */
  static getGpuSummary(gpuInfo: GpuInfo): string {
    const parts = []

    if (gpuInfo.Manufacturer) {
      parts.push(gpuInfo.Manufacturer)
    }

    if (gpuInfo.Model) {
      parts.push(gpuInfo.Model)
    }

    if (gpuInfo.Architecture) {
      parts.push(`(${gpuInfo.Architecture})`)
    }

    return parts.join(' ') || gpuInfo.Name || 'Unknown GPU'
  }

  /**
   * Group instances by family for better organization and spot selection
   */
  static groupInstancesByFamily(instances: InstanceType[]): InstanceFamily[] {
    const familyGroups = new Map<string, InstanceType[]>()

    // Group instances by family
    instances.forEach(instance => {
      const family = instance.InstanceType?.split('.')[0] || 'unknown'
      if (!familyGroups.has(family)) {
        familyGroups.set(family, [])
      }
      familyGroups.get(family)!.push(instance)
    })

    // Convert to InstanceFamily objects
    const families: InstanceFamily[] = []
    familyGroups.forEach((instances, family) => {
      const familyDef = INSTANCE_FAMILIES[family]
      if (familyDef) {
        families.push({
          ...familyDef,
          instances: instances.sort((a, b) => {
            // Sort by instance size (micro, small, medium, large, etc.)
            const sizeOrder = [
              'nano',
              'micro',
              'small',
              'medium',
              'large',
              'xlarge',
              '2xlarge',
              '4xlarge',
              '8xlarge',
              '12xlarge',
              '16xlarge',
              '24xlarge',
              '32xlarge',
              '48xlarge',
              '96xlarge',
            ]
            const aSize = a.InstanceType?.split('.')[1] || ''
            const bSize = b.InstanceType?.split('.')[1] || ''
            return sizeOrder.indexOf(aSize) - sizeOrder.indexOf(bSize)
          }),
        })
      } else {
        // Unknown family - create basic definition
        families.push({
          family,
          name: `${family.toUpperCase()} Family`,
          description: `Instance family ${family}`,
          category: 'general',
          processor: 'intel',
          generation: 1,
          instances,
          spotAvailable: true,
        })
      }
    })

    return families.sort((a, b) => {
      // Sort by category first, then by generation, then by family name
      if (a.category !== b.category) {
        const categoryOrder = [
          'general',
          'compute',
          'memory',
          'storage',
          'gpu',
          'ai-ml',
          'fpga',
        ]
        return (
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
        )
      }
      if (a.generation !== b.generation) {
        return b.generation - a.generation // Newer generations first
      }
      return a.family.localeCompare(b.family)
    })
  }

  /**
   * Get families suitable for spot instances
   */
  static getSpotEligibleFamilies(families: InstanceFamily[]): InstanceFamily[] {
    return families.filter(family => family.spotAvailable)
  }

  /**
   * Get families by category
   */
  static getFamiliesByCategory(
    families: InstanceFamily[],
    category: InstanceFamily['category']
  ): InstanceFamily[] {
    return families.filter(family => family.category === category)
  }

  /**
   * Get families by processor type
   */
  static getFamiliesByProcessor(
    families: InstanceFamily[],
    processor: InstanceFamily['processor']
  ): InstanceFamily[] {
    return families.filter(family => family.processor === processor)
  }

  /**
   * Get instance family information
   */
  static getInstanceFamilyInfo(
    instanceType: string
  ): Omit<InstanceFamily, 'instances'> | null {
    const family = instanceType.split('.')[0]
    return INSTANCE_FAMILIES[family] || null
  }
}
