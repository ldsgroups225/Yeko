import type { School } from '../drizzle/core-schema'
import { z } from 'zod'

// Dashboard Stats Schema
export const DashboardStatsSchema = z.object({
  daysBack: z.number().min(1).max(365).optional().default(30),
})

// Recent Activity Schema
export const RecentActivitySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
})

// Types
export interface DashboardStats {
  totalSchools: number
  activeSchools: number
  recentRegistrations: number
  inactiveSchools: number
  recentSchools: School[]
}

export interface SystemHealth {
  database: {
    status: 'healthy' | 'unhealthy'
    latency: string
  }
  api: {
    status: 'healthy' | 'unhealthy'
    uptime: string
  }
  storage: {
    status: 'healthy' | 'unhealthy'
    usage: string
  }
}

export interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
  user: string
  resource?: string
  resourceId?: string
}
