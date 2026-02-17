import { createFileRoute } from '@tanstack/react-router'
import { protectedRequestMiddleware } from '@/core/middleware/auth'
import { getPolar } from '@/lib/polar'

export const Route = createFileRoute('/_auth/app/polar/portal')({
  server: {
    middleware: [protectedRequestMiddleware],
    handlers: {
      GET: async (ctx) => {
        const polar = await getPolar()
        const customerSession = await polar.customerSessions.create({
          externalCustomerId: ctx.context.userId,
        })
        return new Response(null, {
          status: 302,
          headers: {
            Location: customerSession.customerPortalUrl,
          },
        })
      },
    },
  },
})
