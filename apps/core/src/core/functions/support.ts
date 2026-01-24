import {
  createCrmActivity,
  createCrmContact,
  createCrmTask,
  createTicket,
  getCrmActivities,
  getCrmContacts,
  getCrmTasks,
  getKnowledgeBaseArticles,
  getRecentTickets,
  getTicketById,
  getTickets,
  getTicketStats,
  updateCrmContact,
  updateCrmTask,
  updateTicket,
} from '@repo/data-ops/queries/support'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'
import {
  CreateActivitySchema,
  CreateContactSchema,
  CreateTaskSchema,
  CreateTicketSchema,
  TicketFiltersSchema,
  UpdateContactSchema,
  UpdateTaskSchema,
  UpdateTicketSchema,
} from '@/schemas/support'

// ===== TICKET FUNCTIONS =====

const TicketIdInputSchema = z.object({ id: z.string() })
type TicketIdInput = z.infer<typeof TicketIdInputSchema>

const SchoolIdInputSchema = z.object({ schoolId: z.string().optional() })
type SchoolIdInput = z.infer<typeof SchoolIdInputSchema>

const LimitInputSchema = z.object({ limit: z.number().optional() })
type LimitInput = z.infer<typeof LimitInputSchema>

export const ticketsQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => TicketFiltersSchema.parse(data))
  .handler(async (ctx) => {
    const filters = ctx.data as z.infer<typeof TicketFiltersSchema>
    return await getTickets(filters, filters.limit ?? 50, filters.offset ?? 0)
  })

export const ticketByIdQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => TicketIdInputSchema.parse(data))
  .handler(async (ctx) => {
    const { id } = ctx.data as TicketIdInput
    return await getTicketById(id)
  })

export const ticketStatsQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => SchoolIdInputSchema.parse(data))
  .handler(async (ctx) => {
    const { schoolId } = ctx.data as SchoolIdInput
    return await getTicketStats(schoolId)
  })

export const recentTicketsQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => LimitInputSchema.parse(data))
  .handler(async (ctx) => {
    const { limit } = ctx.data as LimitInput
    return await getRecentTickets(limit ?? 5)
  })

export const createTicketMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => CreateTicketSchema.parse(data))
  .handler(async (ctx) => {
    return await createTicket(ctx.data)
  })

export const updateTicketMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => UpdateTicketSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateTicket(id, updateData)
  })

// ===== KNOWLEDGE BASE FUNCTIONS =====

export const knowledgeBaseQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async () => {
    return await getKnowledgeBaseArticles({}, 20, 0)
  })

// ===== CRM CONTACTS FUNCTIONS =====

const ContactFiltersInputSchema = z.object({}).passthrough()

export const contactsQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => ContactFiltersInputSchema.parse(data))
  .handler(async (ctx) => {
    return await getCrmContacts(ctx.data, 50, 0)
  })

const ContactIdInputSchema = z.object({ id: z.string() })
type ContactIdInput = z.infer<typeof ContactIdInputSchema>

export const contactByIdQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => ContactIdInputSchema.parse(data))
  .handler(async (ctx) => {
    const { id } = ctx.data as ContactIdInput
    const { contacts } = await getCrmContacts({ search: '' }, 1, 0)
    const contact = contacts.find(
      (c): c is NonNullable<typeof c> => c.id === id,
    )
    return contact ?? null
  })

export const createContactMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => CreateContactSchema.parse(data))
  .handler(async (ctx) => {
    return await createCrmContact(ctx.data)
  })

export const updateContactMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => UpdateContactSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateCrmContact(id, updateData)
  })

// ===== CRM ACTIVITIES FUNCTIONS =====

const ActivityFiltersInputSchema = z.object({
  contactId: z.string().optional(),
  schoolId: z.string().optional(),
})
type ActivityFiltersInput = z.infer<typeof ActivityFiltersInputSchema>

export const activitiesQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => ActivityFiltersInputSchema.parse(data))
  .handler(async (ctx) => {
    const { contactId, schoolId } = ctx.data as ActivityFiltersInput
    return await getCrmActivities(contactId, schoolId, 20)
  })

export const createActivityMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => CreateActivitySchema.parse(data))
  .handler(async (ctx) => {
    return await createCrmActivity(ctx.data)
  })

// ===== CRM TASKS FUNCTIONS =====

export const tasksQuery = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async (ctx) => {
    const filters = ctx.data ?? {}
    return await getCrmTasks(filters as Record<string, unknown>, 50, 0)
  })

export const createTaskMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => CreateTaskSchema.parse(data))
  .handler(async (ctx) => {
    return await createCrmTask(ctx.data)
  })

export const updateTaskMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => UpdateTaskSchema.parse(data))
  .handler(async (ctx) => {
    const { id, ...updateData } = ctx.data
    return await updateCrmTask(id, updateData)
  })

const TaskIdInputSchema = z.object({ id: z.string() })
type TaskIdInput = z.infer<typeof TaskIdInputSchema>

export const completeTaskMutation = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator(data => TaskIdInputSchema.parse(data))
  .handler(async (ctx) => {
    const { id } = ctx.data as TaskIdInput
    return await updateCrmTask(id, { status: 'completed' })
  })
