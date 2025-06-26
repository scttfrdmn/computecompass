# ComputeCompass - Development Context

## 🎯 Project Mission

Create a comprehensive web application for AWS instance selection focused on research computing workloads, providing performance-aware recommendations powered by real benchmark data.

## 🏗️ Development Tenets

### **1. Quality First**

- **Test-Driven Development**: Write tests before implementation, maintain 85%+ coverage
- **TypeScript Strict**: Use strict type checking and proper interfaces
- **Pre-commit Hooks**: Automated linting, formatting, and testing with husky
- **Real API Integration**: Test against actual AWS APIs, not just mocks

### **2. Modern Web Standards**

- **React 18 + TypeScript**: Latest React features with strict typing
- **Vite**: Fast development and optimized builds
- **Tailwind CSS**: Utility-first styling with consistent design system
- **Vitest + Playwright**: Comprehensive unit and E2E testing

### **3. Performance & User Experience**

- **Fast Loading**: Optimized bundle size and lazy loading
- **Responsive Design**: Mobile-first approach with accessible components
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Loading States**: Clear feedback during AWS API calls

### **4. AWS Integration Excellence**

- **Multi-API Integration**: EC2, Pricing, and Spot Price APIs
- **Hardware Enrichment**: Comprehensive processor, memory, and GPU specifications
- **Cost Transparency**: All pricing models (on-demand, reserved, spot, savings plans)
- **Real-time Data**: Live AWS API integration with caching strategies

## 📊 Technical Architecture

### **Core Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Headless UI for accessibility
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: ESLint + Prettier with strict TypeScript config
- **Build**: Vite with optimized production builds

### **AWS Integration**

- **Services**: EC2 (instances), Pricing (costs), CloudWatch (spot prices)
- **Authentication**: Local AWS profile for development and testing
- **Caching**: Intelligent caching for instance types and pricing data
- **Error Handling**: Comprehensive error handling with retry logic

### **Data Sources**

- **AWS APIs**: Real-time instance specifications and pricing
- **Hardware Database**: Enriched processor, memory, and GPU details
- **Benchmark Data**: Performance metrics from aws-instance-benchmarks
- **Research Workloads**: Predefined templates for common research tasks

## 🧮 Smart Matching Algorithm

### **Multi-Criteria Scoring**

- **Performance Weight**: 40% - CPU, memory, network capabilities
- **Cost Weight**: 40% - Optimized for research budgets
- **Efficiency Weight**: 20% - Power and resource utilization

### **Research Workload Focus**

- **Genomics**: High memory bandwidth, large storage
- **Climate Modeling**: CPU-intensive with MPI support
- **Machine Learning**: GPU acceleration, high memory
- **Bioinformatics**: Balanced compute and memory
- **Computational Chemistry**: CPU cores and memory per core

### **Hardware Awareness**

- **Processor Types**: Intel Xeon, AMD EPYC, AWS Graviton (1,2,3,3E,4)
- **AI Accelerators**: Inferentia, Trainium with detailed specifications
- **GPU Support**: NVIDIA, AMD, Intel with memory and features
- **Memory Types**: DDR3, DDR4, DDR5 with bandwidth characteristics

## 🔬 Performance Integration

### **Benchmark Data Service**

- **Data Source**: GitHub-hosted aws-instance-benchmarks repository
- **Real Performance**: STREAM memory benchmarks, LINPACK CPU tests
- **Cost Efficiency**: Price per GFLOP and GB/s calculations
- **Insights Engine**: Intelligent performance analysis and recommendations

### **Performance Insights**

- **Memory Bandwidth**: >200 GB/s flagged as excellent for memory-intensive workloads
- **Memory Latency**: <80ns highlighted for latency-sensitive applications
- **NUMA Awareness**: Multi-socket efficiency analysis
- **Cost Optimization**: Spot instance reliability and savings analysis

## 🧪 Testing Strategy

### **Comprehensive Coverage**

- **Unit Tests**: Service layer, matchers, and utilities (85%+ coverage)
- **Integration Tests**: Real AWS API calls with proper mocking
- **E2E Tests**: Full user workflows with Playwright
- **Performance Tests**: Benchmark data integration validation

