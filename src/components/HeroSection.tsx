import {
  MagnifyingGlassIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

export function HeroSection() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Find Your Perfect AWS Instance
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Intelligent instance recommendations for research computing workloads.
        Get optimized suggestions based on your performance needs and budget
        constraints.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Smart Matching
          </h3>
          <p className="text-gray-600 text-sm">
            Advanced algorithms match your workload requirements to optimal AWS
            instance types
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CpuChipIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Research Optimized
          </h3>
          <p className="text-gray-600 text-sm">
            Pre-configured templates for genomics, ML, climate modeling, and
            more research domains
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cost Efficient
          </h3>
          <p className="text-gray-600 text-sm">
            Compare on-demand, reserved, and spot pricing to optimize your
            compute budget
          </p>
        </div>
      </div>
    </div>
  )
}
