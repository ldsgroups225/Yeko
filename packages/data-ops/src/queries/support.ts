import type { InferSelectModel } from "drizzle-orm";
import type {
  ActivityType,
  ContactRole,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  TaskStatus,
} from "@/drizzle/support-schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  lte,
  sql,
} from "drizzle-orm";
import { getDb } from "@/database/setup";
import { schools } from "@/drizzle/core-schema";
import { users } from "@/drizzle/school-schema";
import {
  crmActivities,
  crmContacts,
  crmTasks,
  knowledgeBaseArticles,
  supportTickets,
  ticketComments,
} from "@/drizzle/support-schema";

// Type aliases using Drizzle's InferSelectModel
export type SupportTicket = InferSelectModel<typeof supportTickets>;
export type TicketComment = InferSelectModel<typeof ticketComments>;
export type KnowledgeBaseArticle = InferSelectModel<
  typeof knowledgeBaseArticles
>;
export type CrmContact = InferSelectModel<typeof crmContacts>;
export type CrmActivity = InferSelectModel<typeof crmActivities>;
export type CrmTask = InferSelectModel<typeof crmTasks>;

// ===== TICKET QUERIES =====

export interface TicketFilters {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  category?: SupportTicketCategory;
  assigneeId?: string;
  schoolId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

// Interface for ticket with joined data (separate from SupportTicket to avoid conflicts)
export interface TicketWithDetails {
  // All fields from SupportTicket
  id: string;
  schoolId: string | null;
  userId: string | null;
  title: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assigneeId: string | null;
  resolution: string | null;
  satisfactionRating: number | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  // Extended fields
  schoolName: string | null;
  userName: string | null;
  assigneeName: string | null;
  commentsCount?: number;
  comments?: Array<TicketComment & { userName?: string | null }>;
}

export async function getTickets(
  filters: TicketFilters = {},
  limit = 50,
  offset = 0,
): Promise<{ tickets: TicketWithDetails[]; total: number }> {
  const db = getDb();

  // Build conditions
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(supportTickets.status, filters.status));
  }
  if (filters.priority) {
    conditions.push(eq(supportTickets.priority, filters.priority));
  }
  if (filters.category) {
    conditions.push(eq(supportTickets.category, filters.category));
  }
  if (filters.assigneeId) {
    conditions.push(eq(supportTickets.assigneeId, filters.assigneeId));
  }
  if (filters.schoolId) {
    conditions.push(eq(supportTickets.schoolId, filters.schoolId));
  }
  if (filters.search) {
    conditions.push(
      sql`(${supportTickets.title} ILIKE ${`%${filters.search}%`} OR ${supportTickets.description} ILIKE ${`%${filters.search}%`})`,
    );
  }
  if (filters.startDate) {
    conditions.push(gte(supportTickets.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(supportTickets.createdAt, filters.endDate));
  }

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(supportTickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Get tickets with joins
  const tickets = await db
    .select({
      ticket: supportTickets,
      schoolName: schools.name,
      userName: users.name,
      assigneeName: users.name,
    })
    .from(supportTickets)
    .leftJoin(schools, eq(supportTickets.schoolId, schools.id))
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .leftJoin(users, eq(supportTickets.assigneeId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(supportTickets.createdAt))
    .limit(limit)
    .offset(offset);

  // Get comments count for each ticket
  const ticketsWithComments = await Promise.all(
    tickets.map(async (t) => {
      const [commentsCountResult] = await db
        .select({ count: count() })
        .from(ticketComments)
        .where(eq(ticketComments.ticketId, t.ticket.id));

      return {
        ...t.ticket,
        schoolName: t.schoolName,
        userName: t.userName,
        assigneeName: t.assigneeName,
        commentsCount: commentsCountResult?.count || 0,
      };
    }),
  );

  return {
    tickets: ticketsWithComments,
    total: totalResult?.count || 0,
  };
}

export async function getTicketById(
  id: string,
): Promise<TicketWithDetails | null> {
  const db = getDb();

  const [result] = await db
    .select({
      ticket: supportTickets,
      schoolName: schools.name,
      userName: users.name,
      assigneeName: users.name,
    })
    .from(supportTickets)
    .leftJoin(schools, eq(supportTickets.schoolId, schools.id))
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .leftJoin(users, eq(supportTickets.assigneeId, users.id))
    .where(eq(supportTickets.id, id));

  if (!result?.ticket) {
    return null;
  }

  // Get comments
  const comments = await db
    .select({
      comment: ticketComments,
      userName: users.name,
    })
    .from(ticketComments)
    .leftJoin(users, eq(ticketComments.userId, users.id))
    .where(eq(ticketComments.ticketId, id))
    .orderBy(asc(ticketComments.createdAt));

  return {
    ...result.ticket,
    schoolName: result.schoolName,
    userName: result.userName,
    assigneeName: result.assigneeName,
    commentsCount: comments.length,
    comments: comments.map((c) => ({
      ...c.comment,
      userName: c.userName,
    })),
  };
}

export async function createTicket(data: {
  schoolId?: string;
  userId?: string;
  title: string;
  description: string;
  category: SupportTicketCategory;
  priority?: SupportTicketPriority;
}): Promise<SupportTicket> {
  const db = getDb();

  const [ticket] = await db
    .insert(supportTickets)
    .values({
      ...data,
      priority: data.priority || "medium",
      status: "open",
    })
    .returning();

  return ticket!;
}

export async function updateTicket(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    category: SupportTicketCategory;
    priority: SupportTicketPriority;
    status: SupportTicketStatus;
    assigneeId: string;
    resolution: string;
    satisfactionRating: number;
  }>,
): Promise<SupportTicket | null> {
  const db = getDb();

  const updateData: any = { ...data };

  // Set resolvedAt if status is resolved
  if (data.status === "resolved" || data.status === "closed") {
    updateData.resolvedAt = new Date();
  }
  if (data.status === "closed") {
    updateData.closedAt = new Date();
  }

  const [ticket] = await db
    .update(supportTickets)
    .set(updateData)
    .where(eq(supportTickets.id, id))
    .returning();

  return ticket || null;
}

export async function addTicketComment(
  ticketId: string,
  data: {
    userId?: string;
    message: string;
    isInternal?: boolean;
  },
): Promise<TicketComment> {
  const db = getDb();

  const [comment] = await db
    .insert(ticketComments)
    .values({
      ticketId,
      ...data,
    })
    .returning();

  return comment!;
}

export async function getTicketComments(
  ticketId: string,
): Promise<Array<TicketComment & { userName?: string | null }>> {
  const db = getDb();

  const comments = await db
    .select({
      comment: ticketComments,
      userName: users.name,
    })
    .from(ticketComments)
    .leftJoin(users, eq(ticketComments.userId, users.id))
    .where(eq(ticketComments.ticketId, ticketId))
    .orderBy(asc(ticketComments.createdAt));

  return comments.map((c) => ({
    ...c.comment,
    userName: c.userName ?? undefined,
  }));
}

// ===== TICKET STATS =====

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  averageResolutionTime: number; // in hours
  satisfactionScore: number;
}

