import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// Import from core and school schemas
import { schools } from './core-schema'
import { users } from './school-schema'

// --- Support Tickets ---

export const supportTicketStatuses = [
  'open',
  'in_progress',
  'resolved',
  'closed',
] as const
export type SupportTicketStatus = (typeof supportTicketStatuses)[number]

export const supportTicketPriorities = [
  'low',
  'medium',
  'high',
  'critical',
] as const
export type SupportTicketPriority = (typeof supportTicketPriorities)[number]

export const supportTicketCategories = [
  'technical',
  'feature',
  'bug',
  'billing',
  'account',
  'other',
] as const
export type SupportTicketCategory = (typeof supportTicketCategories)[number]

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    schoolId: text('school_id').references(() => schools.id, {
      onDelete: 'set null',
    }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Ticket details
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category', { enum: supportTicketCategories }).notNull(),
    priority: text('priority', { enum: supportTicketPriorities })
      .default('medium')
      .notNull(),
    status: text('status', { enum: supportTicketStatuses })
      .default('open')
      .notNull(),

    // Assignment
    assigneeId: text('assignee_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Resolution
    resolution: text('resolution'),
    satisfactionRating: smallint('satisfaction_rating'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    resolvedAt: timestamp('resolved_at'),
    closedAt: timestamp('closed_at'),
  },
  table => ({
    schoolIdx: index('idx_support_tickets_school').on(table.schoolId),
    statusIdx: index('idx_support_tickets_status').on(table.status),
    priorityIdx: index('idx_support_tickets_priority').on(table.priority),
    assigneeIdx: index('idx_support_tickets_assignee').on(table.assigneeId),
    createdAtIdx: index('idx_support_tickets_created').on(table.createdAt),
    schoolStatusIdx: index('idx_support_tickets_school_status').on(
      table.schoolId,
      table.status,
    ),
  }),
)

// --- Ticket Comments/Messages ---

export const ticketComments = pgTable(
  'ticket_comments',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => supportTickets.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    message: text('message').notNull(),
    isInternal: boolean('is_internal').default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    ticketIdx: index('idx_ticket_comments_ticket').on(table.ticketId),
    userIdx: index('idx_ticket_comments_user').on(table.userId),
    createdAtIdx: index('idx_ticket_comments_created').on(table.createdAt),
  }),
)

// --- Knowledge Base Articles ---

export const knowledgeBaseArticles = pgTable(
  'knowledge_base_articles',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),

    // Article content
    title: text('title').notNull(),
    content: text('content').notNull(),
    summary: text('summary'),
    category: text('category').notNull(),
    tags: jsonb('tags').$type<string[]>(),

    // Metrics
    views: integer('views').default(0),
    helpfulCount: integer('helpful_count').default(0),
    notHelpfulCount: integer('not_helpful_count').default(0),

    // Publishing
    isPublished: boolean('is_published').default(false),
    isFeatured: boolean('is_featured').default(false),
    authorId: text('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    publishedAt: timestamp('published_at'),
  },
  table => ({
    categoryIdx: index('idx_kb_articles_category').on(table.category),
    publishedIdx: index('idx_kb_articles_published').on(table.isPublished),
    viewsIdx: index('idx_kb_articles_views').on(table.views),
    featuredIdx: index('idx_kb_articles_featured').on(table.isFeatured),
  }),
)

// --- CRM Contacts ---

export const contactRoles = [
  'director',
  'admin',
  'teacher',
  'parent',
  'staff',
  'other',
] as const
export type ContactRole = (typeof contactRoles)[number]

export const crmContacts = pgTable(
  'crm_contacts',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    schoolId: text('school_id').references(() => schools.id, {
      onDelete: 'cascade',
    }),

    // Contact info
    contactName: text('contact_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    role: text('role', { enum: contactRoles }),

    // Notes
    notes: text('notes'),

    // Follow-up
    lastContactedAt: timestamp('last_contacted_at'),
    nextFollowUp: timestamp('next_follow_up'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    schoolIdx: index('idx_crm_contacts_school').on(table.schoolId),
    emailIdx: index('idx_crm_contacts_email').on(table.email),
    nameIdx: index('idx_crm_contacts_name').on(table.contactName),
    followUpIdx: index('idx_crm_contacts_followup').on(table.nextFollowUp),
  }),
)

