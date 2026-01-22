import { z } from 'zod'

// Ticket schemas
export const TicketFiltersSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.enum(['technical', 'feature', 'bug', 'billing', 'account', 'other']).optional(),
  assigneeId: z.string().optional(),
  schoolId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export const CreateTicketSchema = z.object({
  schoolId: z.string().optional(),
  userId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['technical', 'feature', 'bug', 'billing', 'account', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
})

export const UpdateTicketSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['technical', 'feature', 'bug', 'billing', 'account', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  assigneeId: z.string().optional(),
  resolution: z.string().optional(),
  satisfactionRating: z.number().min(1).max(5).optional(),
})

export type TicketFiltersInput = z.infer<typeof TicketFiltersSchema>
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>

// Contact schemas
export const CreateContactSchema = z.object({
  schoolId: z.string().optional(),
  contactName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.enum(['director', 'admin', 'teacher', 'parent', 'staff', 'other']).optional(),
  notes: z.string().optional(),
})

export const UpdateContactSchema = z.object({
  id: z.string(),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.enum(['director', 'admin', 'teacher', 'parent', 'staff', 'other']).optional(),
  notes: z.string().optional(),
  nextFollowUp: z.date().optional(),
})

export type CreateContactInput = z.infer<typeof CreateContactSchema>
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>

// Activity schemas
export const CreateActivitySchema = z.object({
  contactId: z.string(),
  schoolId: z.string().optional(),
  userId: z.string().optional(),
  type: z.enum(['call', 'email', 'meeting', 'note', 'ticket', 'other']),
  subject: z.string().optional(),
  description: z.string().optional(),
  outcome: z.string().optional(),
  nextFollowUp: z.date().optional(),
})

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>

// Task schemas
export const CreateTaskSchema = z.object({
  contactId: z.string().optional(),
  schoolId: z.string().optional(),
  userId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
})

export const UpdateTaskSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