export async function getTicketStats(schoolId?: string): Promise<TicketStats> {
  const db = getDb();

  const baseConditions = schoolId
    ? [eq(supportTickets.schoolId, schoolId)]
    : [];

  const [totalResult] = await db
    .select({ count: count() })
    .from(supportTickets)
    .where(baseConditions.length > 0 ? and(...baseConditions) : undefined);

  const [openResult] = await db
    .select({ count: count() })
    .from(supportTickets)
    .where(and(eq(supportTickets.status, "open"), ...baseConditions));

  const [inProgressResult] = await db
    .select({ count: count() })
    .from(supportTickets)
    .where(and(eq(supportTickets.status, "in_progress"), ...baseConditions));

  const [resolvedResult] = await db
    .select({ count: count() })
    .from(supportTickets)
    .where(and(eq(supportTickets.status, "resolved"), ...baseConditions));

  const [closedResult] = await db
    .select({ count: count() })
    .from(supportTickets)
    .where(and(eq(supportTickets.status, "closed"), ...baseConditions));

  // Calculate average resolution time (for resolved tickets)
  const [avgTimeResult] = await db
    .select({
      avg: sql<number>`AVG(EXTRACT(EPOCH FROM (${supportTickets.resolvedAt} - ${supportTickets.createdAt})) / 3600)`,
    })
    .from(supportTickets)
    .where(and(eq(supportTickets.status, "resolved"), ...baseConditions));

  // Calculate average satisfaction score
  const [satisfactionResult] = await db
    .select({
      avg: sql<number>`AVG(${supportTickets.satisfactionRating})`,
    })
    .from(supportTickets)
    .where(
      and(isNotNull(supportTickets.satisfactionRating), ...baseConditions),
    );

  return {
    total: totalResult?.count || 0,
    open: openResult?.count || 0,
    inProgress: inProgressResult?.count || 0,
    resolved: resolvedResult?.count || 0,
    closed: closedResult?.count || 0,
    averageResolutionTime: Number(avgTimeResult?.avg || 0),
    satisfactionScore: Number(satisfactionResult?.avg || 0),
  };
}

