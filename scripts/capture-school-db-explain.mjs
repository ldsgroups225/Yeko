#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Client } from 'pg'

const OUTPUT_DIR = process.env.SCHOOL_DB_EXPLAIN_DIR ?? 'docs/perf/db-observability'
const SAMPLE_LIMIT = Number.parseInt(process.env.SCHOOL_DB_EXPLAIN_SAMPLE_LIMIT ?? '100', 10)
const DATABASE_URL = resolveDatabaseUrl()

if (!DATABASE_URL) {
  console.error(
    'Missing database URL. Set SCHOOL_DB_EXPLAIN_DATABASE_URL / DATABASE_URL or DATABASE_HOST + DATABASE_USERNAME + DATABASE_PASSWORD.',
  )
  process.exit(1)
}

if (!Number.isFinite(SAMPLE_LIMIT) || SAMPLE_LIMIT <= 0) {
  console.error('SCHOOL_DB_EXPLAIN_SAMPLE_LIMIT must be a positive integer.')
  process.exit(1)
}

async function queryFirstValue(client, text, params = []) {
  const result = await client.query(text, params)
  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  const keys = Object.keys(row)
  if (keys.length === 0) {
    return null
  }

  return row[keys[0]] ?? null
}

function quantile(values, q) {
  if (values.length === 0) {
    return null
  }

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.floor((sorted.length - 1) * q)
  return sorted[index] ?? null
}

function collectPlanStats(planNode) {
  const summary = {
    totalNodes: 0,
    seqScanNodes: 0,
    indexScanNodes: 0,
    bitmapScanNodes: 0,
    totalSharedReadBlocks: 0,
    totalSharedHitBlocks: 0,
  }

  const visit = (node) => {
    if (!node || typeof node !== 'object') {
      return
    }

    summary.totalNodes += 1

    const nodeType = typeof node['Node Type'] === 'string' ? node['Node Type'] : ''
    if (nodeType === 'Seq Scan') {
      summary.seqScanNodes += 1
    }
    if (nodeType.includes('Index Scan')) {
      summary.indexScanNodes += 1
    }
    if (nodeType.includes('Bitmap')) {
      summary.bitmapScanNodes += 1
    }

    const sharedReadBlocks = Number(node['Shared Read Blocks'] ?? 0)
    const sharedHitBlocks = Number(node['Shared Hit Blocks'] ?? 0)
    summary.totalSharedReadBlocks += Number.isFinite(sharedReadBlocks) ? sharedReadBlocks : 0
    summary.totalSharedHitBlocks += Number.isFinite(sharedHitBlocks) ? sharedHitBlocks : 0

    const childPlans = Array.isArray(node.Plans) ? node.Plans : []
    for (const childPlan of childPlans) {
      visit(childPlan)
    }
  }

  visit(planNode)
  return summary
}

async function resolveSampleContext(client) {
  const schoolId = await queryFirstValue(client, 'SELECT id FROM schools ORDER BY created_at DESC LIMIT 1')
  if (!schoolId) {
    throw new Error('No school found. Seed a school before collecting explain snapshots.')
  }

  const schoolYearId = await queryFirstValue(
    client,
    `SELECT id
     FROM school_years
     WHERE school_id = $1
     ORDER BY is_active DESC, created_at DESC
     LIMIT 1`,
    [schoolId],
  )

  const classId = schoolYearId
    ? await queryFirstValue(
        client,
        `SELECT id
         FROM classes
         WHERE school_id = $1 AND school_year_id = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [schoolId, schoolYearId],
      )
    : null

  const termId = schoolYearId
    ? await queryFirstValue(
        client,
        `SELECT id
         FROM terms
         WHERE school_year_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [schoolYearId],
      )
    : null

  const teacherId = await queryFirstValue(
    client,
    'SELECT id FROM teachers WHERE school_id = $1 ORDER BY created_at DESC LIMIT 1',
    [schoolId],
  )

  const classroomId = await queryFirstValue(
    client,
    'SELECT id FROM classrooms WHERE school_id = $1 ORDER BY created_at DESC LIMIT 1',
    [schoolId],
  )

  const recentPaymentDate = await queryFirstValue(
    client,
    'SELECT payment_date FROM payments WHERE school_id = $1 ORDER BY payment_date DESC LIMIT 1',
    [schoolId],
  )

  return {
    schoolId,
    schoolYearId,
    classId,
    termId,
    teacherId,
    classroomId,
    recentPaymentDate,
  }
}

