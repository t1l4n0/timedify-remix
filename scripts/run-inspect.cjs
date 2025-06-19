// This script sets up the required environment variables and runs the inspect-build.js script

// Node.js environment
process.env.NODE_ENV = 'development';
process.env.NODE_OPTIONS = '--experimental-vm-modules';

// Monkey-patch the console to capture logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

const logs = [];
const errors = [];

console.log = (...args) => {
  logs.push(['log', ...args]);
  originalConsoleLog(...args);
};

console.error = (...args) => {
  errors.push(['error', ...args]);
  originalConsoleError(...args);
};

// Load the built server code
const path = require('path');
const fs = require('fs');

// Path to the built server code
const serverBuildPath = path.resolve(__dirname, '../build/server/index.cjs');

console.log(`Loading server build from: ${serverBuildPath}`);

// Check if the file exists
if (!fs.existsSync(serverBuildPath)) {
  console.error(`Error: Server build not found at ${serverBuildPath}`);
  process.exit(1);
}

// Read the built file
const serverCode = fs.readFileSync(serverBuildPath, 'utf8');

// Search for the Shopify configuration in chunks to avoid regex complexity
const findShopifyConfig = (code) => {
  // Look for the shopifyApp call
  const appCallMatch = code.match(/\bshopifyApp\s*\(/);
  if (!appCallMatch) return null;
  
  let startPos = appCallMatch.index + appCallMatch[0].length;
  let braceCount = 1;
  let i = startPos;
  
  // Find the matching closing brace
  while (i < code.length && braceCount > 0) {
    if (code[i] === '{') braceCount++;
    if (code[i] === '}') braceCount--;
    i++;
  }
  
  if (braceCount !== 0) return null; // Unmatched braces
  
  const configStr = code.slice(startPos, i).trim();
  return configStr;
};

// Extract the Shopify configuration section
const shopifyConfigStr = findShopifyConfig(serverCode);

if (shopifyConfigStr) {
  console.log('\n=== Shopify App Configuration ===');
  console.log(shopifyConfigStr);
  
  // Check for required fields in the configuration
  const requiredFields = ['apiKey', 'apiSecretKey', 'hostName', 'apiVersion', 'scopes'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    const fieldMatch = new RegExp(`\\b${field}\\s*:\\s*([^,}\n]*)`).exec(shopifyConfigStr);
    if (!fieldMatch || !fieldMatch[1] || fieldMatch[1].trim() === '') {
      missingFields.push(field);
    } else {
      console.log(`Found ${field}: ${fieldMatch[1].trim()}`);
    }
  });
  
  if (missingFields.length > 0) {
    console.error(`\nMissing or empty required fields in Shopify config: ${missingFields.join(', ')}`);
  } else {
    console.log('\nAll required fields are present in the Shopify config');
  }
  
  // Look for the shopify_server_default assignment
  const serverDefaultMatch = serverCode.match(/shopify_server_default\s*=\s*([^,;\n]+)/);
  if (serverDefaultMatch) {
    console.log(`\nShopify instance assigned to: ${serverDefaultMatch[1]}`);
  }
} else {
  console.error('\nCould not find Shopify app configuration in the built server code');
  
  // Try to find any reference to shopifyApp in the code
  const shopifyAppRefs = (serverCode.match(/shopifyApp/g) || []).length;
  console.log(`Found ${shopifyAppRefs} references to 'shopifyApp' in the built code`);
  
  // Output a sample of the code around the first reference
  const firstRef = serverCode.indexOf('shopifyApp');
  if (firstRef !== -1) {
    const sampleStart = Math.max(0, firstRef - 100);
    const sampleEnd = Math.min(serverCode.length, firstRef + 200);
    console.log('\nCode sample around first reference to shopifyApp:');
    console.log('...' + serverCode.slice(sampleStart, sampleEnd) + '...');
  }
}

// Log environment variables that might affect the configuration
console.log('\n=== Environment Variables ===');
const relevantVars = [
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET',
  'SHOPIFY_API_VERSION',
  'SHOPIFY_APP_URL',
  'SCOPES',
  'HOST',
  'HOSTNAME',
  'HOST_NAME',
  'PORT',
  'hostName',
  'NODE_ENV'
];

relevantVars.forEach(varName => {
  console.log(`${varName}=${process.env[varName] || '(not set)'}`);
});

// Shopify API configuration - these MUST match your Shopify Partner Dashboard settings
const shopifyConfig = {
  // Required fields
  apiKey: 'test-key',
  apiSecretKey: 'test-secret',
  hostName: 'localhost:3000',
  hostScheme: 'http',
  apiVersion: '2024-01',
  isEmbeddedApp: true,
  isCustomStoreApp: false,
  scopes: ['read_products', 'write_products'],
  appUrl: 'http://localhost:3000',
  
  // Additional configuration
  authPathPrefix: '/auth',
  distribution: 'AppStore',
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true
  },
  logger: {
    log: console.log,
    level: 'info',
    httpRequests: false,
    timestamps: false
  }
};

// Set environment variables from config
Object.entries({
  // Core Shopify config
  'SHOPIFY_API_KEY': shopifyConfig.apiKey,
  'SHOPIFY_API_SECRET': shopifyConfig.apiSecretKey,
  'SHOPIFY_API_VERSION': shopifyConfig.apiVersion,
  'SHOPIFY_APP_URL': shopifyConfig.appUrl,
  'SCOPES': shopifyConfig.scopes.join(','),
  
  // Host configuration
  'HOST': shopifyConfig.appUrl,
  'HOSTNAME': shopifyConfig.hostName,
  'HOST_NAME': shopifyConfig.hostName,
  'PORT': '3000',
  'hostName': shopifyConfig.hostName, // Directly set for Shopify validation
  
  // Additional parameters
  'SHOPIFY_API_HOST': shopifyConfig.hostName,
  'SHOPIFY_HOST_SCHEME': shopifyConfig.hostScheme,
  'IS_EMBEDDED_APP': String(shopifyConfig.isEmbeddedApp),
  'IS_CUSTOM_STORE_APP': String(shopifyConfig.isCustomStoreApp)
}).forEach(([key, value]) => {
  if (value !== undefined) {
    process.env[key] = value;
  }
});

// Log the configuration for debugging
console.log('=== Shopify Configuration ===');
console.log(JSON.stringify(shopifyConfig, null, 2));

console.log('\n=== Environment Variables ===');
Object.entries(process.env)
  .filter(([key]) => key.startsWith('SHOPIFY_') || key.startsWith('HOST') || key === 'SCOPES')
  .forEach(([key, value]) => {
    console.log(`${key}=${key.includes('SECRET') ? '***' : value}`);
  });

// Make config available globally for inspection
globalThis.shopifyConfig = shopifyConfig;

// Database configuration (required for Prisma)
process.env.DATABASE_URL = 'file:./dev.db';

// Debug environment variables
console.log('Environment variables set for inspection:');
console.log('- SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? '***' : 'NOT SET');
console.log('- SHOPIFY_API_HOST:', process.env.SHOPIFY_API_HOST);
console.log('- SHOPIFY_APP_URL:', process.env.SHOPIFY_APP_URL);
console.log('- HOST:', process.env.HOST);
console.log('- HOSTNAME:', process.env.HOSTNAME);
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Import and run the inspect-build script
import('./inspect-build.js').catch(err => {
  console.error('Error running inspect-build:', err);
  process.exit(1);
});
