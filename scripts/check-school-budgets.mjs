import { access, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const budgets = {
  clientTotalJsBytes: 5_800_000,
  clientTotalCssBytes: 300_000,
  clientLargestChunkBytes: 1_350_000,
  serverTotalJsBytes: 14_500_000,
  serverLargestChunkBytes: 3_300_000,
}

/**
 * @param {string} dir
 */
async function getAssetSizes(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = entries
    .filter(entry => entry.isFile())
    .map(entry => entry.name)

  const assets = await Promise.all(
    files.map(async (name) => {
      const fullPath = path.join(dir, name)
      const details = await stat(fullPath)
      return { name, size: details.size }
    }),
  )

  return assets
}

/**
 * @param {Array<{name: string, size: number}>} assets
 */
function summarizeAssets(assets) {
  const jsAssets = assets.filter(asset => asset.name.endsWith('.js'))
  const cssAssets = assets.filter(asset => asset.name.endsWith('.css'))

  const totalJsBytes = jsAssets.reduce((sum, asset) => sum + asset.size, 0)
  const totalCssBytes = cssAssets.reduce((sum, asset) => sum + asset.size, 0)
  const largestJsChunk = jsAssets.reduce(
    (largest, current) => (current.size > largest.size ? current : largest),
    { name: 'n/a', size: 0 },
  )

  return { totalJsBytes, totalCssBytes, largestJsChunk }
}

/**
 * @param {string} label
 * @param {number} value
 * @param {number} threshold
 */
function assertBudget(label, value, threshold) {
  if (value > threshold) {
    return `${label}: ${value} > ${threshold}`
  }
  return null
}

async function main() {
  const schoolRoot = await resolveSchoolRoot()
  const clientAssetsDir = path.join(schoolRoot, 'dist/client/assets')
  const serverAssetsDir = path.join(schoolRoot, 'dist/server/assets')

  const clientAssets = await getAssetSizes(clientAssetsDir)
  const serverAssets = await getAssetSizes(serverAssetsDir)

  const clientSummary = summarizeAssets(clientAssets)
  const serverSummary = summarizeAssets(serverAssets)

  const reportLines = [
    'School Performance Budget Report',
    `- client total JS: ${clientSummary.totalJsBytes} bytes`,
    `- client total CSS: ${clientSummary.totalCssBytes} bytes`,
    `- client largest JS chunk: ${clientSummary.largestJsChunk.name} (${clientSummary.largestJsChunk.size} bytes)`,
    `- server total JS: ${serverSummary.totalJsBytes} bytes`,
    `- server largest JS chunk: ${serverSummary.largestJsChunk.name} (${serverSummary.largestJsChunk.size} bytes)`,
  ]

  for (const line of reportLines) {
    console.log(line)
  }

  const failures = [
    assertBudget('clientTotalJsBytes', clientSummary.totalJsBytes, budgets.clientTotalJsBytes),
    assertBudget('clientTotalCssBytes', clientSummary.totalCssBytes, budgets.clientTotalCssBytes),
    assertBudget(
      'clientLargestChunkBytes',
      clientSummary.largestJsChunk.size,
      budgets.clientLargestChunkBytes,
    ),
    assertBudget('serverTotalJsBytes', serverSummary.totalJsBytes, budgets.serverTotalJsBytes),
    assertBudget(
      'serverLargestChunkBytes',
      serverSummary.largestJsChunk.size,
      budgets.serverLargestChunkBytes,
    ),
  ].filter(message => message !== null)

  if (failures.length > 0) {
    console.error('\nBudget failures:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }
}

async function resolveSchoolRoot() {
  const cwd = process.cwd()
  const directPath = path.join(cwd, 'dist')
  const nestedPath = path.join(cwd, 'apps/school/dist')

  try {
    await access(directPath)
    return cwd
  }
  catch {
    await access(nestedPath)
    return path.join(cwd, 'apps/school')
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown budget checker error'
  console.error(`Budget checker failed: ${message}`)
  process.exit(1)
})
