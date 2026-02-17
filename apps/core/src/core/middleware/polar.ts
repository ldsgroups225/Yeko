import { createMiddleware } from '@tanstack/react-start'
import { getPolar } from '@/lib/polar'

export const polarMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const polar = await getPolar()
  return next({
    context: {
      polar,
    },
  })
})
