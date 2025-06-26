import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { RESEARCH_WORKLOADS } from '../types'
import type { ResearchWorkload } from '../types'

interface WorkloadSelectorProps {
  selectedWorkload: ResearchWorkload | null
  onWorkloadChange: (workload: ResearchWorkload | null) => void
}

const workloadCategories = {
  genomics: {
    name: 'Genomics & Bioinformatics',
    color: 'bg-green-100 text-green-800',
  },
  climate: {
    name: 'Climate & Earth Sciences',
    color: 'bg-blue-100 text-blue-800',
  },
  ml: { name: 'Machine Learning', color: 'bg-purple-100 text-purple-800' },
  physics: { name: 'Physics & Quantum', color: 'bg-red-100 text-red-800' },
  chemistry: {
    name: 'Chemistry & Materials',
    color: 'bg-yellow-100 text-yellow-800',
  },
  engineering: {
    name: 'Engineering & CFD',
    color: 'bg-indigo-100 text-indigo-800',
  },
}

export function WorkloadSelector({
  selectedWorkload,
  onWorkloadChange,
}: WorkloadSelectorProps) {
  const [selected, setSelected] = useState<ResearchWorkload | null>(
    selectedWorkload
  )

  const handleChange = (workload: ResearchWorkload | null) => {
    setSelected(workload)
    onWorkloadChange(workload)
  }

  return (
    <div className="w-full max-w-md">
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
            Research Workload Template
          </Listbox.Label>

          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm">
            <span className="block truncate">
              {selected ? (
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${workloadCategories[selected.category].color}`}
                  >
                    {workloadCategories[selected.category].name}
                  </span>
                  <span>{selected.name}</span>
                </div>
              ) : (
                <span className="text-gray-500">
                  Select a research workload...
                </span>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <Listbox.Option
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                  }`
                }
                value={null}
              >
                {({ selected: isSelected, active }) => (
                  <>
                    <span
                      className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}
                    >
                      Custom Requirements
                    </span>
                    {isSelected ? (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                          active ? 'text-primary-600' : 'text-primary-600'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>

              {Object.entries(
                RESEARCH_WORKLOADS.reduce(
                  (acc, workload) => {
                    if (!acc[workload.category]) {
                      acc[workload.category] = []
                    }
                    acc[workload.category].push(workload)
                    return acc
                  },
                  {} as Record<string, ResearchWorkload[]>
                )
              ).map(([category, workloads]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    {
                      workloadCategories[
                        category as keyof typeof workloadCategories
                      ].name
                    }
                  </div>
                  {workloads.map(workload => (
                    <Listbox.Option
                      key={workload.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-6 pr-9 ${
                          active
                            ? 'bg-primary-50 text-primary-900'
                            : 'text-gray-900'
                        }`
                      }
                      value={workload}
                    >
                      {({ selected: isSelected, active }) => (
                        <>
                          <div className="flex flex-col">
                            <span
                              className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}
                            >
                              {workload.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {workload.description}
                            </span>
                          </div>
                          {isSelected ? (
                            <span
                              className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                                active ? 'text-primary-600' : 'text-primary-600'
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </div>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {selected && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Workload Requirements
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            {selected.requirements.minVCpus && (
              <div>Minimum vCPUs: {selected.requirements.minVCpus}</div>
            )}
            {selected.requirements.minMemoryGiB && (
              <div>
                Minimum Memory: {selected.requirements.minMemoryGiB} GiB
              </div>
            )}
            {selected.requirements.requireGpu && (
              <div className="flex items-center space-x-1">
                <span>GPU Required</span>
                {selected.requirements.minGpuMemoryGiB && (
                  <span>
                    (min {selected.requirements.minGpuMemoryGiB} GiB VRAM)
                  </span>
                )}
              </div>
            )}
            {selected.requirements.architecture && (
              <div>Architecture: {selected.requirements.architecture}</div>
            )}
            {selected.estimatedRuntime && (
              <div>
                Runtime: {selected.estimatedRuntime.min}-
                {selected.estimatedRuntime.max} {selected.estimatedRuntime.unit}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