function buildTargets(context) {
  const rawTargets = [
    {
      id: 'payments.list.recent',
      sql: `
        SELECT p.id, p.payment_date, p.created_at, p.amount, p.status, s.first_name, s.last_name
        FROM payments p
        LEFT JOIN students s ON p.student_id = s.id
        WHERE p.school_id = $1
          AND ($2::date IS NULL OR p.payment_date >= $2::date)
        ORDER BY p.payment_date DESC, p.created_at DESC
        LIMIT $3
      `,
      params: [context.schoolId, context.recentPaymentDate, SAMPLE_LIMIT],
    },
    {
      id: 'payments.list.by_status',
      sql: `
        SELECT id, payment_date, amount, status
        FROM payments
        WHERE school_id = $1
          AND status = 'completed'
        ORDER BY payment_date DESC, created_at DESC
        LIMIT $2
      `,
      params: [context.schoolId, SAMPLE_LIMIT],
    },
    {
      id: 'students.list.by_year',
      sql: `
        SELECT st.id, st.last_name, st.first_name, st.matricule
        FROM students st
        LEFT JOIN enrollments e ON e.student_id = st.id AND e.status = 'confirmed'
        WHERE st.school_id = $1
          AND e.school_year_id = $2
        ORDER BY st.last_name ASC
        LIMIT $3
      `,
      params: [context.schoolId, context.schoolYearId, SAMPLE_LIMIT],
    },
    {
      id: 'classes.list.by_year',
      sql: `
        SELECT id, grade_id, series_id, section
        FROM classes
        WHERE school_id = $1
          AND school_year_id = $2
          AND status = 'active'
        ORDER BY created_at DESC
        LIMIT $3
      `,
      params: [context.schoolId, context.schoolYearId, SAMPLE_LIMIT],
    },
    {
      id: 'timetable.by_class',
      sql: `
        SELECT id, day_of_week, start_time, end_time
        FROM timetable_sessions
        WHERE class_id = $1
          AND school_year_id = $2
        ORDER BY day_of_week ASC, start_time ASC
        LIMIT $3
      `,
      params: [context.classId, context.schoolYearId, SAMPLE_LIMIT],
    },
    {
      id: 'timetable.by_teacher',
      sql: `
        SELECT id, day_of_week, start_time, end_time
        FROM timetable_sessions
        WHERE teacher_id = $1
          AND school_year_id = $2
        ORDER BY day_of_week ASC, start_time ASC
        LIMIT $3
      `,
      params: [context.teacherId, context.schoolYearId, SAMPLE_LIMIT],
    },
    {
      id: 'timetable.by_classroom',
      sql: `
        SELECT id, day_of_week, start_time, end_time
        FROM timetable_sessions
        WHERE classroom_id = $1
          AND school_year_id = $2
        ORDER BY day_of_week ASC, start_time ASC
        LIMIT $3
      `,
      params: [context.classroomId, context.schoolYearId, SAMPLE_LIMIT],
    },
    {
      id: 'report_cards.by_class_term',
      sql: `
        SELECT id, student_id, status, generated_at
        FROM report_cards
        WHERE class_id = $1
          AND term_id = $2
        ORDER BY created_at DESC
        LIMIT $3
      `,
      params: [context.classId, context.termId, SAMPLE_LIMIT],
    },
    {
      id: 'curriculum_progress.by_class_term',
      sql: `
        SELECT id, subject_id, status, progress_percentage
        FROM curriculum_progress
        WHERE class_id = $1
          AND term_id = $2
        ORDER BY calculated_at DESC
        LIMIT $3
      `,
      params: [context.classId, context.termId, SAMPLE_LIMIT],
    },
    {
      id: 'student_averages.by_class_term',
      sql: `
        SELECT id, student_id, weighted_average, rank_in_class
        FROM student_averages
        WHERE class_id = $1
          AND term_id = $2
          AND subject_id IS NULL
        ORDER BY weighted_average DESC NULLS LAST
        LIMIT $3
      `,
      params: [context.classId, context.termId, SAMPLE_LIMIT],
    },
  ]

  return rawTargets.filter(target =>
    target.params.every(param => param !== null && param !== undefined && param !== ''),
  )
}

