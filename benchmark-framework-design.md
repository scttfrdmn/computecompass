# ComputeCompass Benchmark Framework Design

## Overview

A comprehensive, automated benchmarking system for AWS instances using containerized Spack environments to capture microarchitectural performance characteristics that drive real-world research computing decisions.

## Architecture

### 1. Container-Based Benchmark Suite

```dockerfile
# Multi-stage build for architecture-specific optimization
FROM spack/ubuntu-jammy:latest as spack-base

# Install Spack and configure for target architecture
RUN spack install gcc@11.3.0 target=x86_64_v3  # Intel/AMD
RUN spack install gcc@11.3.0 target=armv8.2-a  # Graviton
RUN spack install intel-oneapi-compilers@2023.1.0  # Intel optimizations
RUN spack install aocc@4.0.0  # AMD optimizations

# Benchmark-specific containers
FROM spack-base as memory-benchmarks
RUN spack install stream@5.10 +openmp
RUN spack install cachebench +numa
RUN spack install membench +prefetch

FROM spack-base as cpu-benchmarks
RUN spack install hpl +mkl  # LINPACK
RUN spack install coremark-pro +vectorization
RUN spack install spec-cpu2017 +profile-guided
```

### 2. Microarchitectural Benchmark Categories

#### Memory Hierarchy Benchmarks

```yaml
memory_benchmarks:
  stream:
    variants: [copy, scale, add, triad]
    optimizations: [sse2, avx2, avx512, neon, sve]
    numa_modes: [interleaved, local, remote]

  cache_hierarchy:
    l1_cache:
      - latency_test: random_access_1kb_4kb_64kb
      - bandwidth_test: sequential_read_write
      - associativity: set_associative_stress
    l2_cache:
      - latency_test: random_access_64kb_1mb
      - bandwidth_test: streaming_prefetch
      - cache_line: 64byte_128byte_tests
    l3_cache:
      - latency_test: random_access_1mb_32mb
      - bandwidth_test: numa_aware_streaming
      - coherency: multi_socket_ping_pong

  memory_access_patterns:
    - sequential_access: stride_1_2_4_8_16
    - random_access: uniform_gaussian_hotspot
    - sparse_access: csr_matrix_patterns
    - numa_affinity: local_remote_interleaved
```

#### CPU Microarchitecture Benchmarks

```yaml
cpu_benchmarks:
  instruction_throughput:
    - integer_ops: add_mul_div_mod_bitwise
    - floating_point: sp_dp_fma_transcendental
    - vector_ops: sse_avx_avx512_neon_sve
    - mixed_workloads: int_fp_vector_combinations

  pipeline_characteristics:
    - branch_prediction: conditional_indirect_loops
    - instruction_level_parallelism: dependency_chains
    - out_of_order_execution: reorder_buffer_stress
    - speculation: misprediction_recovery

  architectural_features:
    intel_specific:
      - turbo_boost: sustained_vs_burst_performance
      - hyperthreading: smt_scaling_efficiency
      - avx512: downclocking_thermal_throttling
    amd_specific:
      - precision_boost: frequency_scaling
      - infinity_fabric: ccx_numa_topology
      - chiplet_design: cross_die_latency
    graviton_specific:
      - arm_neon: vector_performance
      - cortex_a78c: pipeline_efficiency
      - custom_silicon: aws_optimizations
```

### 3. Spack Configuration Templates

#### Architecture-Specific Compiler Optimization

```yaml
# Intel Xeon optimization
spack_intel.yaml:
  packages:
    all:
      compiler: [intel@2023.1.0]
      variants: +mkl +ipp +tbb
      target: [x86_64_v3, skylake, icelake, sapphirerapids]
      cflags: -march=native -mtune=native -O3 -xHost

# AMD EPYC optimization
spack_amd.yaml:
  packages:
    all:
      compiler: [aocc@4.0.0, gcc@11.3.0]
      variants: +aocl +zen3 +zen4
      target: [x86_64_v3, znver2, znver3, znver4]
      cflags: -march=native -mtune=native -O3 -mavx2

# ARM Graviton optimization
spack_graviton.yaml:
  packages:
    all:
      compiler: [gcc@11.3.0, arm@22.1]
      variants: +armpl +sve
      target: [armv8.2-a, neoverse-n1, neoverse-v1]
      cflags: -march=native -mtune=native -O3 -mcpu=neoverse-v1
```

### 4. Automated Deployment Pipeline

#### AWS Instance Orchestration

```python
# benchmark_orchestrator.py
class BenchmarkOrchestrator:
    def __init__(self):
        self.ec2 = boto3.client('ec2')
        self.ecs = boto3.client('ecs')

    async def run_benchmark_suite(self, instance_families: List[str]):
        """Deploy and run benchmarks across instance families"""

        # Create ECS cluster for orchestration
        cluster = await self.create_ecs_cluster()

        for family in instance_families:
            instances = self.get_instance_sizes(family)

            # Parallel execution across sizes
            tasks = []
            for instance_type in instances:
                task = self.run_instance_benchmarks(
                    instance_type=instance_type,
                    container_config=self.get_container_config(family),
                    benchmarks=self.get_benchmark_suite(family)
                )
                tasks.append(task)

            results = await asyncio.gather(*tasks)
            await self.store_results(family, results)

    def get_container_config(self, instance_family: str) -> Dict:
        """Architecture-specific container configuration"""
        arch_map = {
            'graviton': 'arm64',
            'intel': 'x86_64',
            'amd': 'x86_64'
        }

        return {
            'architecture': arch_map.get(self.get_processor_family(instance_family)),
            'spack_config': f'spack_{self.get_processor_family(instance_family)}.yaml',
            'compiler_flags': self.get_optimal_flags(instance_family),
            'numa_topology': self.detect_numa_config(instance_family)
        }
```

