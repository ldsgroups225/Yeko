import { z } from 'zod'

export const DashboardStatsSchema = z.object({
  daysBack: z.number().optional().default(30),
})

export const RecentActivitySchema = z.object({
  limit: z.number().optional().default(10),
  daysBack: z.number().optional().default(7),
})

export type DashboardStatsInput = z.infer<typeof DashboardStatsSchema>
export type RecentActivityInput = z.infer<typeof RecentActivitySchema>
