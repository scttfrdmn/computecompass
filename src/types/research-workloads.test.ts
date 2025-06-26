import { describe, it, expect } from 'vitest'
import { RESEARCH_WORKLOADS } from './research-workloads'

describe('Research Workloads', () => {
  it('should have valid workload definitions', () => {
    expect(RESEARCH_WORKLOADS).toBeDefined()
    expect(RESEARCH_WORKLOADS.length).toBeGreaterThan(0)
  })

  it('should have unique workload IDs', () => {
    const ids = RESEARCH_WORKLOADS.map(w => w.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have valid categories', () => {
    const validCategories = [
      'genomics',
      'climate',
      'ml',
      'physics',
      'chemistry',
      'engineering',
    ]

    RESEARCH_WORKLOADS.forEach(workload => {
      expect(validCategories).toContain(workload.category)
    })
  })

  it('should have minimum compute requirements', () => {
    RESEARCH_WORKLOADS.forEach(workload => {
      if (workload.requirements.minVCpus) {
        expect(workload.requirements.minVCpus).toBeGreaterThan(0)
      }
      if (workload.requirements.minMemoryGiB) {
        expect(workload.requirements.minMemoryGiB).toBeGreaterThan(0)
      }
      if (workload.requirements.minGpuMemoryGiB) {
        expect(workload.requirements.minGpuMemoryGiB).toBeGreaterThan(0)
      }
    })
  })

  it('should have logical memory ranges', () => {
    RESEARCH_WORKLOADS.forEach(workload => {
      const { minMemoryGiB, maxMemoryGiB } = workload.requirements
      if (minMemoryGiB && maxMemoryGiB) {
        expect(maxMemoryGiB).toBeGreaterThanOrEqual(minMemoryGiB)
      }
    })
  })

  it('should have logical vCPU ranges', () => {
    RESEARCH_WORKLOADS.forEach(workload => {
      const { minVCpus, maxVCpus } = workload.requirements
      if (minVCpus && maxVCpus) {
        expect(maxVCpus).toBeGreaterThanOrEqual(minVCpus)
      }
    })
  })

  it('should have valid runtime estimates when provided', () => {
    RESEARCH_WORKLOADS.forEach(workload => {
      if (workload.estimatedRuntime) {
        expect(workload.estimatedRuntime.min).toBeGreaterThan(0)
        expect(workload.estimatedRuntime.max).toBeGreaterThanOrEqual(
          workload.estimatedRuntime.min
        )
        expect(['hours', 'days', 'weeks']).toContain(
          workload.estimatedRuntime.unit
        )
      }
    })
  })
})
