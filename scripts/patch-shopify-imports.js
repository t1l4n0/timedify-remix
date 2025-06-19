import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(
  __dirname,
  '../node_modules/@shopify/shopify-app-remix/dist/esm/react/components/AppProvider/AppProvider.mjs'
);

// Only proceed if the file exists
if (existsSync(filePath)) {
  try {
    // Read the file content
    let content = readFileSync(filePath, 'utf8');
    
    // Replace the problematic import
    const fixedContent = content.replace(
      /import\s+([\w{}\s,]+)\s+from\s+['"]([^'"]+)['"]\s+with\s+\{\s*type:\s*['"]json['"]\s*\};?/g,
      'import $1 from "$2";'
    );
    
    // Write the fixed content back to the file
    if (content !== fixedContent) {
      writeFileSync(filePath, fixedContent, 'utf8');
      console.log('✅ Successfully patched Shopify AppProvider.mjs');
    } else {
      console.log('ℹ️ No changes needed for Shopify AppProvider.mjs');
    }
  } catch (error) {
    console.error('❌ Error patching Shopify AppProvider.mjs:', error);
    process.exit(1);
  }
} else {
  console.warn('⚠️  Shopify AppProvider.mjs not found at:', filePath);
}
