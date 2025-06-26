# ComputeCompass 🧭

**Intelligent AWS Instance Selection and Consumption Planning for Research Computing**

ComputeCompass is a comprehensive web application that helps research institutions and computational scientists optimize their AWS infrastructure costs while maximizing performance. By combining real-time AWS pricing data, performance benchmarks, and intelligent consumption planning, ComputeCompass transforms complex infrastructure decisions into data-driven recommendations.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🚀 Live Demo

Visit [aws.computecompass.dev](https://aws.computecompass.dev) to try ComputeCompass with real AWS data.

## ✨ Key Features

### 🎯 Intelligent Instance Matching

- **Research-Focused Workload Templates**: Pre-configured patterns for genomics, climate modeling, ML training, bioinformatics, and more
- **Multi-Criteria Scoring**: Balances performance (40%), cost (40%), and efficiency (20%) for optimal recommendations
- **Hardware-Aware Selection**: Deep integration with processor specifications, memory types, and GPU capabilities
- **Real-time AWS Integration**: Live pricing and availability data from EC2, Pricing, and Spot APIs

### 💰 Comprehensive Pricing Intelligence

- **All Purchase Models**: On-Demand, Reserved Instances (1yr/3yr), Spot, and Savings Plans with time variations
- **Smart Cost Analysis**: Automatic savings calculations with confidence intervals
- **Visual Pricing Hierarchy**: Color-coded recommendations with "Cheapest" and "Flexible" badges
- **Monthly Cost Projections**: Detailed cost breakdowns with usage estimates

### 📊 Performance-Driven Recommendations

- **Real Benchmark Integration**: STREAM memory benchmarks, LINPACK CPU tests, and NUMA analysis
- **Performance Insights Engine**: AI-powered analysis of bottlenecks and optimization opportunities
- **Hardware Specification Database**: Comprehensive processor, memory, and GPU specifications
- **Cost-Performance Optimization**: Price-per-GFLOP and efficiency metrics

### 🏗️ Strategic Consumption Planning

- **Workload Pattern Analysis**: Model usage frequency, seasonality, and burst capacity requirements
- **Mixed Purchase Strategy Optimization**: Intelligent blend of Reserved, Spot, and On-Demand capacity
- **Enterprise Discount Support**: EDP, PPA, and volume discount integration for institutional buyers
- **Risk Assessment**: Spot interruption, under-utilization, and over-commitment analysis

### 🔬 Research Computing Focus

- **Academic Calendar Awareness**: Seasonal usage patterns for semesters, grants, and conferences
- **Burst Capacity Modeling**: Handle variable research workloads with peak demand planning
- **Priority-Based Strategies**: Critical workloads get stable capacity, batch jobs leverage spot savings
- **Multi-Project Portfolio**: Optimize across diverse computational research needs

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ComputeCompass                          │
├─────────────────────┬─────────────────┬─────────────────────┤
│   Frontend (React)  │  Services Layer │   Data Sources      │
│                     │                 │                     │
│ • Instance Cards    │ • AWS Service   │ • EC2 API          │
│ • Pricing Display   │ • Matcher       │ • Pricing API      │
│ • Workload Selector │ • Planner       │ • Spot Prices      │
│ • Error Handling    │ • Benchmarks    │ • Hardware Specs   │
│ • Consumption UI    │ • Hardware      │ • Benchmark Data   │
└─────────────────────┴─────────────────┴─────────────────────┘
```

### Core Components

**Frontend Layer**

- **React 18 + TypeScript**: Modern, type-safe development with strict compilation
- **Tailwind CSS + Headless UI**: Responsive design with accessible components
- **Vite**: Lightning-fast development and optimized production builds

**Services Layer**

- **AWSService**: Real-time EC2, Pricing, and Spot API integration with intelligent caching
- **InstanceMatcher**: Multi-criteria scoring algorithm for optimal instance recommendations
- **ConsumptionPlannerService**: Strategic cost optimization across workload portfolios
- **BenchmarkDataService**: Performance data integration from aws-instance-benchmarks
- **HardwareSpecsService**: Comprehensive hardware specification enrichment

**Data Integration**

- **Live AWS APIs**: Real-time pricing and availability from multiple AWS services
- **Performance Benchmarks**: Open benchmark database with STREAM, LINPACK, and custom tests
- **Hardware Database**: Detailed specifications for Intel, AMD, AWS Graviton, Inferentia, and Trainium

## 🛠️ Getting Started

### Prerequisites

- **Node.js 18+**: Modern JavaScript runtime
- **npm**: Package manager (included with Node.js)
- **AWS CLI**: Configured with appropriate credentials for pricing API access

### Installation

```bash
# Clone the repository
git clone https://github.com/scttfrdmn/computecompass.git
cd computecompass

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### AWS Configuration

ComputeCompass requires AWS credentials for real-time pricing data:

```bash
# Configure AWS CLI (if not already done)
aws configure

# Verify access to required services
aws ec2 describe-instance-types --max-items 5
aws pricing get-products --service-code AmazonEC2 --max-items 1
```

**Required AWS Permissions:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstanceTypes",
        "ec2:DescribeSpotPriceHistory",
        "pricing:GetProducts"
      ],
      "Resource": "*"
    }
  ]
}
```

## 📚 Usage Guide

### 1. Basic Instance Selection

1. **Select Research Workload**: Choose from pre-configured templates or customize requirements
2. **Configure Parameters**: Adjust CPU, memory, storage, and GPU requirements
3. **Find Matching Instances**: Click to get ranked recommendations with real-time pricing
4. **Analyze Results**: Review detailed specifications, pricing options, and performance insights

### 2. Advanced Consumption Planning

1. **Define Workload Patterns**: Specify usage frequency, duration, and seasonality
2. **Set Planning Horizon**: Choose 1-year or 3-year optimization timeframe
3. **Configure Discounts**: Add EDP, PPA, and credit allocations (enterprise users)
4. **Generate Plan**: Receive strategic purchase recommendations with risk analysis

### 3. Performance Analysis

1. **Review Benchmark Data**: Examine STREAM memory and LINPACK CPU performance
2. **Analyze Cost Efficiency**: Compare price-per-GFLOP and bandwidth metrics
3. **Optimize for Workload**: Use performance insights for architecture decisions

## 🧪 Testing

ComputeCompass maintains comprehensive test coverage across unit, integration, and end-to-end scenarios:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run integration tests (requires AWS credentials)
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

**Testing Strategy:**

- **Unit Tests**: Service layer, algorithms, and component logic (85%+ coverage target)
- **Integration Tests**: Real AWS API calls with local credentials
- **E2E Tests**: Complete user workflows with Playwright
- **Performance Tests**: Benchmark data integration and scoring algorithms

## 🏗️ Development

### Project Structure

```
src/
├── components/          # React UI components
│   ├── ErrorAlert.tsx   # Error handling with contextual help
│   ├── InstanceCard.tsx # Instance details with pricing
│   ├── PricingCard.tsx  # Comprehensive pricing display
│   └── WorkloadSelector.tsx
├── services/            # Business logic and API integration
│   ├── aws-service.ts   # AWS API integration
│   ├── instance-matcher.ts # Scoring algorithm
│   ├── consumption-planner.ts # Cost optimization
│   ├── benchmark-data.ts # Performance integration
│   └── hardware-specs.ts # Hardware enrichment
├── types/               # TypeScript definitions
│   ├── aws.ts          # AWS API types
│   └── consumption.ts  # Consumption planning types
├── data/               # Static data and templates
│   └── workload-templates.ts # Research workload patterns
└── tests/              # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run all quality checks
npm run ci