export async function getRecentTickets(
  limit = 5,
): Promise<TicketWithDetails[]> {
  const { tickets } = await getTickets({}, limit, 0);
  return tickets;
}

// ===== KNOWLEDGE BASE QUERIES =====

export interface ArticleFilters {
  category?: string;
  search?: string;
  published?: boolean;
  featured?: boolean;
}

export async function getKnowledgeBaseArticles(
  filters: ArticleFilters = {},
  limit = 20,
  offset = 0,
): Promise<{ articles: KnowledgeBaseArticle[]; total: number }> {
  const db = getDb();

  const conditions = [];

  if (filters.category) {
    conditions.push(eq(knowledgeBaseArticles.category, filters.category));
  }
  if (filters.published !== undefined) {
    conditions.push(eq(knowledgeBaseArticles.isPublished, filters.published));
  }
  if (filters.featured) {
    conditions.push(eq(knowledgeBaseArticles.isFeatured, true));
  }
  if (filters.search) {
    conditions.push(
      sql`(${knowledgeBaseArticles.title} ILIKE ${`%${filters.search}%`} OR ${knowledgeBaseArticles.content} ILIKE ${`%${filters.search}%`})`,
    );
  }

  const [totalResult] = await db
    .select({ count: count() })
    .from(knowledgeBaseArticles)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const articles = await db
    .select()
    .from(knowledgeBaseArticles)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      desc(knowledgeBaseArticles.views),
      desc(knowledgeBaseArticles.updatedAt),
    )
    .limit(limit)
    .offset(offset);

  return {
    articles,
    total: totalResult?.count || 0,
  };
}

export async function getArticleById(
  id: string,
): Promise<KnowledgeBaseArticle | null> {
  const db = getDb();

  // Increment view count
  await db
    .update(knowledgeBaseArticles)
    .set({ views: sql`${knowledgeBaseArticles.views} + 1` })
    .where(eq(knowledgeBaseArticles.id, id));

  const [article] = await db
    .select()
    .from(knowledgeBaseArticles)
    .where(eq(knowledgeBaseArticles.id, id));

  return article || null;
}

export async function getFeaturedArticles(
  limit = 5,
): Promise<KnowledgeBaseArticle[]> {
  const db = getDb();

  const articles = await db
    .select()
    .from(knowledgeBaseArticles)
    .where(eq(knowledgeBaseArticles.isPublished, true))
    .orderBy(
      desc(knowledgeBaseArticles.isFeatured),
      desc(knowledgeBaseArticles.views),
    )
    .limit(limit);

  return articles;
}

