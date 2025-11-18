import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { exampleMiddlewareWithContext } from '@/core/middleware/example-middleware'
// import { env } from "cloudflare:workers";

const baseFunction = createServerFn().middleware([
  exampleMiddlewareWithContext,
])

const ExampleInputSchema = z.object({
  exampleKey: z.string().min(1),
})

type ExampleInput = z.infer<typeof ExampleInputSchema>

export const examplefunction = baseFunction
  .inputValidator((data: ExampleInput) => ExampleInputSchema.parse(data))
  .handler(async (ctx) => {
    console.warn('Executing example function')
    console.warn(`The data passed: ${JSON.stringify(ctx.data)}`)
    console.warn(`The context from middleware: ${JSON.stringify(ctx.context)}`)
    // console.warn(`The Cloudflare Worker Environment: ${JSON.stringify(env)}`);
    return 'Function executed successfully'
  })
