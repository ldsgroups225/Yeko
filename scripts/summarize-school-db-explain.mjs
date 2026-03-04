#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_DIR = 'docs/perf/db-observability'
const INPUT_PATH = process.env.SCHOOL_DB_EXPLAIN_INPUT ?? path.join(DEFAULT_DIR, 'latest.json')
const BASELINE_PATH = process.env.SCHOOL_DB_EXPLAIN_BASELINE
const OUTPUT_PATH = process.env.SCHOOL_DB_EXPLAIN_SUMMARY_OUTPUT ?? path.join(DEFAULT_DIR, 'latest-summary.md')
const ENFORCE_SLO = process.env.SCHOOL_DB_EXPLAIN_ENFORCE_SLO === 'true'

// SLO thresholds
const SLO_P95_MS = 100
const SLO_MAX_SEQ_SCAN_HEAVY = 0
const SLO_MIN_TARGETS = 8

function formatMs(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'n/a'
  }
  return `${value.toFixed(2)} ms`
}

function formatNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'n/a'
  }
  return `${value}`
}

function statusFromPlanStats(stats) {
  if (!stats) {
    return 'unknown'
  }
  if (stats.seqScanNodes === 0 && stats.indexScanNodes > 0) {
    return 'index-friendly'
  }
  if (stats.seqScanNodes > 0 && stats.indexScanNodes === 0) {
    return 'seq-scan-heavy'
  }
  if (stats.seqScanNodes > 0 && stats.indexScanNodes > 0) {
    return 'mixed'
  }
  return 'unknown'
}

function quantile(values, q) {
  if (!Array.isArray(values) || values.length === 0) {
    return null
  }
  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.floor((sorted.length - 1) * q)
  return sorted[index] ?? null
}

function getMeasurements(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.measurements)) {
    return []
  }
  return payload.measurements
}