# Format code
npm run format
```

### Contributing Guidelines

1. **Code Quality**: All contributions must pass TypeScript strict mode, ESLint, and Prettier
2. **Testing**: New features require corresponding tests with 85%+ coverage
3. **Documentation**: Update README and inline documentation for API changes
4. **Performance**: Benchmark any changes affecting AWS API calls or scoring algorithms

## 🎯 Research Workload Templates

ComputeCompass includes expertly-crafted templates for common research computing patterns:

### Batch Computing

- **Genomics Analysis**: Sequence processing with burst capacity for deadlines
- **Climate Modeling**: Long-running simulations with MPI networking requirements
- **Bioinformatics**: Memory-optimized workflows for large biological datasets

### Machine Learning

- **Deep Learning Training**: GPU-accelerated with spot instance optimization
- **Model Inference**: Always-on serving with reserved instance recommendations
- **Hyperparameter Tuning**: Burst-capable with cost-effective spot strategies

### Data Processing

- **ETL Pipelines**: Scheduled data transformation with interruption tolerance
- **Interactive Analysis**: Jupyter notebooks with flexible on-demand capacity

Each template includes:

- **Realistic Usage Patterns**: Based on actual research computing behavior
- **Seasonal Awareness**: Academic calendar and grant cycle integration
- **Best Practices**: Cost optimization strategies specific to each workload type
- **Customization Options**: Easy adjustment for specific research needs

## 📖 API Documentation

### Core Services

#### AWSService

Real-time AWS API integration with intelligent caching and error handling.

```typescript
class AWSService {
  // Get all available instance types with hardware specifications
  async getInstanceTypes(): Promise<InstanceType[]>

