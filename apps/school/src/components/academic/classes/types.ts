import type { getClasses } from '@/school/functions/classes'

export type ClassItem = Extract<Awaited<ReturnType<typeof getClasses>>, { success: true }>['data'][number]
