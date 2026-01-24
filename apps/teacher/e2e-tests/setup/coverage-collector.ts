import fs from 'node:fs'
import path from 'node:path'
import { v8Coverage } from 'v8-coverage'

const COVERAGE_DIR = './coverage'
const COVERAGE_FILE = path.join(COVERAGE_DIR, 'coverage.json')

export async function collectCoverage(): Promise<void> {
  // Ensure coverage directory exists
  if (!fs.existsSync(COVERAGE_DIR)) {
    fs.mkdirSync(COVERAGE_DIR, { recursive: true })
  }

  console.warn('\n📊 Collecting V8 coverage data...')

  // Collect coverage from all pages
  const coverage = await v8Coverage.dumpCoverage()

  if (coverage && coverage.length > 0) {
    fs.writeFileSync(COVERAGE_FILE, JSON.stringify(coverage, null, 2))
    console.warn(`✓ Coverage saved to ${COVERAGE_FILE}`)

    // Calculate summary
    const totalFiles = coverage.length
    const totalStatements = coverage.reduce(
      (acc, file) => acc + (file.statements?.length || 0),
      0,
    )
    const coveredStatements = coverage.reduce(
      (acc, file) =>
        acc + (file.statements?.filter(s => s.count > 0).length || 0),
      0,
    )

    console.warn(`\n📈 Coverage Summary:`)
    console.warn(`   Files analyzed: ${totalFiles}`)
    console.warn(`   Total statements: ${totalStatements}`)
    console.warn(`   Covered statements: ${coveredStatements}`)
    console.warn(
      `   Coverage: ${((coveredStatements / totalStatements) * 100).toFixed(2)}%`,
    )
  }
  else {
    console.warn('⚠️  No coverage data collected')
  }
}

export default collectCoverage