export async function createArticle(data: {
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  authorId: string;
}): Promise<KnowledgeBaseArticle> {
  const db = getDb();

  const [article] = await db
    .insert(knowledgeBaseArticles)
    .values({
      ...data,
      isPublished: false,
    })
    .returning();

  return article!;
}

// ===== CRM CONTACTS QUERIES =====

export interface ContactFilters {
  schoolId?: string;
  role?: ContactRole;
  search?: string;
  hasFollowUp?: boolean;
}

export async function getCrmContacts(
  filters: ContactFilters = {},
  limit = 50,
  offset = 0,
): Promise<{
  contacts: (CrmContact & { schoolName?: string | null })[];
  total: number;
}> {
  const db = getDb();

  const conditions = [];

  if (filters.schoolId) {
    conditions.push(eq(crmContacts.schoolId, filters.schoolId));
  }
  if (filters.role) {
    conditions.push(eq(crmContacts.role, filters.role));
  }
  if (filters.search) {
    conditions.push(
      sql`(${crmContacts.contactName} ILIKE ${`%${filters.search}%`} OR ${crmContacts.email} ILIKE ${`%${filters.search}%`})`,
    );
  }
  if (filters.hasFollowUp) {
    conditions.push(isNotNull(crmContacts.nextFollowUp));
  }

  const [totalResult] = await db
    .select({ count: count() })
    .from(crmContacts)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const contacts = await db
    .select({
      contact: crmContacts,
      schoolName: schools.name,
    })
    .from(crmContacts)
    .leftJoin(schools, eq(crmContacts.schoolId, schools.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(crmContacts.updatedAt))
    .limit(limit)
    .offset(offset);

  return {
    contacts: contacts.map((c) => ({
      ...c.contact,
      schoolName: c.schoolName ?? undefined,
    })),
    total: totalResult?.count || 0,
  };
}

export async function getContactById(
  id: string,
): Promise<
  | (CrmContact & { schoolName?: string | null; activities: CrmActivity[] })
  | null
> {
  const db = getDb();

  const [result] = await db
    .select({
      contact: crmContacts,
      schoolName: schools.name,
    })
    .from(crmContacts)
    .leftJoin(schools, eq(crmContacts.schoolId, schools.id))
    .where(eq(crmContacts.id, id));

  if (!result?.contact) {
    return null;
  }

  // Get activities
  const activities = await db
    .select()
    .from(crmActivities)
    .where(eq(crmActivities.contactId, id))
    .orderBy(desc(crmActivities.createdAt));

  return {
    ...result.contact,
    schoolName: result.schoolName ?? undefined,
    activities,
  };
}

export async function createCrmContact(data: {
  schoolId?: string;
  contactName: string;
  email?: string;
  phone?: string;
  role?: ContactRole;
  notes?: string;
}): Promise<CrmContact> {
  const db = getDb();

  const [contact] = await db.insert(crmContacts).values(data).returning();

  return contact!;
}

export async function updateCrmContact(
  id: string,
  data: Partial<{
    contactName: string;
    email: string;
    phone: string;
    role: ContactRole;
    notes: string;
    nextFollowUp: Date;
  }>,
): Promise<CrmContact | null> {
  const db = getDb();

  const [contact] = await db
    .update(crmContacts)
    .set({ ...data, lastContactedAt: new Date() })
    .where(eq(crmContacts.id, id))
    .returning();

  return contact || null;
}

// ===== CRM ACTIVITIES QUERIES =====

export async function getCrmActivities(
  contactId?: string,
  schoolId?: string,
  limit = 20,
): Promise<CrmActivity[]> {
  const db = getDb();

  const conditions = [];
  if (contactId) {
    conditions.push(eq(crmActivities.contactId, contactId));
  }
  if (schoolId) {
    conditions.push(eq(crmActivities.schoolId, schoolId));
  }

  const activities = await db
    .select()
    .from(crmActivities)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(crmActivities.createdAt))
    .limit(limit);

  return activities;
}

