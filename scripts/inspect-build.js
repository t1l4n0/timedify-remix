import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the built server file
const serverBuildPath = path.resolve(__dirname, '../build/server/index.cjs');

// Check if the file exists
if (!fs.existsSync(serverBuildPath)) {
  console.error('Server build not found at:', serverBuildPath);
  process.exit(1);
}

// Import the built server file
console.log('Importing server build from:', serverBuildPath);

// Use dynamic import to load the CommonJS module
const imported = await import(serverBuildPath);

console.log('\n=== Build Exports ===');
console.log(Object.keys(imported).join('\n'));

// Check for common Remix exports
const remixExports = [
  'createRequestHandler',
  'handleError',
  'handleRequest',
  'routes',
  'assets',
  'assetsBuildDirectory',
  'publicPath',
  'serverBuildPath'
];

console.log('\n=== Checking for Remix Exports ===');
remixExports.forEach(exp => {
  console.log(`${exp}: ${exp in imported ? '✅' : '❌'}`);
});

// If we have a createRequestHandler, try to inspect it
if (imported.createRequestHandler) {
  console.log('\n=== createRequestHandler Found ===');
  console.log('Type:', typeof imported.createRequestHandler);
  
  try {
    const handler = imported.createRequestHandler();
    console.log('Handler created successfully:', typeof handler === 'function');
  } catch (error) {
    console.error('Error creating request handler:', error.message);
  }
}

// Try to find routes in the build
console.log('\n=== Searching for Routes ===');
const findRoutes = (obj, path = '') => {
  if (!obj || typeof obj !== 'object') return;
  
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      if (typeof item === 'object' && item !== null) {
        findRoutes(item, `${path}[${i}]`);
      }
    });
    return;
  }
  
  for (const key in obj) {
    const value = obj[key];
    const currentPath = path ? `${path}.${key}` : key;
    
    if (key === 'routes' || key === 'manifest' || key === 'routeModules') {
      console.log(`\nFound potential routes object at: ${currentPath}`);
      console.log('Type:', Array.isArray(value) ? 'Array' : typeof value);
      console.log('Keys:', Object.keys(value).slice(0, 10).join(', ') + (Object.keys(value).length > 10 ? ', ...' : ''));
    }
    
    if (typeof value === 'object' && value !== null) {
      findRoutes(value, currentPath);
    }
  }
};

findRoutes(imported);

console.log('\nInspection complete.');
