import { vi } from 'vitest'

const queryResult = [
  { id: '1' },
  { id: 'valid-year-id' },
  { id: 'valid-subject-id' },
  { id: 'valid-grade-id' },
]

function createBuilder() {
  const builder: any = [...queryResult]

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

  builder.then = vi.fn().mockImplementation((onFulfilled: any, onRejected?: any) => {
    return Promise.resolve([...queryResult]).then(onFulfilled, onRejected)
  })

  return builder
}

export const getDb = vi.fn(() => {
  const db = createBuilder()
  db.transaction = vi.fn().mockImplementation((cb: any) => cb(db))
  return db
})

export const initDatabase = vi.fn()
