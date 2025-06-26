import { useState } from 'react'
import {
  MainLayout,
  HeroSection,
  WorkloadSelector,
  InstanceCard,
  ErrorAlert,
} from './components'
import { ComputeRequirementsComponent } from './components/ComputeRequirements'
import type {
  ResearchWorkload,
  InstanceMatch,
  ComputeRequirements,
} from './types'
import { InstanceMatcher } from './services/instance-matcher'
import {
  BenchmarkDataService,
  type InstanceBenchmarkData,
  type PerformanceInsight,
} from './services/benchmark-data'

function App() {
  const [selectedWorkload, setSelectedWorkload] =
    useState<ResearchWorkload | null>(null)
  const [customRequirements, setCustomRequirements] =
    useState<ComputeRequirements>({})
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [matchedInstances, setMatchedInstances] = useState<InstanceMatch[]>([])
  const [benchmarkData, setBenchmarkData] = useState<
    Record<string, InstanceBenchmarkData>
  >({})
  const [performanceInsights, setPerformanceInsights] = useState<
    Record<string, PerformanceInsight[]>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const instanceMatcher = new InstanceMatcher()

  const handleWorkloadChange = (workload: ResearchWorkload | null) => {
    setSelectedWorkload(workload)
    setIsCustomMode(workload === null)
    if (workload) {
      // Clear custom requirements when selecting a predefined workload
      setCustomRequirements({})
    }
  }

  const handleFindInstances = async () => {
    if (!selectedWorkload && !isCustomMode) return

    setIsLoading(true)
    setError(null)

    try {
      let matches: InstanceMatch[]

      if (isCustomMode) {
        // Use custom requirements
        matches = await instanceMatcher.matchInstances(customRequirements)
      } else {
        // Use selected workload
        matches = await instanceMatcher.matchForWorkload(selectedWorkload!)
      }

      setMatchedInstances(matches)

      // Fetch benchmark data for top 5 instances
      const topInstances = matches.slice(0, 5)
      const benchmarkResults: Record<string, InstanceBenchmarkData> = {}
      const insightResults: Record<string, PerformanceInsight[]> = {}

      await Promise.all(
        topInstances.map(async instance => {
          try {
            const instanceType = instance.instance.InstanceType
            const benchmarks =
              await BenchmarkDataService.getInstanceBenchmarks(instanceType)

            if (benchmarks) {
              benchmarkResults[instanceType] = benchmarks
              insightResults[instanceType] =
                BenchmarkDataService.generatePerformanceInsights(
                  instanceType,
                  benchmarks,
                  isCustomMode ? 'Custom Workload' : selectedWorkload!.name
                )
            }
          } catch (err) {
            console.warn(
              `Failed to fetch benchmarks for ${instance.instance.InstanceType}:`,
              err
            )
          }
        })
      )

      setBenchmarkData(benchmarkResults)
      setPerformanceInsights(insightResults)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to find matching instances'
      )
      setMatchedInstances([])
      setBenchmarkData({})
      setPerformanceInsights({})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <HeroSection />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Workload Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Configure Your Workload
            </h2>

            <WorkloadSelector
              selectedWorkload={selectedWorkload}
              onWorkloadChange={handleWorkloadChange}
            />

            {isCustomMode && (
              <div className="mt-6">
                <ComputeRequirementsComponent
                  requirements={customRequirements}
                  onChange={setCustomRequirements}
                />
              </div>
            )}

            {(selectedWorkload || isCustomMode) && (
              <div className="mt-6">
                <button
                  onClick={handleFindInstances}
                  disabled={isLoading}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? 'Finding Instances...'
                    : 'Find Matching Instances'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recommended Instances
            </h2>

            <ErrorAlert
              error={error}
              showRetry
              showDismiss
              onRetry={handleFindInstances}
              onDismiss={() => setError(null)}
            />

            {isLoading ? (
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Finding matching instances...</p>
              </div>
            ) : matchedInstances.length > 0 ? (
              <div className="space-y-4">
                {matchedInstances.slice(0, 5).map((instance, index) => (
                  <InstanceCard
                    key={instance.instance.InstanceType}
                    instance={instance}
                    rank={index + 1}
                    benchmarkData={
                      benchmarkData[instance.instance.InstanceType]
                    }
                    performanceInsights={
                      performanceInsights[instance.instance.InstanceType]
                    }
                  />
                ))}

                {/* Show data source attribution */}
                <div className="mt-4 text-center text-sm text-gray-500">
                  Performance data powered by{' '}
                  <a
                    href="https://github.com/scttfrdmn/aws-instance-benchmarks"
                    className="text-primary-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    aws-instance-benchmarks
                  </a>
                </div>
              </div>
            ) : selectedWorkload || isCustomMode ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">
                  Click "Find Matching Instances" to see recommendations for:
                </p>
                <p className="font-medium text-gray-900">
                  {isCustomMode
                    ? 'Custom Requirements'
                    : selectedWorkload!.name}
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Select a research workload or configure custom requirements to
                  see instance recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default App