#### Container Deployment Strategy

```yaml
# docker-compose-benchmarks.yml
version: '3.8'
services:
  benchmark-runner:
    build:
      context: .
      dockerfile: Dockerfile.${ARCH}
      args:
        SPACK_CONFIG: ${SPACK_CONFIG}
        TARGET_ARCH: ${TARGET_ARCH}
    environment:
      - NUMA_POLICY=${NUMA_POLICY}
      - COMPILER_FLAGS=${COMPILER_FLAGS}
      - INSTANCE_TYPE=${INSTANCE_TYPE}
    volumes:
      - /sys/devices/system/cpu:/sys/devices/system/cpu:ro
      - /proc/cpuinfo:/proc/cpuinfo:ro
      - benchmark-results:/results
    deploy:
      resources:
        limits:
          memory: ${MEMORY_LIMIT}
        reservations:
          memory: ${MEMORY_RESERVATION}
```

### 5. Performance Data Collection

#### Structured Benchmark Results

```typescript
interface BenchmarkResult {
  metadata: {
    instanceType: string
    instanceFamily: string
    processorArchitecture: 'intel' | 'amd' | 'graviton'
    compilerSuite: string
    optimizationFlags: string[]
    numaTopology: NumaTopology
    timestamp: Date
    environment: ContainerEnvironment
  }

  memory_performance: {
    stream: {
      copy_bandwidth: number // GB/s
      scale_bandwidth: number
      add_bandwidth: number
      triad_bandwidth: number
      numa_scaling: number[] // Per-node performance
    }
    cache_hierarchy: {
      l1_latency: number // cycles
      l2_latency: number
      l3_latency: number
      memory_latency: number
      l1_bandwidth: number // GB/s
      l2_bandwidth: number
      l3_bandwidth: number
    }
    access_patterns: {
      sequential_bandwidth: number
      random_4kb_latency: number
      stride_performance: { [stride: string]: number }
    }
  }

  cpu_performance: {
    instruction_throughput: {
      integer_ops_per_cycle: number
      fp_ops_per_cycle: number
      vector_ops_per_cycle: number
      peak_gflops: number
    }
    pipeline_efficiency: {
      branch_mispredict_penalty: number
      ilp_score: number
      reorder_buffer_utilization: number
    }
    architectural_features: {
      turbo_frequency: number
      sustained_frequency: number
      thermal_throttling_point: number
      smt_efficiency: number // Hyperthreading/SMT scaling
    }
  }

  cost_analysis: {
    cost_per_gflops: number
    cost_per_gbs_memory: number
    spot_availability: number // Historical percentage
    carbon_efficiency: number // gCO2/GFLOPS
  }
}
```

### 6. Deployment and Execution Strategy

#### Multi-Region Benchmark Campaign

```bash
#!/bin/bash
# deploy_benchmarks.sh

# Define instance families and regions
FAMILIES=("m7i" "m7a" "m7g" "c7i" "c7a" "c7g" "r7i" "r7a" "r7g" "inf1" "inf2" "trn1")
REGIONS=("us-east-1" "us-west-2" "eu-west-1")

for region in "${REGIONS[@]}"; do
    for family in "${FAMILIES[@]}"; do
        # Deploy ECS tasks with spot instances for cost efficiency
        aws ecs run-task \
            --region $region \
            --cluster computecompass-benchmarks \
            --task-definition "benchmark-${family}" \
            --launch-type FARGATE_SPOT \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
            --overrides "{\"containerOverrides\":[{\"name\":\"benchmark-runner\",\"environment\":[{\"name\":\"INSTANCE_FAMILY\",\"value\":\"$family\"},{\"name\":\"AWS_REGION\",\"value\":\"$region\"}]}]}"
    done
done
```

#### Continuous Benchmarking Pipeline

```yaml
# .github/workflows/benchmark-collection.yml
name: Continuous Benchmark Collection
on:
  schedule:
    - cron: '0 2 * * 0' # Weekly benchmarks
  workflow_dispatch:
    inputs:
      instance_families:
        description: 'Instance families to benchmark'
        default: 'all'

jobs:
  benchmark-matrix:
    strategy:
      matrix:
        family: [m7i, m7a, m7g, c7i, c7a, c7g, r7i, r7a, r7g]
        size: [large, xlarge, 2xlarge, 4xlarge]

    runs-on: ubuntu-latest
    steps:
      - name: Deploy Benchmark Container
        run: |
          aws ecs run-task \
            --cluster benchmarks \
            --task-definition "benchmark-${{ matrix.family }}" \
            --overrides '{"containerOverrides":[{"name":"benchmark","environment":[{"name":"INSTANCE_SIZE","value":"${{ matrix.size }}"}]}]}'
```

## Benefits of This Approach

1. **Compiler Optimization**: Spack ensures optimal compilation for each architecture
2. **Reproducibility**: Containerized environments provide consistent results
3. **Scalability**: ECS/Fargate enables parallel execution across hundreds of instances
4. **Cost Efficiency**: Spot instances reduce benchmarking costs by 70%+
5. **Automation**: Continuous collection keeps database current with new instances
6. **Deep Insights**: Microarchitectural details enable sophisticated recommendations

This framework would generate the world's most comprehensive database of AWS instance performance characteristics, enabling the RAG-powered AI to provide incredibly detailed and accurate recommendations.
