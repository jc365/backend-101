import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Archivos a procesar
const filesToFix = [
  'src/core/config/index.js',
  'src/core/config/middleware/configMiddleware.js',
  'src/test-config.js'
];

// Patrones de búsqueda y reemplazo
const replacements = [
  // require('../../../config') -> require('../index')
  {
    pattern: /require\s*\(\s*['"]\.\.\/\.\.\/\.\.\/config['"]\s*\)/g,
    replacement: "require('../index')"
  },
  // require('../../config') -> require('../../core/config')
  {
    pattern: /require\s*\(\s*['"]\.\.\/\.\.\/config['"]\s*\)/g,
    replacement: "require('../../core/config')"
  },
  // require('../config') -> require('../core/config')
  {
    pattern: /require\s*\(\s*['"]\.\.\/config['"]\s*\)/g,
    replacement: "require('../core/config')"
  },
  // require('./config') -> require('./core/config')
  {
    pattern: /require\s*\(\s*['"]\.\/config['"]\s*\)/g,
    replacement: "require('./core/config')"
  },
  // path.join(__dirname, '../../../config') -> require('../index')
  {
    pattern: /require\s*\(\s*path\.join\s*\(\s*__dirname\s*,\s*['"]\.\.\/\.\.\/\.\.\/config['"]\s*\)\s*\)/g,
    replacement: "require('../index')"
  },
  // path.join(__dirname, '../../core/config/loaders/...') -> require('./loaders/...')
  {
    pattern: /require\s*\(\s*path\.join\s*\(\s*__dirname\s*,\s*['"][^'"]*\/core\/config\/loaders\/([^'"]+)['"]\s*\)\s*\)/g,
    replacement: "require('./loaders/$1')"
  },
  // path.join(__dirname, '../core/config/schemas/...') -> require('./schemas/...')
  {
    pattern: /require\s*\(\s*path\.join\s*\(\s*__dirname\s*,\s*['"][^'"]*\/core\/config\/schemas\/([^'"]+)['"]\s*\)\s*\)/g,
    replacement: "require('./schemas/$1')"
  }
];

console.log('🔧 Corrigiendo rutas de importación...\n');

let totalFixed = 0;

for (const filePath of filesToFix) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No encontrado: ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileFixed = 0;
  
  for (const { pattern, replacement } of replacements) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileFixed += matches.length;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${fileFixed} cambios`);
    totalFixed += fileFixed;
  } else {
    console.log(`➖ ${path.relative(process.cwd(), filePath)}: sin cambios`);
  }
}

console.log(`\n🎉 Total: ${totalFixed} rutas corregidas`);