async function captureExplain(client, target) {
  const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) ${target.sql}`
  const result = await client.query(explainQuery, target.params)
  const explainRoot = result.rows[0]?.['QUERY PLAN']?.[0]
  if (!explainRoot || typeof explainRoot !== 'object') {
    throw new Error(`Unexpected explain output for ${target.id}`)
  }

  const executionTimeMs = Number(explainRoot['Execution Time'] ?? 0)
  const planningTimeMs = Number(explainRoot['Planning Time'] ?? 0)
  const planTree = explainRoot.Plan
  const planStats = collectPlanStats(planTree)

  return {
    id: target.id,
    executionTimeMs: Number.isFinite(executionTimeMs) ? executionTimeMs : null,
    planningTimeMs: Number.isFinite(planningTimeMs) ? planningTimeMs : null,
    planStats,
    explain: explainRoot,
  }
}

function toIsoTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, '-')
}

function resolveDatabaseUrl() {
  const explicitUrl = process.env.SCHOOL_DB_EXPLAIN_DATABASE_URL ?? process.env.DATABASE_URL
  if (explicitUrl) {
    return explicitUrl
  }

  const host = process.env.DATABASE_HOST
  const username = process.env.DATABASE_USERNAME
  const password = process.env.DATABASE_PASSWORD
  if (!host || !username || !password) {
    return null
  }

  const encodedUsername = encodeURIComponent(username)
  const encodedPassword = encodeURIComponent(password)
  const databaseName = process.env.DATABASE_NAME ?? 'neondb'
  const sslMode = process.env.DATABASE_SSLMODE ?? 'verify-full'

  return `postgresql://${encodedUsername}:${encodedPassword}@${host}/${databaseName}?sslmode=${sslMode}`
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    statement_timeout: 60_000,
  })

  await client.connect()

  try {
    const context = await resolveSampleContext(client)
    const targets = buildTargets(context)

    if (targets.length === 0) {
      throw new Error('No explain targets were eligible. Check available seed data.')
    }

    const measurements = []

    for (const target of targets) {
      const result = await captureExplain(client, target)
      measurements.push(result)
      console.log(`Captured: ${target.id} (${result.executionTimeMs ?? 'n/a'} ms)`)
    }

    const executionTimes = measurements
      .map(item => item.executionTimeMs)
      .filter((value) => typeof value === 'number')

    const now = new Date()
    const timestamp = toIsoTimestamp(now)
    const outputDir = path.resolve(process.cwd(), OUTPUT_DIR)
    const outputFile = path.join(outputDir, `school-db-explain-${timestamp}.json`)
    const latestFile = path.join(outputDir, 'latest.json')

    const payload = {
      capturedAt: now.toISOString(),
      sampleLimit: SAMPLE_LIMIT,
      context,
      summary: {
        targetCount: measurements.length,
        p50ExecutionMs: quantile(executionTimes, 0.5),
        p95ExecutionMs: quantile(executionTimes, 0.95),
        maxExecutionMs: executionTimes.length > 0 ? Math.max(...executionTimes) : null,
      },
      measurements,
    }

    await fs.mkdir(outputDir, { recursive: true })
    await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    await fs.writeFile(latestFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

    console.log(`Wrote snapshot: ${outputFile}`)
    console.log(`Updated latest: ${latestFile}`)
  }
  finally {
    await client.end()
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Failed to capture explain snapshots: ${message}`)
  process.exit(1)
})