// --- CRM Activities/Interactions ---

export const activityTypes = [
  'call',
  'email',
  'meeting',
  'note',
  'ticket',
  'other',
] as const
export type ActivityType = (typeof activityTypes)[number]

export const crmActivities = pgTable(
  'crm_activities',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    contactId: text('contact_id')
      .notNull()
      .references(() => crmContacts.id, { onDelete: 'cascade' }),
    schoolId: text('school_id').references(() => schools.id, {
      onDelete: 'cascade',
    }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Activity details
    type: text('type', { enum: activityTypes }).notNull(),
    subject: text('subject'),
    description: text('description'),
    outcome: text('outcome'),

    // Follow-up
    nextFollowUp: timestamp('next_follow_up'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    contactIdx: index('idx_crm_activities_contact').on(table.contactId),
    schoolIdx: index('idx_crm_activities_school').on(table.schoolId),
    typeIdx: index('idx_crm_activities_type').on(table.type),
    createdAtIdx: index('idx_crm_activities_created').on(table.createdAt),
  }),
)

// --- CRM Tasks/Reminders ---

export const taskStatuses = ['pending', 'completed', 'cancelled'] as const
export type TaskStatus = (typeof taskStatuses)[number]

export const crmTasks = pgTable(
  'crm_tasks',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    contactId: text('contact_id').references(() => crmContacts.id, {
      onDelete: 'cascade',
    }),
    schoolId: text('school_id').references(() => schools.id, {
      onDelete: 'cascade',
    }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: taskStatuses }).default('pending').notNull(),
    dueDate: timestamp('due_date'),
    priority: text('priority', { enum: supportTicketPriorities })
      .default('medium')
      .notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  table => ({
    contactIdx: index('idx_crm_tasks_contact').on(table.contactId),
    schoolIdx: index('idx_crm_tasks_school').on(table.schoolId),
    userIdx: index('idx_crm_tasks_user').on(table.userId),
    statusIdx: index('idx_crm_tasks_status').on(table.status),
    dueDateIdx: index('idx_crm_tasks_due').on(table.dueDate),
  }),
)

// --- Relations ---

export const supportTicketsRelations = relations(
  supportTickets,
  ({ one, many }) => ({
    school: one(schools, {
      fields: [supportTickets.schoolId],
      references: [schools.id],
    }),
    user: one(users, {
      fields: [supportTickets.userId],
      references: [users.id],
    }),
    assignee: one(users, {
      fields: [supportTickets.assigneeId],
      references: [users.id],
    }),
    comments: many(ticketComments),
  }),
)

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketComments.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}))

export const knowledgeBaseArticlesRelations = relations(
  knowledgeBaseArticles,
  ({ one }) => ({
    author: one(users, {
      fields: [knowledgeBaseArticles.authorId],
      references: [users.id],
    }),
  }),
)

export const crmContactsRelations = relations(crmContacts, ({ one, many }) => ({
  school: one(schools, {
    fields: [crmContacts.schoolId],
    references: [schools.id],
  }),
  activities: many(crmActivities),
  tasks: many(crmTasks),
}))

export const crmActivitiesRelations = relations(crmActivities, ({ one }) => ({
  contact: one(crmContacts, {
    fields: [crmActivities.contactId],
    references: [crmContacts.id],
  }),
  school: one(schools, {
    fields: [crmActivities.schoolId],
    references: [schools.id],
  }),
  user: one(users, {
    fields: [crmActivities.userId],
    references: [users.id],
  }),
}))

export const crmTasksRelations = relations(crmTasks, ({ one }) => ({
  contact: one(crmContacts, {
    fields: [crmTasks.contactId],
    references: [crmContacts.id],
  }),
  school: one(schools, {
    fields: [crmTasks.schoolId],
    references: [schools.id],
  }),
  user: one(users, {
    fields: [crmTasks.userId],
    references: [users.id],
  }),
}))
