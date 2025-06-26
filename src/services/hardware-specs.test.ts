import { describe, it, expect } from 'vitest'
import {
  HardwareSpecsService,
  PROCESSOR_SPECS,
  MEMORY_SPECS,
  GPU_SPECS,
  INSTANCE_FAMILIES,
} from './hardware-specs'
import type { ProcessorInfo, MemoryInfo, GpuInfo, InstanceType } from '../types'

describe('HardwareSpecsService', () => {
  describe('enhanceProcessorInfo', () => {
    it('should enhance Intel Xeon processor info', () => {
      const baseInfo: ProcessorInfo = {
        SupportedArchitectures: ['x86_64'],
        SustainedClockSpeedInGhz: 3.1,
      }

      const enhanced = HardwareSpecsService.enhanceProcessorInfo(
        'Intel Xeon Platinum 8259CL',
        baseInfo
      )

      expect(enhanced.Manufacturer).toBe('Intel')
      expect(enhanced.Family).toBe('Xeon Platinum')
      expect(enhanced.Model).toBe('8259CL')
      expect(enhanced.Generation).toBe('Cascade Lake')
      expect(enhanced.CodeName).toBe('Cascade Lake')
      expect(enhanced.Features).toContain('AVX-512')
    })

    it('should enhance AMD EPYC processor info', () => {
      const baseInfo: ProcessorInfo = {
        SupportedArchitectures: ['x86_64'],
        SustainedClockSpeedInGhz: 2.8,
      }

      const enhanced = HardwareSpecsService.enhanceProcessorInfo(
        'AMD EPYC 7R32',
        baseInfo
      )

      expect(enhanced.Manufacturer).toBe('AMD')
      expect(enhanced.Family).toBe('EPYC')
      expect(enhanced.Model).toBe('7R32')
      expect(enhanced.Generation).toBe('Zen 2')
      expect(enhanced.CodeName).toBe('Rome')
    })

    it('should enhance AWS Graviton processor info', () => {
      const baseInfo: ProcessorInfo = {
        SupportedArchitectures: ['arm64'],
        SustainedClockSpeedInGhz: 2.5,
      }

      const enhanced = HardwareSpecsService.enhanceProcessorInfo(
        'AWS Graviton3',
        baseInfo
      )

      expect(enhanced.Manufacturer).toBe('AWS')
      expect(enhanced.Family).toBe('Graviton')
      expect(enhanced.Model).toBe('Graviton3')
      expect(enhanced.Generation).toBe('Graviton3')
      expect(enhanced.Features).toContain('DDR5')
    })
  })

  describe('enhanceMemoryInfo', () => {
    it('should enhance memory info for m7i instances', () => {
      const baseInfo: MemoryInfo = {
        SizeInMiB: 16384,
      }

      const enhanced = HardwareSpecsService.enhanceMemoryInfo(
        'm7i.large',
        baseInfo
      )

      expect(enhanced.Type).toBe('DDR5')
      expect(enhanced.Speed).toBe('4800 MHz')
      expect(enhanced.Channels).toBe(4)
      expect(enhanced.EccSupported).toBe(true)
    })

    it('should enhance memory info for t3 instances', () => {
      const baseInfo: MemoryInfo = {
        SizeInMiB: 2048,
      }

      const enhanced = HardwareSpecsService.enhanceMemoryInfo(
        't3.micro',
        baseInfo
      )

      expect(enhanced.Type).toBe('DDR4')
      expect(enhanced.Speed).toBe('2400 MHz')
      expect(enhanced.Channels).toBe(2)
      expect(enhanced.EccSupported).toBe(false)
    })

    it('should enhance memory info for FPGA instances', () => {
      const baseInfo: MemoryInfo = {
        SizeInMiB: 32768,
      }

      const enhanced = HardwareSpecsService.enhanceMemoryInfo(
        'f1.2xlarge',
        baseInfo
      )

      expect(enhanced.Type).toBe('DDR4')
      expect(enhanced.Speed).toBe('2133 MHz')
      expect(enhanced.EccSupported).toBe(true)
    })
  })

  describe('enhanceGpuInfo', () => {
    it('should enhance NVIDIA Tesla V100 GPU info', () => {
      const baseInfo: GpuInfo = {
        Name: 'Tesla V100',
        Manufacturer: 'NVIDIA',
        Count: 1,
        MemoryInfo: {
          SizeInMiB: 16384,
        },
      }

      const enhanced = HardwareSpecsService.enhanceGpuInfo(
        'Tesla V100',
        baseInfo
      )

      expect(enhanced.Model).toBe('Tesla V100')
      expect(enhanced.Generation).toBe('Volta')
      expect(enhanced.Architecture).toBe('Volta')
      expect(enhanced.ComputeCapability).toBe('7.0')
      expect(enhanced.Cores?.Cuda).toBe(5120)
      expect(enhanced.Cores?.Tensor).toBe(640)
      expect(enhanced.MemoryInfo?.Type).toBe('HBM2')
      expect(enhanced.Features).toContain('Tensor Cores')
    })

    it('should enhance AMD Radeon Pro V520 GPU info', () => {
      const baseInfo: GpuInfo = {
        Name: 'Radeon Pro V520',
        Manufacturer: 'AMD',
        Count: 1,
        MemoryInfo: {
          SizeInMiB: 8192,
        },
      }

      const enhanced = HardwareSpecsService.enhanceGpuInfo(
        'Radeon Pro V520',
        baseInfo
      )

      expect(enhanced.Model).toBe('Radeon Pro V520')
      expect(enhanced.Generation).toBe('RDNA2')
      expect(enhanced.Architecture).toBe('RDNA2')
      expect(enhanced.Cores?.Cuda).toBe(2560) // Stream processors
      expect(enhanced.MemoryInfo?.Type).toBe('GDDR6')
      expect(enhanced.Features).toContain('Hardware-accelerated Ray Tracing')
    })

    it('should enhance FPGA info', () => {
      const baseInfo: GpuInfo = {
        Name: 'Xilinx Alveo U280',
        Manufacturer: 'Xilinx',
        Count: 1,
        MemoryInfo: {
          SizeInMiB: 8192,
        },
      }

      const enhanced = HardwareSpecsService.enhanceGpuInfo(
        'Xilinx Alveo U280',
        baseInfo
      )

      expect(enhanced.Model).toBe('Alveo U280')
      expect(enhanced.Generation).toBe('UltraScale+')
      expect(enhanced.Architecture).toBe('UltraScale+')
      expect(enhanced.MemoryInfo?.Type).toBe('HBM2')
      expect(enhanced.Features).toContain('FPGA')
      expect(enhanced.Features).toContain('AES/SHA Acceleration')
    })
  })

  describe('summary methods', () => {
    it('should generate processor summary', () => {
      const processorInfo: ProcessorInfo = {
        SupportedArchitectures: ['x86_64'],
        Manufacturer: 'Intel',
        Family: 'Xeon Platinum',
        Model: '8259CL',
        Generation: 'Cascade Lake',
      }

      const summary = HardwareSpecsService.getProcessorSummary(processorInfo)
      expect(summary).toBe('Intel Xeon Platinum 8259CL (Cascade Lake)')
    })

    it('should generate memory summary', () => {
      const memoryInfo: MemoryInfo = {
        SizeInMiB: 16384,
        Type: 'DDR5',
        Speed: '4800 MHz',
        EccSupported: true,
      }

      const summary = HardwareSpecsService.getMemorySummary(memoryInfo)
      expect(summary).toBe('DDR5 4800 MHz ECC')
    })

    it('should generate GPU summary', () => {
      const gpuInfo: GpuInfo = {
        Name: 'Tesla A100',
        Manufacturer: 'NVIDIA',
        Count: 1,
        Model: 'Tesla A100',
        Architecture: 'Ampere',
        MemoryInfo: {
          SizeInMiB: 40960,
        },
      }

      const summary = HardwareSpecsService.getGpuSummary(gpuInfo)
      expect(summary).toBe('NVIDIA Tesla A100 (Ampere)')
    })
  })

  describe('hardware database coverage', () => {
    it('should have comprehensive processor coverage', () => {
      expect(PROCESSOR_SPECS['Intel Xeon Platinum 8259CL']).toBeDefined()
      expect(PROCESSOR_SPECS['AMD EPYC 7R32']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Graviton3']).toBeDefined()
    })

    it('should have comprehensive memory type coverage', () => {
      expect(MEMORY_SPECS['m7i']).toBeDefined()
      expect(MEMORY_SPECS['c7a']).toBeDefined()
      expect(MEMORY_SPECS['r7g']).toBeDefined()
      expect(MEMORY_SPECS['f1']).toBeDefined() // FPGA
      expect(MEMORY_SPECS['g4ad']).toBeDefined() // AMD GPU
    })

    it('should have comprehensive GPU coverage', () => {
      // NVIDIA GPUs
      expect(GPU_SPECS['Tesla V100']).toBeDefined()
      expect(GPU_SPECS['Tesla A100']).toBeDefined()
      expect(GPU_SPECS['Tesla H100']).toBeDefined()

      // AMD GPUs
      expect(GPU_SPECS['Radeon Pro V520']).toBeDefined()
      expect(GPU_SPECS['Radeon Pro V620']).toBeDefined()

      // FPGAs
      expect(GPU_SPECS['Xilinx Alveo U280']).toBeDefined()
      expect(GPU_SPECS['Intel Stratix 10']).toBeDefined()
    })

    it('should have memory types for all supported DDR generations', () => {
      const memoryTypes = Object.values(MEMORY_SPECS).map(spec => spec.Type)
      expect(memoryTypes).toContain('DDR3')
      expect(memoryTypes).toContain('DDR4')
      expect(memoryTypes).toContain('DDR5')
    })

    it('should have GPU memory types for all major categories', () => {
      const gpuMemoryTypes = Object.values(GPU_SPECS)
        .map(spec => spec.MemoryInfo?.Type)
        .filter(Boolean)

      expect(gpuMemoryTypes).toContain('HBM2')
      expect(gpuMemoryTypes).toContain('HBM2e')
      expect(gpuMemoryTypes).toContain('HBM3')
      expect(gpuMemoryTypes).toContain('GDDR6')
      expect(gpuMemoryTypes).toContain('GDDR5')
    })

    it('should have comprehensive AWS processor coverage', () => {
      // All Graviton versions
      expect(PROCESSOR_SPECS['AWS Graviton']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Graviton2']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Graviton3']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Graviton3E']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Graviton4']).toBeDefined()

      // AI/ML processors
      expect(PROCESSOR_SPECS['AWS Inferentia']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Inferentia2']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Trainium']).toBeDefined()
      expect(PROCESSOR_SPECS['AWS Trainium2']).toBeDefined()
    })

    it('should have AI/ML instance memory specs', () => {
      expect(MEMORY_SPECS['inf1']).toBeDefined()
      expect(MEMORY_SPECS['inf2']).toBeDefined()
      expect(MEMORY_SPECS['trn1']).toBeDefined()
      expect(MEMORY_SPECS['trn2']).toBeDefined()
    })

    it('should have AI/ML accelerator specs', () => {
      expect(GPU_SPECS['AWS Inferentia']).toBeDefined()
      expect(GPU_SPECS['AWS Inferentia2']).toBeDefined()
      expect(GPU_SPECS['AWS Trainium']).toBeDefined()
      expect(GPU_SPECS['AWS Trainium2']).toBeDefined()
    })
  })

  describe('instance family grouping', () => {
    const mockInstances: InstanceType[] = [
      {
        InstanceType: 'm5.large',
        VCpuInfo: {
          DefaultVCpus: 2,
          DefaultCores: 1,
          DefaultThreadsPerCore: 2,
        },
        MemoryInfo: { SizeInMiB: 8192 },
      },
      {
        InstanceType: 'm5.xlarge',
        VCpuInfo: {
          DefaultVCpus: 4,
          DefaultCores: 2,
          DefaultThreadsPerCore: 2,
        },
        MemoryInfo: { SizeInMiB: 16384 },
      },
      {
        InstanceType: 'c6g.medium',
        VCpuInfo: {
          DefaultVCpus: 1,
          DefaultCores: 1,
          DefaultThreadsPerCore: 1,
        },
        MemoryInfo: { SizeInMiB: 2048 },
      },
      {
        InstanceType: 'inf1.xlarge',
        VCpuInfo: {
          DefaultVCpus: 4,
          DefaultCores: 2,
          DefaultThreadsPerCore: 2,
        },
        MemoryInfo: { SizeInMiB: 8192 },
      },
    ] as InstanceType[]

    it('should group instances by family', () => {
      const families =
        HardwareSpecsService.groupInstancesByFamily(mockInstances)

      expect(families.length).toBeGreaterThan(0)
      const m5Family = families.find(f => f.family === 'm5')
      expect(m5Family).toBeDefined()
      expect(m5Family?.instances).toHaveLength(2)
      expect(m5Family?.category).toBe('general')
      expect(m5Family?.processor).toBe('intel')
    })

    it('should sort instances within families by size', () => {
      const families =
        HardwareSpecsService.groupInstancesByFamily(mockInstances)
      const m5Family = families.find(f => f.family === 'm5')

      expect(m5Family?.instances[0].InstanceType).toBe('m5.large')
      expect(m5Family?.instances[1].InstanceType).toBe('m5.xlarge')
    })

    it('should identify spot-eligible families', () => {
      const families =
        HardwareSpecsService.groupInstancesByFamily(mockInstances)
      const spotFamilies =
        HardwareSpecsService.getSpotEligibleFamilies(families)

      expect(spotFamilies.length).toBeGreaterThan(0)
      spotFamilies.forEach(family => {
        expect(family.spotAvailable).toBe(true)
      })
    })

    it('should filter families by category', () => {
      const families =
        HardwareSpecsService.groupInstancesByFamily(mockInstances)
      const generalFamilies = HardwareSpecsService.getFamiliesByCategory(
        families,
        'general'
      )
      const aiMlFamilies = HardwareSpecsService.getFamiliesByCategory(
        families,
        'ai-ml'
      )

      expect(generalFamilies.length).toBeGreaterThan(0)
      expect(aiMlFamilies.length).toBeGreaterThan(0)

      generalFamilies.forEach(family => {
        expect(family.category).toBe('general')
      })
      aiMlFamilies.forEach(family => {
        expect(family.category).toBe('ai-ml')
      })
    })

    it('should filter families by processor type', () => {
      const families =
        HardwareSpecsService.groupInstancesByFamily(mockInstances)
      const gravitonFamilies = HardwareSpecsService.getFamiliesByProcessor(
        families,
        'graviton'
      )
      const inferenceFamilies = HardwareSpecsService.getFamiliesByProcessor(
        families,
        'inferentia'
      )

      expect(gravitonFamilies.length).toBeGreaterThan(0)
      expect(inferenceFamilies.length).toBeGreaterThan(0)

      gravitonFamilies.forEach(family => {
        expect(family.processor).toBe('graviton')
      })
      inferenceFamilies.forEach(family => {
        expect(family.processor).toBe('inferentia')
      })
    })

    it('should get instance family info', () => {
      const m5Info = HardwareSpecsService.getInstanceFamilyInfo('m5.large')
      const inf1Info = HardwareSpecsService.getInstanceFamilyInfo('inf1.xlarge')
      const trn1Info =
        HardwareSpecsService.getInstanceFamilyInfo('trn1.2xlarge')

      expect(m5Info?.family).toBe('m5')
      expect(m5Info?.category).toBe('general')
      expect(m5Info?.processor).toBe('intel')

      expect(inf1Info?.family).toBe('inf1')
      expect(inf1Info?.category).toBe('ai-ml')
      expect(inf1Info?.processor).toBe('inferentia')

      expect(trn1Info?.family).toBe('trn1')
      expect(trn1Info?.category).toBe('ai-ml')
      expect(trn1Info?.processor).toBe('trainium')
    })
  })

  describe('instance families database', () => {
    it('should have all major instance families defined', () => {
      // General purpose
      expect(INSTANCE_FAMILIES['m5']).toBeDefined()
      expect(INSTANCE_FAMILIES['m6g']).toBeDefined()
      expect(INSTANCE_FAMILIES['m7g']).toBeDefined()

      // Compute optimized
      expect(INSTANCE_FAMILIES['c5']).toBeDefined()
      expect(INSTANCE_FAMILIES['c6g']).toBeDefined()
      expect(INSTANCE_FAMILIES['c7g']).toBeDefined()
      expect(INSTANCE_FAMILIES['hpc7g']).toBeDefined()

      // AI/ML
      expect(INSTANCE_FAMILIES['inf1']).toBeDefined()
      expect(INSTANCE_FAMILIES['inf2']).toBeDefined()
      expect(INSTANCE_FAMILIES['trn1']).toBeDefined()
      expect(INSTANCE_FAMILIES['trn2']).toBeDefined()

      // GPU
      expect(INSTANCE_FAMILIES['p3']).toBeDefined()
      expect(INSTANCE_FAMILIES['g4dn']).toBeDefined()
      expect(INSTANCE_FAMILIES['g4ad']).toBeDefined()
    })

    it('should mark training instances as non-spot-available', () => {
      expect(INSTANCE_FAMILIES['trn1'].spotAvailable).toBe(false)
      expect(INSTANCE_FAMILIES['trn1n'].spotAvailable).toBe(false)
      expect(INSTANCE_FAMILIES['hpc7g'].spotAvailable).toBe(false)
      expect(INSTANCE_FAMILIES['p5'].spotAvailable).toBe(false)
    })

    it('should categorize instance families correctly', () => {
      expect(INSTANCE_FAMILIES['inf1'].category).toBe('ai-ml')
      expect(INSTANCE_FAMILIES['trn1'].category).toBe('ai-ml')
      expect(INSTANCE_FAMILIES['p3'].category).toBe('gpu')
      expect(INSTANCE_FAMILIES['f1'].category).toBe('fpga')
      expect(INSTANCE_FAMILIES['r5'].category).toBe('memory')
      expect(INSTANCE_FAMILIES['c5'].category).toBe('compute')
    })
  })
})
