import { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'
import type { ComputeRequirements } from '../types'

interface ComputeRequirementsProps {
  requirements: ComputeRequirements
  onChange: (requirements: ComputeRequirements) => void
  className?: string
}

export function ComputeRequirementsComponent({
  requirements,
  onChange,
  className = '',
}: ComputeRequirementsProps) {
  const [localRequirements, setLocalRequirements] =
    useState<ComputeRequirements>(requirements)

  // Update parent when local state changes
  useEffect(() => {
    onChange(localRequirements)
  }, [localRequirements, onChange])

  const updateRequirement = (
    field: keyof ComputeRequirements,
    value: string | number | boolean
  ) => {
    setLocalRequirements(prev => ({ ...prev, [field]: value }))
  }

  const networkPerformanceOptions = [
    'Low',
    'Low to Moderate',
    'Moderate',
    'High',
    'Up to 10 Gigabit',
    'Up to 25 Gigabit',
    'Up to 50 Gigabit',
    '100 Gigabit',
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Compute Requirements
        </h3>

        {/* CPU Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="min-vcpus"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Minimum vCPUs
            </label>
            <input
              id="min-vcpus"
              type="number"
              min="1"
              max="448"
              value={localRequirements.minVCpus || ''}
              onChange={e =>
                updateRequirement(
                  'minVCpus',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., 4"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum number of virtual CPU cores needed
            </p>
          </div>

          <div>
            <label
              htmlFor="max-vcpus"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Maximum vCPUs
            </label>
            <input
              id="max-vcpus"
              type="number"
              min={localRequirements.minVCpus || 1}
              max="448"
              value={localRequirements.maxVCpus || ''}
              onChange={e =>
                updateRequirement(
                  'maxVCpus',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., 16"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum vCPUs to consider (optional)
            </p>
          </div>
        </div>

        {/* Memory Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="min-memory"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Minimum Memory (GiB)
            </label>
            <input
              id="min-memory"
              type="number"
              min="0.5"
              step="0.5"
              max="24576"
              value={localRequirements.minMemoryGiB || ''}
              onChange={e =>
                updateRequirement(
                  'minMemoryGiB',
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., 8"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum RAM in gibibytes (GiB)
            </p>
          </div>

          <div>
            <label
              htmlFor="max-memory"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Maximum Memory (GiB)
            </label>
            <input
              id="max-memory"
              type="number"
              min={localRequirements.minMemoryGiB || 0.5}
              step="0.5"
              max="24576"
              value={localRequirements.maxMemoryGiB || ''}
              onChange={e =>
                updateRequirement(
                  'maxMemoryGiB',
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., 64"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum memory to consider (optional)
            </p>
          </div>
        </div>

        {/* GPU Requirements */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label
                htmlFor="gpu-required"
                className="text-sm font-medium text-gray-700"
              >
                GPU Required
              </label>
              <p className="text-xs text-gray-500">
                Enable for machine learning, scientific computing, or graphics
                workloads
              </p>
            </div>
            <Switch
              id="gpu-required"
              checked={localRequirements.requireGpu || false}
              onChange={checked => updateRequirement('requireGpu', checked)}
              className={`${
                localRequirements.requireGpu ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span className="sr-only">GPU Required</span>
              <span
                className={`${
                  localRequirements.requireGpu
                    ? 'translate-x-6'
                    : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          {localRequirements.requireGpu && (
            <div className="ml-4 border-l-2 border-primary-100 pl-4">
              <label
                htmlFor="min-gpu-memory"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Minimum GPU Memory (GiB)
              </label>
              <input
                id="min-gpu-memory"
                type="number"
                min="1"
                max="80"
                value={localRequirements.minGpuMemoryGiB || ''}
                onChange={e =>
                  updateRequirement(
                    'minGpuMemoryGiB',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., 8"
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum GPU VRAM needed (GiB)
              </p>
            </div>
          )}
        </div>

        {/* Architecture */}
        <div className="mb-6">
          <label
            htmlFor="architecture"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Processor Architecture
          </label>
          <select
            id="architecture"
            value={localRequirements.architecture || ''}
            onChange={e =>
              updateRequirement('architecture', e.target.value || undefined)
            }
            className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Any Architecture</option>
            <option value="x86_64">x86_64 (Intel/AMD)</option>
            <option value="arm64">ARM64 (AWS Graviton)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose x86_64 for maximum compatibility, ARM64 for cost efficiency
          </p>
        </div>

        {/* Network Performance */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Network Performance
          </label>
          <div className="space-y-2">
            {networkPerformanceOptions.map(option => {
              const isSelected =
                localRequirements.networkPerformance?.includes(option) || false
              return (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => {
                      const current = localRequirements.networkPerformance || []
                      if (e.target.checked) {
                        updateRequirement('networkPerformance', [
                          ...current,
                          option,
                        ])
                      } else {
                        updateRequirement(
                          'networkPerformance',
                          current.filter(p => p !== option)
                        )
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Select network performance levels needed for your workload
          </p>
        </div>

        {/* Storage Type */}
        <div className="mb-6">
          <label
            htmlFor="storage-type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Storage Type
          </label>
          <select
            id="storage-type"
            value={localRequirements.storageType || 'any'}
            onChange={e =>
              updateRequirement(
                'storageType',
                e.target.value as 'ebs' | 'instance' | 'any'
              )
            }
            className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="any">Any Storage Type</option>
            <option value="ebs">EBS Only (Network Storage)</option>
            <option value="instance">Instance Store (Local NVMe)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            EBS for persistence, Instance Store for high I/O performance
          </p>
        </div>

        {/* Requirements Summary */}
        {(localRequirements.minVCpus ||
          localRequirements.minMemoryGiB ||
          localRequirements.requireGpu) && (
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <h4 className="text-sm font-medium text-primary-900 mb-2">
              Requirements Summary
            </h4>
            <div className="space-y-1 text-sm text-primary-800">
              {localRequirements.minVCpus && (
                <div>
                  vCPUs: {localRequirements.minVCpus}
                  {localRequirements.maxVCpus &&
                    ` - ${localRequirements.maxVCpus}`}
                </div>
              )}
              {localRequirements.minMemoryGiB && (
                <div>
                  Memory: {localRequirements.minMemoryGiB} GiB
                  {localRequirements.maxMemoryGiB &&
                    ` - ${localRequirements.maxMemoryGiB} GiB`}
                </div>
              )}
              {localRequirements.requireGpu && (
                <div>
                  GPU Required
                  {localRequirements.minGpuMemoryGiB &&
                    ` (${localRequirements.minGpuMemoryGiB} GiB VRAM)`}
                </div>
              )}
              {localRequirements.architecture && (
                <div>Architecture: {localRequirements.architecture}</div>
              )}
              {localRequirements.networkPerformance &&
                localRequirements.networkPerformance.length > 0 && (
                  <div>
                    Network: {localRequirements.networkPerformance.join(', ')}
                  </div>
                )}
              {localRequirements.storageType &&
                localRequirements.storageType !== 'any' && (
                  <div>
                    Storage: {localRequirements.storageType.toUpperCase()}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
