/**
 * Script to convert react-i18next t('key.path') calls to typesafe-i18n t.key.path() format
 *
 * Usage: node scripts/convert-i18n.mjs
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SRC_DIR = path.join(__dirname, '../src')

// Regex patterns for different t() call formats
const patterns = {
  // Simple: t('key.path')
  simple: /\bt\('([^']+)'\)/g,
  // With params: t('key.path', { param: value })
  withParams: /\bt\('([^']+)',\s*(\{[^}]+\})\)/g,
  // Double quotes simple: t("key.path")
  simpleDouble: /\bt\("([^"]+)"\)/g,
  // Double quotes with params: t("key.path", { param: value })
  withParamsDouble: /\bt\("([^"]+)",\s*(\{[^}]+\})\)/g,
}

const reservedWords = new Set([
  'delete',
  'class',
  'export',
  'import',
  'default',
  'new',
  'return',
  'switch',
  'case',
  'break',
  'continue',
  'for',
  'while',
  'if',
  'else',
  'try',
  'catch',
  'finally',
  'throw',
  'typeof',
  'instanceof',
  'void',
  'null',
  'undefined',
  'true',
  'false',
  'in',
  'of',
  'with',
  'function',
  'var',
  'let',
  'const',
  'enum',
  'interface',
  'type',
  'namespace',
  'module',
  'declare',
  'abstract',
  'as',
  'async',
  'await',
  'constructor',
  'get',
  'set',
  'static',
  'public',
  'private',
  'protected',
  'readonly',
  'super',
  'this',
  'yield',
])

function convertKeyToPath(key) {
  const parts = key.split('.')

  return parts.map((part, index) => {
    // If part is a reserved word or contains special characters, use bracket notation
    if (reservedWords.has(part) || !/^[a-z_$][\w$]*$/i.test(part)) {
      return `['${part}']`
    }
    return index === 0 ? part : `.${part}`
  }).join('')
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  const originalContent = content
  let changes = 0

  // Process t('key', { params }) first (more specific pattern)
  content = content.replace(patterns.withParams, (_match, key, params) => {
    changes++
    const pathStr = convertKeyToPath(key)
    return `t.${pathStr}(${params})`
  })

  content = content.replace(patterns.withParamsDouble, (_match, key, params) => {
    changes++
    const pathStr = convertKeyToPath(key)
    return `t.${pathStr}(${params})`
  })

  // Then process simple t('key') calls
  content = content.replace(patterns.simple, (_match, key) => {
    changes++
    const pathStr = convertKeyToPath(key)
    return `t.${pathStr}()`
  })

  content = content.replace(patterns.simpleDouble, (_match, key) => {
    changes++
    const pathStr = convertKeyToPath(key)
    return `t.${pathStr}()`
  })

  const modified = content !== originalContent
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  return { modified, changes }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      // Skip node_modules and i18n directories
      if (file !== 'node_modules' && file !== 'i18n') {
        walkDir(filePath, callback)
      }
    }
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Skip .d.ts files
      if (!file.endsWith('.d.ts')) {
        callback(filePath)
      }
    }
  }
}

function main() {
  console.log('Converting i18n calls from t(\'key\') to t.key() format...\n')

  let totalFiles = 0
  let modifiedFiles = 0
  let totalChanges = 0

  walkDir(SRC_DIR, (filePath) => {
    totalFiles++
    const { modified, changes } = processFile(filePath)
    if (modified) {
      modifiedFiles++
      totalChanges += changes
      const relativePath = path.relative(SRC_DIR, filePath)
      console.log(`✓ ${relativePath} (${changes} changes)`)
    }
  })

  console.log('\n--- Summary ---')
  console.log(`Total files scanned: ${totalFiles}`)
  console.log(`Files modified: ${modifiedFiles}`)
  console.log(`Total changes: ${totalChanges}`)
}

main()