function getExecutionTimes(measurements) {
  return measurements
    .map(measurement => measurement.executionTimeMs)
    .filter(value => typeof value === 'number' && Number.isFinite(value))
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

function buildDetailsTable(measurements) {
  const lines = [
    '| Target | Execution | Planning | Seq Scans | Index Scans | Shared Reads | Shared Hits | Plan Status |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ]

  for (const measurement of measurements) {
    const stats = measurement.planStats
    lines.push(
      `| ${measurement.id} | ${formatMs(measurement.executionTimeMs)} | ${formatMs(measurement.planningTimeMs)} | ${formatNumber(stats?.seqScanNodes)} | ${formatNumber(stats?.indexScanNodes)} | ${formatNumber(stats?.totalSharedReadBlocks)} | ${formatNumber(stats?.totalSharedHitBlocks)} | ${statusFromPlanStats(stats)} |`,
    )
  }

  return lines.join('\n')
}

function buildPaymentFocusSection(measurements) {
  const paymentTargets = measurements.filter(measurement => measurement.id.startsWith('payments.'))
  if (paymentTargets.length === 0) {
    return [
      '## Payment Read-Path Focus',
      '',
      'No `payments.*` targets found in this snapshot.',
      '',
    ].join('\n')
  }

  const lines = [
    '## Payment Read-Path Focus',
    '',
    '| Target | Execution | Seq Scans | Index Scans | Status |',
    '| --- | ---: | ---: | ---: | --- |',
  ]

  for (const measurement of paymentTargets) {
    const stats = measurement.planStats
    lines.push(
      `| ${measurement.id} | ${formatMs(measurement.executionTimeMs)} | ${formatNumber(stats?.seqScanNodes)} | ${formatNumber(stats?.indexScanNodes)} | ${statusFromPlanStats(stats)} |`,
    )
  }

  return `${lines.join('\n')}\n`
}

function buildBaselineSection(currentPayload, currentMeasurements, baselinePayload, baselineMeasurements) {
  const lines = [
    '## Baseline Delta',
    '',
    `Baseline file: \`${BASELINE_PATH}\``,
    '',
    '| Metric | Baseline | Current | Delta |',
    '| --- | ---: | ---: | ---: |',
  ]

  const baselineTimes = getExecutionTimes(baselineMeasurements)
  const currentTimes = getExecutionTimes(currentMeasurements)
  const baselineP50 = quantile(baselineTimes, 0.5)
  const baselineP95 = quantile(baselineTimes, 0.95)
  const currentP50 = quantile(currentTimes, 0.5)
  const currentP95 = quantile(currentTimes, 0.95)

  const baselineCount = baselinePayload?.summary?.targetCount ?? baselineMeasurements.length
  const currentCount = currentPayload?.summary?.targetCount ?? currentMeasurements.length

  function formatDelta(current, baseline, suffix = '') {
    if (typeof current !== 'number' || typeof baseline !== 'number') {
      return 'n/a'
    }
    const delta = current - baseline
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}${suffix}`
  }

  lines.push(`| Target count | ${formatNumber(baselineCount)} | ${formatNumber(currentCount)} | ${formatDelta(currentCount, baselineCount)} |`)
  lines.push(`| p50 execution | ${formatMs(baselineP50)} | ${formatMs(currentP50)} | ${formatDelta(currentP50, baselineP50, ' ms')} |`)
  lines.push(`| p95 execution | ${formatMs(baselineP95)} | ${formatMs(currentP95)} | ${formatDelta(currentP95, baselineP95, ' ms')} |`)

  lines.push('')
  lines.push('| Target | Baseline Execution | Current Execution | Delta |')
  lines.push('| --- | ---: | ---: | ---: |')

  const baselineById = new Map(baselineMeasurements.map(measurement => [measurement.id, measurement]))
  for (const current of currentMeasurements) {
    const baseline = baselineById.get(current.id)
    lines.push(
      `| ${current.id} | ${formatMs(baseline?.executionTimeMs)} | ${formatMs(current.executionTimeMs)} | ${formatDelta(current.executionTimeMs, baseline?.executionTimeMs, ' ms')} |`,
    )
  }

  lines.push('')
  return lines.join('\n')
}

async function main() {
  const absoluteInput = path.resolve(process.cwd(), INPUT_PATH)
  const absoluteOutput = path.resolve(process.cwd(), OUTPUT_PATH)
  const payload = await readJson(absoluteInput)
  const measurements = getMeasurements(payload)

  if (measurements.length === 0) {
    throw new Error(`No measurements found in ${absoluteInput}`)
  }

  const executionTimes = getExecutionTimes(measurements)
  const p50ExecutionMs = quantile(executionTimes, 0.5)
  const p95ExecutionMs = quantile(executionTimes, 0.95)
  const maxExecutionMs = executionTimes.length > 0 ? Math.max(...executionTimes) : null

  const lines = [
    '# apps/school DB Explain Summary',
    '',
    `Input file: \`${INPUT_PATH}\``,
    `Captured at: ${payload.capturedAt ?? 'unknown'}`,
    '',
    '## Snapshot Overview',
    '',
    `- Targets captured: ${payload?.summary?.targetCount ?? measurements.length}`,
    `- p50 execution: ${formatMs(p50ExecutionMs)}`,
    `- p95 execution: ${formatMs(p95ExecutionMs)}`,
    `- max execution: ${formatMs(maxExecutionMs)}`,
    '',
    '## Query Details',
    '',
    buildDetailsTable(measurements),
    '',
    buildPaymentFocusSection(measurements),
  ]

  if (BASELINE_PATH) {
    const absoluteBaseline = path.resolve(process.cwd(), BASELINE_PATH)
    const baselinePayload = await readJson(absoluteBaseline)
    const baselineMeasurements = getMeasurements(baselinePayload)
    lines.push(buildBaselineSection(payload, measurements, baselinePayload, baselineMeasurements))
  }

  // SLO checks
  const seqScanHeavyCount = measurements.filter(
    measurement => statusFromPlanStats(measurement.planStats) === 'seq-scan-heavy',
  ).length
  const targetCount = measurements.length

  const sloResults = [
    {
      label: `p95 execution < ${SLO_P95_MS} ms`,
      passed: typeof p95ExecutionMs === 'number' && p95ExecutionMs < SLO_P95_MS,
      actual: formatMs(p95ExecutionMs),
    },
    {
      label: `seq-scan-heavy targets = ${SLO_MAX_SEQ_SCAN_HEAVY}`,
      passed: seqScanHeavyCount <= SLO_MAX_SEQ_SCAN_HEAVY,
      actual: `${seqScanHeavyCount}`,
    },
    {
      label: `targets captured >= ${SLO_MIN_TARGETS}`,
      passed: targetCount >= SLO_MIN_TARGETS,
      actual: `${targetCount}`,
    },
  ]

  lines.push('## Performance SLOs')
  lines.push('')
  lines.push('| SLO | Status | Actual |')
  lines.push('| --- | --- | ---: |')
  for (const slo of sloResults) {
    const icon = slo.passed ? '✅' : '❌'
    lines.push(`| ${slo.label} | ${icon} | ${slo.actual} |`)
  }
  lines.push('')

  const allPassed = sloResults.every(slo => slo.passed)
  if (!allPassed) {
    lines.push('> ⚠️ One or more SLOs did not pass. Review query plans above.')
    lines.push('')
  }

  const content = `${lines.join('\n')}\n`
  await fs.mkdir(path.dirname(absoluteOutput), { recursive: true })
  await fs.writeFile(absoluteOutput, content, 'utf8')

  console.log(`Wrote summary: ${absoluteOutput}`)

  if (!allPassed && ENFORCE_SLO) {
    console.error('SLO check failed. Set SCHOOL_DB_EXPLAIN_ENFORCE_SLO=false to skip enforcement.')
    process.exit(2)
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Failed to summarize explain snapshot: ${message}`)
  process.exit(1)
})
