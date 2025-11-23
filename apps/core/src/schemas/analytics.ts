import { z } from 'zod'

export const AnalyticsTimeRangeSchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
})

export const GenerateReportSchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  format: z.enum(['pdf', 'excel']).default('pdf'),
})

export type AnalyticsTimeRangeInput = z.infer<typeof AnalyticsTimeRangeSchema>
export type GenerateReportInput = z.infer<typeof GenerateReportSchema>
