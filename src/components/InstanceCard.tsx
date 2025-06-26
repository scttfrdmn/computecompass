import type { InstanceMatch } from '../types'
import type {
  InstanceBenchmarkData,
  PerformanceInsight,
} from '../services/benchmark-data'
import { HardwareSpecsService } from '../services/hardware-specs'
import { PricingCard } from './PricingCard'

interface InstanceCardProps {
  instance: InstanceMatch
  rank: number
  benchmarkData?: InstanceBenchmarkData
  performanceInsights?: PerformanceInsight[]
}

export function InstanceCard({
  instance,
  rank,
  benchmarkData,
  performanceInsights,
}: InstanceCardProps) {
  const formatPrice = (price: number) =>
    price > 0 ? `$${price.toFixed(4)}` : 'N/A'

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header with instance type and ranking */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {instance.instance.InstanceType}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">Rank #{rank}</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Score: {instance.matchScore}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-primary-600">
            {formatPrice(instance.pricing.onDemand)}/hr
          </p>
          <p className="text-sm text-gray-500">On-Demand</p>
        </div>
      </div>

      {/* Core specifications */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">vCPUs:</span>{' '}
          <span className="font-medium">
            {instance.instance.VCpuInfo?.DefaultVCpus || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Memory:</span>{' '}
          <span className="font-medium">
            {instance.instance.MemoryInfo?.SizeInMiB
              ? `${Math.round(instance.instance.MemoryInfo.SizeInMiB / 1024)} GiB`
              : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Network:</span>{' '}
          <span className="font-medium">
            {instance.instance.NetworkInfo?.NetworkPerformance || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Storage:</span>{' '}
          <span className="font-medium">
            {instance.instance.InstanceStorageInfo?.TotalSizeInGB
              ? `${instance.instance.InstanceStorageInfo.TotalSizeInGB} GB`
              : 'EBS Only'}
          </span>
        </div>
      </div>

      {/* Comprehensive pricing display */}
      <PricingCard pricing={instance.pricing} className="mb-4" />

      {/* Enhanced hardware specifications */}
      {instance.instance.ProcessorInfo && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="font-medium text-gray-700 mb-1">Processor</div>
          <div className="text-sm text-gray-600 mb-1">
            {HardwareSpecsService.getProcessorSummary(
              instance.instance.ProcessorInfo
            )}
          </div>
          {instance.instance.ProcessorInfo.Features && (
            <div className="text-xs text-gray-500">
              Features:{' '}
              {instance.instance.ProcessorInfo.Features.slice(0, 3).join(', ')}
              {instance.instance.ProcessorInfo.Features.length > 3 && '...'}
            </div>
          )}
        </div>
      )}

      {/* Memory specifications */}
      {instance.instance.MemoryInfo && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="font-medium text-gray-700 mb-1">Memory</div>
          <div className="text-sm text-gray-600">
            {HardwareSpecsService.getMemorySummary(
              instance.instance.MemoryInfo
            )}
          </div>
        </div>
      )}

      {/* GPU specifications */}
      {instance.instance.GpuInfo &&
        instance.instance.GpuInfo.Gpus &&
        instance.instance.GpuInfo.Gpus.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mb-3">
            <div className="font-medium text-gray-700 mb-1">GPU</div>
            {instance.instance.GpuInfo.Gpus.map((gpu, gpuIndex) => (
              <div key={gpuIndex} className="text-sm">
                <div className="text-gray-600 mb-1">
                  {gpu.Count}x {HardwareSpecsService.getGpuSummary(gpu)}
                </div>
                {gpu.MemoryInfo?.SizeInMiB && (
                  <div className="text-gray-500 text-xs">
                    {Math.round(gpu.MemoryInfo.SizeInMiB / 1024)} GB{' '}
                    {gpu.MemoryInfo.Type || 'VRAM'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Performance benchmark data */}
      {benchmarkData && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="font-medium text-gray-700 mb-2">
            Performance Benchmarks
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {benchmarkData.memory && (
              <div>
                <div className="text-gray-600 font-medium">
                  Memory Bandwidth
                </div>
                <div className="text-gray-500">
                  {benchmarkData.memory.stream.triad.bandwidth} GB/s
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Latency: {benchmarkData.memory.cache.memory.latency} ns
                </div>
              </div>
            )}

            {benchmarkData.cpu && (
              <div>
                <div className="text-gray-600 font-medium">CPU Performance</div>
                <div className="text-gray-500">
                  {benchmarkData.cpu.linpack.gflops.toFixed(1)} GFLOPS
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  CoreMark: {benchmarkData.cpu.coremark.score}
                </div>
              </div>
            )}

            {benchmarkData.pricing && (
              <div className="col-span-2">
                <div className="text-gray-600 font-medium">Cost Efficiency</div>
                <div className="text-gray-500">
                  $
                  {benchmarkData.pricing.costEfficiency.costPerGflop.toFixed(4)}
                  /GFLOP
                </div>
                {benchmarkData.pricing.spot.reliability > 0.95 && (
                  <div className="text-xs text-green-600 mt-1">
                    High spot reliability (
                    {(benchmarkData.pricing.spot.reliability * 100).toFixed(1)}
                    %)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance insights */}
      {performanceInsights && performanceInsights.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <div className="font-medium text-gray-700 mb-2">
            Performance Insights
          </div>
          <div className="space-y-2">
            {performanceInsights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  insight.severity === 'recommendation'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : insight.severity === 'warning'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    {insight.severity === 'recommendation'
                      ? '✓'
                      : insight.severity === 'warning'
                        ? '⚠'
                        : 'ℹ'}
                  </div>
                  <div className="text-xs leading-4">{insight.message}</div>
                </div>
              </div>
            ))}
            {performanceInsights.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{performanceInsights.length - 3} more insights
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match reasons */}
      {instance.matchReasons && instance.matchReasons.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="font-medium text-gray-700 mb-2">
            Why This Instance?
          </div>
          <div className="space-y-1">
            {instance.matchReasons.slice(0, 2).map((reason, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 flex items-start"
              >
                <span className="text-primary-500 mr-1">•</span>
                {reason}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