### **Testing Tools**

- **Vitest**: Fast unit testing with TypeScript support
- **Playwright**: Cross-browser E2E testing
- **LocalStack Pro**: Local AWS API testing for development
- **GitHub Actions**: Automated testing on every push

### **Test Quality Standards**

- **Realistic Data**: Use actual AWS API responses in tests
- **Error Scenarios**: Test network failures and API errors
- **Performance**: Validate algorithm correctness and speed
- **Accessibility**: Test with screen readers and keyboard navigation

## 🚀 Development Workflow

### **Git Workflow**

- **Feature Branches**: All work in feature branches with descriptive names
- **Pre-commit Hooks**: Automated linting, formatting, and testing
- **Commit Messages**: Descriptive messages with scope and impact
- **PR Reviews**: Code review required before merging

### **Code Quality**

- **ESLint**: Strict TypeScript rules with accessibility checks
- **Prettier**: Consistent code formatting across the project
- **TypeScript**: Strict mode with comprehensive type coverage
- **Documentation**: Inline comments for complex algorithms

### **Development Environment**

- **Node.js 18+**: Modern JavaScript features and performance
- **Package Manager**: npm with lockfile for reproducible builds
- **VS Code**: Recommended extensions for TypeScript and React
- **Environment Variables**: Secure configuration management

## 🔗 Integration Architecture

### **AWS Service Layer**

```typescript
// Clean service abstraction
export class AWSService {
  async getInstanceTypes(): Promise<InstanceType[]>
  async getPricing(instanceTypes: string[]): Promise<PriceListItem[]>
  async getSpotPrices(instanceTypes: string[]): Promise<SpotPriceHistoryItem[]>
}
```

### **Instance Matching**

```typescript
// Intelligent matching with scoring
export class InstanceMatcher {
  async matchForWorkload(workload: ResearchWorkload): Promise<InstanceMatch[]>
  async matchInstances(
    requirements: ComputeRequirements
  ): Promise<InstanceMatch[]>
}
```

### **Benchmark Integration**

```typescript
// Performance-aware recommendations
export class BenchmarkDataService {
  static async fetchBenchmarkData(): Promise<BenchmarkDatabase>
  static generatePerformanceInsights(instanceType: string): PerformanceInsight[]
}
```

## 📈 Deployment Strategy

### **GitHub Pages Deployment**

- **Domain**: aws.computecompass.dev
- **Build Process**: Automated via GitHub Actions
- **Environment**: Production-optimized Vite build
- **Analytics**: Privacy-focused usage tracking

### **Performance Optimization**

- **Bundle Analysis**: Regular bundle size monitoring
- **Code Splitting**: Lazy loading for non-critical components
- **Caching**: Aggressive caching for AWS data
- **CDN**: GitHub Pages CDN for global performance

## 🔐 Security & Privacy

### **Data Security**

- **No User Data**: No personal information stored or transmitted
- **AWS Credentials**: Local profile only, no hardcoded secrets
- **API Keys**: Environment variables with proper validation
- **HTTPS**: Secure transmission for all API calls

### **Privacy**

- **No Tracking**: No personal analytics or tracking cookies
- **Open Source**: Transparent code and methodology
- **Local Processing**: Instance matching done client-side
- **No Data Retention**: No user queries or selections stored

## 🤝 Community & Open Source

### **Open Development**

- **Public Repository**: All code available on GitHub
- **Issue Tracking**: Bug reports and feature requests welcome
- **Contribution Guidelines**: Clear process for community contributions
- **Documentation**: Comprehensive setup and usage guides

### **Research Community Focus**

- **Academic Partnerships**: Collaboration with research institutions
- **Open Benchmarks**: Integration with community-driven performance data
- **Research Workloads**: Templates based on real research needs
- **Cost Optimization**: Focus on research budget constraints

## 📝 Project Status & Roadmap

### **Completed Features**

