import { EC2Client } from '@aws-sdk/client-ec2'
import { PricingClient } from '@aws-sdk/client-pricing'

const isLocalStack = import.meta.env.VITE_APP_ENV === 'development'

const awsConfig = {
  region: 'us-east-1',
  ...(isLocalStack && {
    endpoint: 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
  }),
}

export const ec2Client = new EC2Client(awsConfig)

export const pricingClient = new PricingClient({
  ...awsConfig,
  region: 'us-east-1', // Pricing API only available in us-east-1 and ap-south-1
})

export const createTestClients = () => ({
  ec2: new EC2Client({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
  }),
  pricing: new PricingClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
  }),
})
