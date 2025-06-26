import { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'
import type { WorkloadPattern, SeasonalPattern } from '../types/consumption'

interface WorkloadPatternInputProps {
  pattern: WorkloadPattern
  onChange: (pattern: WorkloadPattern) => void
  className?: string
}

export function WorkloadPatternInput({
  pattern,
  onChange,
  className = '',
}: WorkloadPatternInputProps) {
  const [localPattern, setLocalPattern] = useState<WorkloadPattern>(pattern)

  useEffect(() => {
    onChange(localPattern)
  }, [localPattern, onChange])

  const updatePattern = (field: keyof WorkloadPattern, value: any) => {
    setLocalPattern(prev => ({ ...prev, [field]: value }))
  }

  const updateSeasonality = (field: keyof SeasonalPattern, value: any) => {
    setLocalPattern(prev => ({
      ...prev,
      seasonality: { ...prev.seasonality, [field]: value },
    }))
  }

  const seasonalityTypes = [
    { value: 'steady', label: 'Steady', description: 'Consistent usage year-round' },
    { value: 'academic', label: 'Academic Calendar', description: 'Peaks during semesters' },
    { value: 'grant-based', label: 'Grant Cycles', description: 'Peaks at fiscal year end' },
    { value: 'seasonal', label: 'Seasonal Research', description: 'Custom seasonal pattern' },
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', description: 'Can wait for cheaper spot instances' },
    { value: 'normal', label: 'Normal', description: 'Balance cost and availability' },
    { value: 'high', label: 'High', description: 'Need guaranteed capacity' },
    { value: 'critical', label: 'Critical', description: 'Mission-critical workloads' },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Workload Pattern Configuration
        </h3>

        {/* Basic Pattern Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="workload-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Workload Name
            </label>
            <input
              id="workload-name"
              type="text"
              value={localPattern.name}
              onChange={e => updatePattern('name', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., ML Training Pipeline"
            />
          </div>

          <div>
            <label
              htmlFor="workload-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <input
              id="workload-description"
              type="text"
              value={localPattern.description}
              onChange={e => updatePattern('description', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Brief description of this workload"
            />
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label
              htmlFor="runs-per-day"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Runs per Day
            </label>
            <input
              id="runs-per-day"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={localPattern.runsPerDay}
              onChange={e =>
                updatePattern('runsPerDay', parseFloat(e.target.value) || 0)
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Average number of job runs per day
            </p>
          </div>

          <div>
            <label
              htmlFor="avg-duration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Avg Duration (hours)
            </label>
            <input
              id="avg-duration"
              type="number"
              min="0.1"
              max="168"
              step="0.5"
              value={localPattern.avgDurationHours}
              onChange={e =>
                updatePattern('avgDurationHours', parseFloat(e.target.value) || 0)
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Average runtime per job
            </p>
          </div>

          <div>
            <label
              htmlFor="days-per-week"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Days per Week
            </label>
            <input
              id="days-per-week"
              type="number"
              min="1"
              max="7"
              value={localPattern.daysPerWeek}
              onChange={e =>
                updatePattern('daysPerWeek', parseInt(e.target.value) || 1)
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Active days per week
            </p>
          </div>
        </div>

        {/* Seasonality Configuration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seasonality Pattern
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {seasonalityTypes.map(type => (
              <div key={type.value} className="relative">
                <input
                  type="radio"
                  id={`seasonality-${type.value}`}
                  name="seasonality-type"
                  value={type.value}
                  checked={localPattern.seasonality.type === type.value}
                  onChange={e => updateSeasonality('type', e.target.value)}
                  className="sr-only peer"
                />
                <label
                  htmlFor={`seasonality-${type.value}`}
                  className="flex p-3 bg-white border border-gray-300 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:ring-2 peer-checked:ring-primary-500 hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {type.description}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Setting */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Workload Priority
          </label>
          <select
            value={localPattern.priority}
            onChange={e => updatePattern('priority', e.target.value)}
            className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            {priorityLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label} - {level.description}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="interruptible"
                className="text-sm font-medium text-gray-700"
              >
                Interruptible Workload
              </label>
              <p className="text-xs text-gray-500">
                Can use spot instances (may be interrupted)
              </p>
            </div>
            <Switch
              id="interruptible"
              checked={localPattern.interruptible || false}
              onChange={checked => updatePattern('interruptible', checked)}
              className={`${
                localPattern.interruptible ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Enable spot instances</span>
              <span
                className={`${
                  localPattern.interruptible ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>

        {/* Pattern Summary */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Pattern Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Daily Hours:</span>
              <div className="font-medium">
                {(localPattern.runsPerDay * localPattern.avgDurationHours).toFixed(1)}h
              </div>
            </div>
            <div>
              <span className="text-gray-500">Weekly Hours:</span>
              <div className="font-medium">
                {(
                  localPattern.runsPerDay *
                  localPattern.avgDurationHours *
                  localPattern.daysPerWeek
                ).toFixed(1)}h
              </div>
            </div>
            <div>
              <span className="text-gray-500">Seasonality:</span>
              <div className="font-medium capitalize">
                {localPattern.seasonality.type}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Priority:</span>
              <div className="font-medium capitalize">
                {localPattern.priority}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}