- ✅ Core React application with TypeScript
- ✅ AWS API integration (EC2, Pricing, Spot)
- ✅ Comprehensive hardware specifications
- ✅ Research workload templates
- ✅ Instance matching algorithm
- ✅ Benchmark data integration
- ✅ Performance insights display
- ✅ Comprehensive error handling with contextual help
- ✅ Multi-model pricing display (on-demand, reserved, spot, savings plans)
- ✅ Consumption planner architecture with workload pattern analysis
- ✅ Strategic cost optimization algorithms
- ✅ Enterprise discount support (EDP, PPA, credits)

### **Current Sprint**

- 🔄 Workload pattern input UI components
- 🔄 Consumption plan visualization
- 🔄 Advanced parameter selection components
- 🔄 Deployment configuration

### **Next Phase**

- 📋 Grant budget integration with time-based allocation
- 📋 Progressive monetization with freemium model
- 📋 RAG-powered AI chat interface
- 📋 Predictive cost modeling with historical data
- 📋 Multi-project portfolio optimization
- 📋 Advanced enterprise features and automation

## 💰 Monetization Strategy

### **Freemium Business Model**

- **Free Tier**: Research Edition for individual researchers (5 analyses/month)
- **Professional Tier**: Lab Edition at $49/month for research groups
- **Enterprise Tier**: Institution Edition at $199/month for large organizations
- **Enterprise Plus**: Custom pricing for major cloud spenders

### **Grant Budget Integration**

- **Multi-Grant Tracking**: Unlimited concurrent grants with budget period management
- **Academic Calendar Awareness**: Seasonal allocation and deadline-driven scaling
- **Compliance Reporting**: Automated audit trails and progress reporting
- **Smart Forecasting**: ML-powered budget predictions with confidence intervals
- **Cross-Grant Optimization**: Optimal spend distribution across funding sources

### **Value Proposition**

- **Professional ROI**: 10-20% AWS cost reduction justifies $588 annual subscription
- **Enterprise ROI**: 20-30% cost reduction on large research budgets
- **Grant Efficiency**: 15-25% better budget utilization extends research runway
- **Compliance Value**: Saves 10-20 hours/quarter for research administrators

## 🔧 Development Commands

### **Setup**

```bash
npm install                    # Install dependencies
npm run dev                   # Start development server
npm run build                 # Production build
npm run preview               # Preview production build
```

### **Testing**

```bash
npm run test                  # Run unit tests
npm run test:watch           # Watch mode for development
npm run test:e2e             # Run E2E tests
npm run typecheck            # TypeScript validation
```

### **Quality**

```bash
npm run lint                  # ESLint checking
npm run lint:fix             # Fix linting issues
npm run format               # Prettier formatting
npm run prepare              # Setup pre-commit hooks
```

## 🎯 Success Metrics

### **Technical Excellence**

- **Test Coverage**: Maintain 85%+ unit and integration test coverage
- **Performance**: Page load times under 2 seconds
- **Accessibility**: WCAG 2.1 AA compliance
- **TypeScript**: 100% type coverage with strict mode

### **User Experience**

- **Accuracy**: Instance recommendations match user requirements
- **Speed**: Results displayed within 5 seconds of AWS API calls
- **Usability**: Intuitive interface requiring no documentation
- **Mobile**: Responsive design works on all device sizes

### **Research Impact**

- **Adoption**: Used by research institutions for instance selection
- **Cost Savings**: Demonstrate measurable cost optimizations
- **Performance**: Show performance improvements through better selection
- **Community**: Active community contributing workload templates

## 🔄 Continuous Improvement

### **User Feedback**

- **Analytics**: Usage patterns and popular features
- **Surveys**: Quarterly feedback from research community
- **GitHub Issues**: Bug reports and feature requests
- **Academic Partnerships**: Direct feedback from research institutions

### **Technical Evolution**

- **Dependency Updates**: Regular security and feature updates
- **Performance Monitoring**: Continuous performance optimization
- **AWS API Changes**: Adapt to new AWS services and features
- **Benchmark Integration**: Evolving performance data sources

### **Feature Evolution**

- **Workload Templates**: Community-contributed research patterns
- **ML Integration**: AI-powered recommendation improvements
- **Cost Tracking**: Historical cost analysis and predictions
- **Multi-Cloud**: Potential expansion to other cloud providers

---

**This document should be updated as the project evolves. Last updated: 2024-06-26**
