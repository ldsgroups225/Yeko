import process from 'node:process'
import { initDatabase } from '@repo/data-ops/database/setup'
import { createMiddleware } from '@tanstack/react-start'

export const exampleMiddlewareWithContext = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  // Initialize database connection
  initDatabase({
    host: process.env.DATABASE_HOST || '',
    username: process.env.DATABASE_USERNAME || '',
    password: process.env.DATABASE_PASSWORD || '',
  })

  return await next({
    context: {
      data: 'Some Data From Middleware',
    },
  })
})