export async function createCrmActivity(data: {
  contactId: string;
  schoolId?: string;
  userId?: string;
  type: ActivityType;
  subject?: string;
  description?: string;
  outcome?: string;
  nextFollowUp?: Date;
}): Promise<CrmActivity> {
  const db = getDb();

  const [activity] = await db.insert(crmActivities).values(data).returning();

  // Update contact's last contacted and next follow-up
  await db
    .update(crmContacts)
    .set({
      lastContactedAt: new Date(),
      nextFollowUp: data.nextFollowUp || undefined,
    })
    .where(eq(crmContacts.id, data.contactId));

  return activity!;
}

// ===== CRM TASKS QUERIES =====

export interface TaskFilters {
  status?: TaskStatus;
  userId?: string;
  contactId?: string;
  dueBefore?: Date;
  overdue?: boolean;
}

export async function getCrmTasks(
  filters: TaskFilters = {},
  limit = 50,
  offset = 0,
): Promise<{
  tasks: (CrmTask & {
    contactName?: string | null;
    schoolName?: string | null;
  })[];
  total: number;
}> {
  const db = getDb();

  const conditions = [];

  if (filters.status) {
    conditions.push(eq(crmTasks.status, filters.status));
  }
  if (filters.userId) {
    conditions.push(eq(crmTasks.userId, filters.userId));
  }
  if (filters.contactId) {
    conditions.push(eq(crmTasks.contactId, filters.contactId));
  }
  if (filters.dueBefore) {
    conditions.push(lte(crmTasks.dueDate, filters.dueBefore));
  }
  if (filters.overdue) {
    conditions.push(
      and(
        isNotNull(crmTasks.dueDate),
        sql`${crmTasks.dueDate} < NOW()`,
        eq(crmTasks.status, "pending"),
      ),
    );
  }

  const [totalResult] = await db
    .select({ count: count() })
    .from(crmTasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const tasks = await db
    .select({
      task: crmTasks,
      contactName: crmContacts.contactName,
      schoolName: schools.name,
    })
    .from(crmTasks)
    .leftJoin(crmContacts, eq(crmTasks.contactId, crmContacts.id))
    .leftJoin(schools, eq(crmTasks.schoolId, schools.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(crmTasks.dueDate))
    .limit(limit)
    .offset(offset);

  return {
    tasks: tasks.map((t) => ({
      ...t.task,
      contactName: t.contactName ?? undefined,
      schoolName: t.schoolName ?? undefined,
    })),
    total: totalResult?.count || 0,
  };
}

export async function createCrmTask(data: {
  contactId?: string;
  schoolId?: string;
  userId?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: SupportTicketPriority;
}): Promise<CrmTask> {
  const db = getDb();

  const [task] = await db
    .insert(crmTasks)
    .values({
      ...data,
      status: "pending",
    })
    .returning();

  return task!;
}

export async function updateCrmTask(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: Date;
    priority: SupportTicketPriority;
  }>,
): Promise<CrmTask | null> {
  const db = getDb();

  const updateData: any = { ...data };
  if (data.status === "completed") {
    updateData.completedAt = new Date();
  }

  const [task] = await db
    .update(crmTasks)
    .set(updateData)
    .where(eq(crmTasks.id, id))
    .returning();

  return task || null;
}

export async function completeCrmTask(id: string): Promise<CrmTask | null> {
  return updateCrmTask(id, { status: "completed" });
}

// ===== HELPER FUNCTIONS =====

export function getTicketStatusCounts(): Record<SupportTicketStatus, number> {
  return {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };
}

export function getTicketPriorityCounts(): Record<
  SupportTicketPriority,
  number
> {
  return {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
}
