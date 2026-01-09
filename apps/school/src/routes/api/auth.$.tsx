// src/routes/api/auth.$.tsx

import { getAuth } from '@repo/data-ops/auth/server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => {
        const auth = getAuth()
        return auth.handler(request)
      },

      POST: ({ request }: { request: Request }) => {
        const auth = getAuth()
        return auth.handler(request)
      },
    },
  },
})
