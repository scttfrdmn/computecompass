import { useState } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import type { OptimizationResult, PurchaseStrategy } from '../types/consumption'

interface ConsumptionPlanVisualizationProps {
  optimization: OptimizationResult
  className?: string
}

export function ConsumptionPlanVisualization({
  optimization,
  className = '',
}: ConsumptionPlanVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'strategies' | 'analysis'>('overview')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPurchaseTypeColor = (type: string) => {
    switch (type) {
      case 'reserved': return 'bg-blue-100 text-blue-800'
      case 'spot': return 'bg-green-100 text-green-800'
      case 'on-demand': return 'bg-orange-100 text-orange-800'
      case 'savings-plan': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Cost Savings Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cost Optimization Results</h3>
            <p className="text-sm text-gray-600">Compared to all on-demand pricing</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(optimization.costSavings.monthlySavings)}
            </div>
            <div className="text-sm text-gray-600">Monthly Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(optimization.costSavings.annualSavings)}
            </div>
            <div className="text-sm text-gray-600">Annual Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(optimization.costSavings.savingsPercentage)}
            </div>
            <div className="text-sm text-gray-600">Cost Reduction</div>
          </div>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Strategy Composition</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(optimization.optimizationMetrics.purchaseTypeDistribution).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPurchaseTypeColor(type)}`}>
                {type.replace('-', ' ')}
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500">strategies</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(optimization.riskAssessment.overall)}`}>
              {optimization.riskAssessment.overall.toUpperCase()}
            </div>
            <div className="mt-2 text-sm text-gray-600">Overall Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatPercentage(optimization.riskAssessment.spotInterruption * 100)}
            </div>
            <div className="text-sm text-gray-600">Spot Interruption Risk</div>
          </div>
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(optimization.riskAssessment.costVariability)}`}>
              {optimization.riskAssessment.costVariability.toUpperCase()}
            </div>
            <div className="mt-2 text-sm text-gray-600">Cost Variability</div>
          </div>
        </div>
      </div>

      {/* Confidence Level */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recommendation Confidence</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${optimization.confidenceLevel}%` }}
            />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {optimization.confidenceLevel}%
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Based on workload analysis and historical patterns
        </p>
      </div>
    </div>
  )

  const renderStrategies = () => (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimal Purchase Strategies</h3>
        
        <div className="space-y-4">
          {optimization.optimalStrategy.map((strategy) => (
            <div key={strategy.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getPurchaseTypeColor(strategy.purchaseType)}`}>
                      {strategy.purchaseType.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                      {strategy.riskLevel} risk
                    </span>
                    {strategy.commitment && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <CalendarDaysIcon className="h-3 w-3 mr-1" />
                        {strategy.commitment}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{strategy.instanceType}</h4>
                  <p className="text-sm text-gray-600 mb-2">{strategy.purpose}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <div className="font-medium">{strategy.quantity || 'Dynamic'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Hourly Cost:</span>
                      <div className="font-medium">${strategy.hourlyCost.toFixed(3)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Monthly Cost:</span>
                      <div className="font-medium">{formatCurrency(strategy.monthlyCost)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Utilization:</span>
                      <div className="font-medium">{strategy.estimatedUtilization}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Scenarios */}
      {optimization.alternativeScenarios.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alternative Scenarios</h3>
          <p className="text-sm text-gray-600 mb-4">
            Consider these alternatives based on different risk tolerances and requirements
          </p>
          
          <div className="space-y-3">
            {optimization.alternativeScenarios.map((scenario, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Scenario {index + 1}</h4>
                    <div className="flex gap-2 mt-1">
                      {[...new Set(scenario.map(s => s.purchaseType))].map(type => (
                        <span key={type} className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getPurchaseTypeColor(type)}`}>
                          {type.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {scenario.length} strategies
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {optimization.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
              </div>
              <p className="text-sm text-green-800">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Optimization Metrics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Strategy Distribution</h4>
            <div className="space-y-2">
              {Object.entries(optimization.optimizationMetrics.purchaseTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{type.replace('-', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Risk Distribution</h4>
            <div className="space-y-2">
              {Object.entries(optimization.optimizationMetrics.riskDistribution).map(([risk, count]) => (
                <div key={risk} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{risk} Risk</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-600">Average Utilization</span>
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(optimization.optimizationMetrics.averageUtilization)}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Strategies</span>
              <div className="text-2xl font-bold text-gray-900">
                {optimization.optimizationMetrics.strategiesCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Implementation Timeline</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <h4 className="font-medium text-gray-900">Immediate Actions</h4>
              <p className="text-sm text-gray-600">Set up spot instance strategies and configure auto-scaling</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <h4 className="font-medium text-gray-900">Short Term (1-2 weeks)</h4>
              <p className="text-sm text-gray-600">Purchase Reserved Instances and configure Savings Plans</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <h4 className="font-medium text-gray-900">Long Term (1+ months)</h4>
              <p className="text-sm text-gray-600">Monitor performance and adjust strategies based on usage patterns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: ChartBarIcon },
    { id: 'strategies' as const, name: 'Strategies', icon: CurrencyDollarIcon },
    { id: 'analysis' as const, name: 'Analysis', icon: InformationCircleIcon },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Consumption Plan Optimization</h2>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered cost optimization for research computing workloads
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowTrendingDownIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">
              {formatPercentage(optimization.costSavings.savingsPercentage)} savings
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'strategies' && renderStrategies()}
        {activeTab === 'analysis' && renderAnalysis()}
      </div>
    </div>
  )
}