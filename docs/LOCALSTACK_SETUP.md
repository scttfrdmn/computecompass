# LocalStack Pro Setup for ComputeCompass

This document explains how to set up LocalStack Pro for local AWS API testing and development.

## Prerequisites

1. **LocalStack Pro License**: You need a valid LocalStack Pro API key
2. **Docker**: Docker must be installed and running
3. **Docker Compose**: Should be included with Docker Desktop

## Setup Instructions

### 1. Create Environment File

Copy the example environment file and add your LocalStack Pro API key:

```bash
cp .env.example .env
```

Edit `.env` and replace `your_localstack_pro_api_key_here` with your actual API key:

```bash
LOCALSTACK_API_KEY=ls-your-actual-api-key-here
```

### 2. Start LocalStack

Start LocalStack Pro with the required AWS services:

```bash
npm run localstack:start
```

This will start LocalStack with:

- EC2 service for instance type data
- Pricing service for cost information
- STS and IAM for authentication
- Persistence enabled to retain data between restarts

### 3. Verify Setup

Check that LocalStack is running:

```bash
# View logs
npm run localstack:logs

# Test the health endpoint
curl http://localhost:4566/_localstack/health
```

You should see a response indicating that EC2 and Pricing services are running.

### 4. Run Tests with LocalStack

Run the test suite against LocalStack:

```bash
npm run test:localstack
```

This will run all tests with LocalStack configuration enabled.

## Available Services

LocalStack Pro provides the following AWS services for ComputeCompass:

- **EC2**: Instance type descriptions and specifications
- **Pricing**: Cost data for different purchase options
- **STS**: Security Token Service for authentication
- **IAM**: Identity and Access Management

## Mock Data

The application includes comprehensive mock data for development:

- **Instance Types**: 5 representative instance types covering different use cases
- **Pricing Data**: Realistic pricing for on-demand, reserved, and spot instances
- **Research Workloads**: 12 predefined workload templates

## Useful Commands

```bash
# Start LocalStack
npm run localstack:start

# Stop LocalStack
npm run localstack:stop

# View LocalStack logs
npm run localstack:logs

# Run tests with LocalStack
npm run test:localstack

# Check LocalStack status
curl http://localhost:4566/_localstack/health
```

## Troubleshooting

### LocalStack Won't Start

1. Ensure Docker is running
2. Check that ports 4566 and 4510-4559 are not in use
3. Verify your LocalStack Pro API key is valid
4. Check Docker logs: `docker logs computecompass-localstack`

### API Calls Failing

1. Verify LocalStack is running: `curl http://localhost:4566/_localstack/health`
2. Check that `VITE_APP_ENV=development` is set
3. Ensure AWS credentials are set to test values in the environment

### Data Persistence

LocalStack Pro is configured with persistence enabled. Data will be stored in the `localstack-data/` directory and preserved between restarts.

To reset LocalStack data:

```bash
npm run localstack:stop
rm -rf localstack-data/
npm run localstack:start
```

## Production Deployment

In production, the application will use real AWS APIs. The LocalStack configuration is only active when `VITE_APP_ENV=development`.

For production deployment:

- Set `VITE_APP_ENV=production`
- Configure real AWS credentials
- Remove LocalStack-specific environment variables