  // Find instances matching specific requirements
  async getInstanceTypesByRequirements(
    requirements: ComputeRequirements
  ): Promise<InstanceType[]>

  // Get pricing for specific instance types (supports overloading)
  async getPricing(instanceTypes: string[]): Promise<PriceListItem[]>
  async getPricing(instanceType: string): Promise<PriceListItem | null>

  // Get current and historical spot pricing
  async getSpotPrices(instanceTypes: string[]): Promise<SpotPriceHistoryItem[]>
}
```

#### InstanceMatcher

Intelligent instance scoring and recommendation engine.

```typescript
class InstanceMatcher {
  // Find optimal instances for research workloads
  async matchForWorkload(workload: ResearchWorkload): Promise<InstanceMatch[]>

  // Match instances against custom requirements
  async matchInstances(
    requirements: ComputeRequirements
  ): Promise<InstanceMatch[]>

  // Get single best match with detailed analysis
  async getBestMatch(
    requirements: ComputeRequirements
  ): Promise<InstanceMatch | null>

  // Compare instances side-by-side
  async compareInstances(
    instanceA: string,
    instanceB: string,
    requirements: ComputeRequirements
  ): Promise<ComparisonResult>
}
```

#### ConsumptionPlannerService

Strategic cost optimization and capacity planning.

```typescript
class ConsumptionPlannerService {
  // Generate comprehensive consumption plan
  static async generateConsumptionPlan(
    workloadPatterns: WorkloadPattern[],
    planningHorizon: '1yr' | '3yr',
    discountProfile?: DiscountProfile
  ): Promise<ConsumptionPlan>
}
```

#### BenchmarkDataService

Performance data integration and analysis.

```typescript
class BenchmarkDataService {
  // Fetch benchmark database from GitHub
  static async fetchBenchmarkData(): Promise<BenchmarkDatabase>

  // Get performance data for specific instance type
  static async getInstanceBenchmarks(
    instanceType: string
  ): Promise<InstanceBenchmarkData | null>

  // Generate intelligent performance insights
  static generatePerformanceInsights(
    instanceType: string,
    benchmarks: InstanceBenchmarkData,
    workloadType?: string
  ): PerformanceInsight[]
}
```

### Key Data Types

#### WorkloadPattern

Comprehensive workload usage modeling for consumption planning.

```typescript
interface WorkloadPattern {
  id: string
  name: string
  description: string

  // Usage frequency and timing
  runsPerDay: number
  avgDurationHours: number
  daysPerWeek: number

  // Resource requirements
  instanceRequirements: {
    vCpus: number
    memoryGiB: number
    gpuRequired: boolean
    storageGiB?: number
    networkIntensive?: boolean
  }

  // Patterns and scheduling
  seasonality: SeasonalPattern
  timeOfDay?: 'business-hours' | 'off-hours' | 'any' | 'scheduled'
  interruptible?: boolean
  priority: 'critical' | 'normal' | 'batch' | 'experimental'

  // Burst capacity modeling
  burstCapacity?: {
    enabled: boolean
    maxConcurrentJobs: number
    burstDurationHours: number
    burstFrequency: 'daily' | 'weekly' | 'monthly'
  }
}
```

#### ConsumptionPlan

Strategic purchase recommendations with risk analysis.

```typescript
interface ConsumptionPlan {
  id: string
  workloadPatterns: WorkloadPattern[]
  planningHorizon: '1yr' | '3yr'

  // Strategic recommendations
  recommendedPurchases: PurchaseStrategy[]
  costBreakdown: CostBreakdown

  // Analysis and savings
  analysis: {
    totalMonthlyCost: number
    vsAllOnDemandSavings: {
      amount: number
      percentage: number
    }
    confidence: number
  }

  // Risk assessment
  risks: {
    spotInterruption: number
    underUtilization: number
    overCommitment: number
  }

  recommendations: string[]
  insights: string[]
  warnings?: string[]
}
```

#### InstanceMatch

Comprehensive instance recommendation with scoring.

```typescript
interface InstanceMatch {
  instance: InstanceType
  pricing: {
    onDemand: number
    reserved1yr: number
    reserved3yr: number
    spotCurrent: number
    spotAverage24h?: number
    savingsPlans1yr?: number
    savingsPlans3yr?: number
  }
  matchScore: number
  matchReasons: string[]
}
```

### Workload Templates

Access pre-configured research workload patterns:

```typescript
import {
  WORKLOAD_TEMPLATES,
  getWorkloadTemplate,
} from './data/workload-templates'

