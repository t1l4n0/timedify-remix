// Test script to initialize Shopify API with minimal configuration (CommonJS version)
const { shopifyApp } = require('@shopify/shopify-app-remix/server');
const { PrismaClient } = require('@prisma/client');
const { PrismaSessionStorage } = require('@shopify/shopify-app-session-storage-prisma');
const { ApiVersion } = require('@shopify/shopify-api');

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the minimum required configuration
const config = {
  apiKey: 'test-key',
  apiSecretKey: 'test-secret',
  apiVersion: ApiVersion.January25,
  scopes: ['read_products', 'write_products'],
  appUrl: 'http://localhost:3000',
  authPathPrefix: '/auth',
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: 'AppStore',
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  // These are the required fields from the validation function
  hostName: 'localhost:3000',
  hostScheme: 'http',
  isEmbeddedApp: true,
  isCustomStoreApp: false,
  logger: {
    log: console.log,
    level: 'info',
    httpRequests: false,
    timestamps: false
  }
};

console.log('Initializing Shopify API with config:', {
  ...config,
  apiSecretKey: '***', // Don't log the actual secret
  sessionStorage: '[PrismaSessionStorage]',
});

try {
  const shopify = shopifyApp(config);
  console.log('✅ Successfully initialized Shopify API');
  console.log('Available methods:', Object.keys(shopify));
} catch (error) {
  console.error('❌ Failed to initialize Shopify API:');
  console.error(error);
  process.exit(1);
}
