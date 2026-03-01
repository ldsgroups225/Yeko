import type { Mock } from 'vitest'
import { vi } from 'vitest'

const queryResult = [
  { id: '1' },
  { id: 'valid-year-id' },
  { id: 'valid-subject-id' },
  { id: 'valid-grade-id' },
]

function createBuilder() {
  const queryResultArr = [...queryResult]
  const builder = queryResultArr as unknown as Record<string, any> // Still need some dynamic access but will cast internal mock

  const methods = [
    'select',
    'from',
    'where',
    'limit',
    'offset',
    'orderBy',
    'leftJoin',
    'innerJoin',
    'groupBy',
    'having',
    'insert',
    'values',
    'returning',
    'update',
    'set',
    'delete',
    'execute',
  ]

  methods.forEach((m) => {
    builder[m] = vi.fn().mockImplementation(() => builder)
  })

  builder.then = vi.fn().mockImplementation((onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) => {
    return Promise.resolve([...queryResult]).then(onFulfilled, onRejected)
  })

  return builder as any // Let's try to reach a compromise here or define the full type
}

export const getDb = vi.fn(() => {
  const db = createBuilder()
  db.transaction = vi.fn().mockImplementation((cb: (db: any) => any) => cb(db))
  return db
})

export const initDatabase = vi.fn() as Mock
