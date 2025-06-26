import { describe, it, expect } from 'vitest'
import { WORKLOAD_TEMPLATES } from './workload-templates'

describe('Workload Templates', () => {
  it('should export workload templates array', () => {
    expect(WORKLOAD_TEMPLATES).toBeDefined()
    expect(Array.isArray(WORKLOAD_TEMPLATES)).toBe(true)
    expect(WORKLOAD_TEMPLATES.length).toBeGreaterThan(0)
  })

  it('should have valid genomics batch workload', () => {
    const genomicsBatch = WORKLOAD_TEMPLATES.find(w => w.id === 'genomics-batch')
    expect(genomicsBatch).toBeDefined()
    expect(genomicsBatch?.name).toBe('Genomics Batch Processing')
    expect(genomicsBatch?.category).toBe('batch-computing')
  })

  it('should have consistent structure across all templates', () => {
    WORKLOAD_TEMPLATES.forEach(template => {
      expect(template.id).toBeDefined()
      expect(template.name).toBeDefined()
      expect(template.description).toBeDefined()
      expect(template.category).toBeDefined()
      expect(template.defaultPattern).toBeDefined()
      expect(template.defaultPattern.runsPerDay).toBeGreaterThan(0)
      expect(template.defaultPattern.avgDurationHours).toBeGreaterThan(0)
      expect(template.defaultPattern.daysPerWeek).toBeGreaterThan(0)
      expect(template.defaultPattern.instanceRequirements).toBeDefined()
    })
  })

  it('should have unique IDs for all templates', () => {
    const ids = WORKLOAD_TEMPLATES.map(w => w.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have valid categories', () => {
    const categories = WORKLOAD_TEMPLATES.map(t => t.category)
    const uniqueCategories = new Set(categories)
    expect(uniqueCategories.size).toBeGreaterThan(0)
    
    // Check that all categories are non-empty strings
    categories.forEach(category => {
      expect(typeof category).toBe('string')
      expect(category.length).toBeGreaterThan(0)
    })
  })
})