// Get specific template
const genomicsTemplate = getWorkloadTemplate('genomics-batch')

// Get all templates by category
const mlTemplates = getWorkloadTemplatesByCategory('ml-training')

// Available categories
const categories = getWorkloadCategories()
// Returns: ['batch-computing', 'interactive', 'data-processing', 'ml-training', 'web-services']
```

### Hardware Specifications

Comprehensive hardware data enrichment:

```typescript
import { HardwareSpecsService } from './services/hardware-specs'

// Get processor summary
const processorInfo = HardwareSpecsService.getProcessorSummary(
  instance.ProcessorInfo
)

// Get memory specifications
const memoryInfo = HardwareSpecsService.getMemorySummary(instance.MemoryInfo)

// Get GPU details
const gpuInfo = HardwareSpecsService.getGpuSummary(gpu)

// Get instance family information
const families = HardwareSpecsService.getInstanceFamilies()
```

## 🔮 Roadmap

### Phase 1: Core Platform (Current)

- ✅ **Instance Selection Engine**: Multi-criteria scoring with real-time AWS pricing
- ✅ **Comprehensive Pricing Display**: All purchase models with savings analysis
- ✅ **Performance Integration**: Benchmark data with cost-efficiency metrics
- ✅ **Consumption Planning Foundation**: Workload patterns and optimization algorithms
- 🚧 **User Interface Enhancement**: Advanced filtering and comparison tools

### Phase 2: Advanced Analytics (Q2 2024)

- 📋 **RAG-Powered AI Assistant**: Natural language interface for infrastructure questions
- 📋 **Predictive Cost Modeling**: Machine learning for usage pattern forecasting
- 📋 **Portfolio Optimization**: Multi-project resource allocation strategies
- 📋 **Historical Analysis**: Usage pattern learning from CloudWatch data

### Phase 3: Enterprise Features (Q3 2024)

- 📋 **Enterprise Discount Integration**: Full EDP, PPA, and credit management
- 📋 **Multi-Account Optimization**: Consolidated billing and shared reserved capacity
- 📋 **Advanced Risk Modeling**: Monte Carlo simulations for capacity planning
- 📋 **Automated Procurement**: Integration with AWS APIs for purchase automation

### Phase 4: Ecosystem Integration (Q4 2024)

- 📋 **HPC Scheduler Integration**: Slurm, PBS, and LSF workload data import
- 📋 **Container Orchestration**: Kubernetes and ECS cost optimization
- 📋 **Research Data Management**: Storage optimization for large datasets
- 📋 **Scientific Computing Frameworks**: Spack, EasyBuild, and module integration

### Future Vision

- **Multi-Cloud Support**: Azure and Google Cloud cost comparison
- **Research Grant Integration**: Comprehensive grant budget management with time-based allocation and spend tracking
- **Sustainability Metrics**: Carbon footprint analysis and green computing recommendations
- **Academic Collaboration**: Shared benchmark database and best practices

## 💰 Monetization & Grant Budget Integration

### Freemium Business Model

ComputeCompass employs a progressive freemium model designed to provide maximum value to researchers while creating sustainable revenue for advanced enterprise features:

#### 🆓 Free Tier - "Research Edition"

- **Target**: Individual researchers, small labs (<5 users), academic exploration
- **Features**: Basic instance selection, workload templates, performance benchmarks, single workload planning
- **Limits**: 5 workload analyses/month, community support only

#### 💼 Professional Tier - "Lab Edition" - $49/month

- **Target**: Research labs, small departments (5-25 users), startup companies
- **Features**: Unlimited analyses, multi-workload optimization, savings plans, export capabilities, email support
- **Grant Features**: Single grant management, monthly budget monitoring, cost projection

#### 🏢 Enterprise Tier - "Institution Edition" - $199/month

- **Target**: Large institutions, national labs, enterprise R&D, multi-PI centers
- **Features**: Advanced grant management, multi-project portfolios, enterprise discounts, custom templates, API access
- **Grant Features**: Unlimited grants, time-based budgets, ML-powered forecasting, compliance reporting

#### 🚀 Enterprise Plus - "Custom Solutions" - Custom Pricing

- **Target**: Major cloud spenders (>$100K/month), government agencies, large consortiums
- **Features**: Dedicated account management, custom development, on-premises deployment, 24/7 support

### Grant Budget Management

#### Comprehensive Budget Tracking

- **Multi-Grant Support**: Track multiple concurrent grants with different budget periods and policies
- **Time-Based Allocation**: Weekly/monthly/quarterly budget distribution with rollover policies
- **Academic Calendar Integration**: Automatic adjustment for semester and conference deadlines
- **Compliance Reporting**: Detailed audit trails for grant accountability and reporting requirements

#### Smart Budget Optimization

- **Seasonal Forecasting**: ML-powered predictions based on academic cycles and historical patterns
- **Cross-Grant Allocation**: Optimal spend distribution across multiple funding sources
- **Budget Risk Assessment**: Early warning systems for potential overruns with mitigation strategies
- **Reserved Instance Timing**: Align RI purchases with grant periods and budget availability

#### Advanced Financial Features

- **Multi-Currency Support**: International grants with real-time currency conversion
- **Indirect Cost Calculation**: Automatic F&A rate application for accurate budget planning
- **Procurement Integration**: Connect to institutional financial systems and approval workflows
- **Grant Lifecycle Management**: Track from application through closeout with automated reporting

### Value Proposition

- **Professional Tier ROI**: Typical 10-20% AWS cost reduction justifies $588 annual subscription
- **Enterprise Tier ROI**: Advanced optimization achieves 20-30% cost reduction on large research budgets
- **Grant Efficiency**: Better budget utilization extends research runway by 15-25%
- **Compliance Value**: Automated reporting saves 10-20 hours per quarter for research administrators

For detailed monetization strategy and pricing rationale, see [docs/MONETIZATION_STRATEGY.md](docs/MONETIZATION_STRATEGY.md).

## 🤝 Community & Support

### Contributing

We welcome contributions from the research computing community! Areas where help is especially valuable:

- **Workload Templates**: Additional research computing patterns and best practices
- **Benchmark Data**: Performance results from real-world research workloads
- **Documentation**: User guides, tutorials, and API documentation
- **Testing**: Edge cases, integration scenarios, and performance validation

### Research Partnerships

ComputeCompass actively collaborates with:

- **Academic Institutions**: University IT departments and research computing centers
- **National Labs**: DOE, NIH, and NSF computing facilities
- **Research Organizations**: Open science initiatives and computational consortiums

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community support and best practices sharing
- **Documentation**: Comprehensive guides at [docs.computecompass.dev](https://docs.computecompass.dev)
- **Research Computing Forums**: Active participation in HPC and cloud computing communities

## 📊 Performance & Benchmarks

ComputeCompass integrates with the open-source [aws-instance-benchmarks](https://github.com/scttfrdmn/aws-instance-benchmarks) project:

### Benchmark Coverage

- **Memory Performance**: STREAM benchmarks for all instance families
- **CPU Performance**: LINPACK GFLOPS and CoreMark integer performance
- **NUMA Analysis**: Multi-socket efficiency and memory locality
- **Cost Efficiency**: Price-per-GFLOP and price-per-GB/s metrics

### Data Quality

- **Systematic Testing**: Automated benchmark collection across instance types
- **Compiler Optimization**: Spack-based builds with architecture-specific optimizations
- **Container Deployment**: Reproducible results using standardized environments
- **Community Validation**: Open data format for community review and contribution

## 🔒 Security & Privacy

### Data Security

- **No User Data Storage**: All analysis performed client-side
- **AWS Credentials**: Local profile only, no hardcoded secrets
- **HTTPS Everywhere**: Secure transmission for all API calls
- **Open Source**: Transparent implementation and security review

### Privacy Protection

- **No Personal Information**: No user accounts or personal data collection
- **No Query Tracking**: Search patterns and selections not stored
- **Local Processing**: Instance matching and analysis done client-side
- **Minimal Analytics**: Privacy-focused usage metrics only

## 📄 License

ComputeCompass is released under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

ComputeCompass builds upon the work of many in the research computing community:

- **AWS**: For comprehensive APIs enabling real-time pricing and instance data
- **Research Computing Centers**: For workload patterns and optimization insights
- **Open Source Community**: For tools, libraries, and best practices
- **HPC Community**: For performance benchmarking methodologies and standards

## 📞 Contact

- **Project Lead**: Scott Friedman ([@scttfrdmn](https://github.com/scttfrdmn))
- **Email**: [contact@computecompass.dev](mailto:contact@computecompass.dev)
- **Website**: [aws.computecompass.dev](https://aws.computecompass.dev)
- **GitHub**: [github.com/scttfrdmn/computecompass](https://github.com/scttfrdmn/computecompass)

---

**ComputeCompass**: Transforming research computing infrastructure decisions through intelligent analysis, comprehensive benchmarking, and strategic cost optimization. Built by researchers, for researchers. 🧭✨
