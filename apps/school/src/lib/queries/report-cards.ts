import type { ReportCardStatus } from '@/schemas/report-card'

import { queryOptions } from '@tanstack/react-query'
import {
  bulkGenerateReportCards,
  bulkSendReportCards,
  createReportCardTemplate,
  createTeacherComment,
  deleteReportCardTemplate,
  deleteTeacherComment,
  generateReportCard,
  getClassReportCardStats,
  getDefaultTemplate,
  getDeliveryStatusSummary,
  getReportCard,
  getReportCardByStudentTerm,
  getReportCardData,
  getReportCards,
  getReportCardTemplate,
  getReportCardTemplates,
  getTeacherComments,
  markReportCardDelivered,
  markReportCardViewed,
  sendReportCard,
  updateHomeroomComment,
  updateReportCardTemplate,
  updateTeacherComment,
} from '@/school/functions/report-cards'
import { schoolMutationKeys } from './keys'

// ============================================
// QUERY KEYS
// ============================================

export const reportCardsKeys = {
  all: ['report-cards'] as const,
  lists: () => [...reportCardsKeys.all, 'list'] as const,
  byClass: (classId: string, termId: string, status?: ReportCardStatus) =>
    [...reportCardsKeys.lists(), 'class', classId, termId, status] as const,
  byStudent: (studentId: string, termId: string) =>
    [...reportCardsKeys.all, 'student', studentId, termId] as const,
  details: () => [...reportCardsKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportCardsKeys.details(), id] as const,
  data: (studentId: string, termId: string, classId: string) =>
    [...reportCardsKeys.all, 'data', studentId, termId, classId] as const,
  stats: (classId: string, termId: string) =>
    [...reportCardsKeys.all, 'stats', classId, termId] as const,
  delivery: (classId: string, termId: string) =>
    [...reportCardsKeys.all, 'delivery', classId, termId] as const,
  templates: (schoolId: string) =>
    [...reportCardsKeys.all, 'templates', schoolId] as const,
  template: (id: string) =>
    [...reportCardsKeys.all, 'template', id] as const,
  defaultTemplate: (schoolId: string) =>
    [...reportCardsKeys.all, 'default-template', schoolId] as const,
  comments: (reportCardId: string) =>
    [...reportCardsKeys.all, 'comments', reportCardId] as const,
}

// ============================================
// QUERY OPTIONS
// ============================================

export interface ReportCardsByClassParams {
  classId: string
  termId: string
  status?: ReportCardStatus
}

export interface ReportCardDataParams {
  studentId: string
  termId: string
  classId: string
}

export const reportCardsOptions = {
  byClass: (params: ReportCardsByClassParams) =>
    queryOptions({
      queryKey: reportCardsKeys.byClass(params.classId, params.termId, params.status),
      queryFn: async () => {
        const res = await getReportCards({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      enabled: !!params.classId && !!params.termId,
    }),

  byStudentTerm: (studentId: string, termId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.byStudent(studentId, termId),
      queryFn: async () => {
        const res = await getReportCardByStudentTerm({ data: { studentId, termId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!studentId && !!termId,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: reportCardsKeys.detail(id),
      queryFn: async () => {
        const res = await getReportCard({ data: { id } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  data: (params: ReportCardDataParams) =>
    queryOptions({
      queryKey: reportCardsKeys.data(params.studentId, params.termId, params.classId),
      queryFn: async () => {
        const res = await getReportCardData({ data: params })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000, // 2 minutes - averages may update
      gcTime: 15 * 60 * 1000,
      enabled: !!params.studentId && !!params.termId && !!params.classId,
    }),

  stats: (classId: string, termId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.stats(classId, termId),
      queryFn: async () => {
        const res = await getClassReportCardStats({ data: { classId, termId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!classId && !!termId,
    }),

  deliveryStatus: (classId: string, termId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.delivery(classId, termId),
      queryFn: async () => {
        const res = await getDeliveryStatusSummary({ data: { classId, termId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 60 * 1000, // 1 minute - delivery status changes
      gcTime: 10 * 60 * 1000,
      enabled: !!classId && !!termId,
    }),

  templates: (schoolId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.templates(schoolId),
      queryFn: async () => {
        const res = await getReportCardTemplates({ data: { schoolId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 10 * 60 * 1000, // 10 minutes - templates rarely change
      gcTime: 60 * 60 * 1000, // 1 hour
      enabled: !!schoolId,
    }),

  template: (id: string) =>
    queryOptions({
      queryKey: reportCardsKeys.template(id),
      queryFn: async () => {
        const res = await getReportCardTemplate({ data: { id } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!id,
    }),

  defaultTemplate: (schoolId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.defaultTemplate(schoolId),
      queryFn: async () => {
        const res = await getDefaultTemplate({ data: { schoolId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!schoolId,
    }),

  comments: (reportCardId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.comments(reportCardId),
      queryFn: async () => {
        const res = await getTeacherComments({ data: { reportCardId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!reportCardId,
    }),
}

// Report cards mutations
export const reportCardsMutations = {
  generate: {
    mutationKey: schoolMutationKeys.reportCards.generate,
    mutationFn: (data: Parameters<typeof generateReportCard>[0]['data']) => generateReportCard({ data }),
  },
  bulkGenerate: {
    mutationKey: schoolMutationKeys.reportCards.bulkGenerate,
    mutationFn: (data: Parameters<typeof bulkGenerateReportCards>[0]['data']) => bulkGenerateReportCards({ data }),
  },
  updateHomeroomComment: {
    mutationKey: schoolMutationKeys.reportCards.update,
    mutationFn: (data: Parameters<typeof updateHomeroomComment>[0]['data']) => updateHomeroomComment({ data }),
  },
  send: {
    mutationKey: schoolMutationKeys.reportCards.send,
    mutationFn: (data: Parameters<typeof sendReportCard>[0]['data']) => sendReportCard({ data }),
  },
  bulkSend: {
    mutationKey: schoolMutationKeys.reportCards.bulkSend,
    mutationFn: (data: Parameters<typeof bulkSendReportCards>[0]['data']) => bulkSendReportCards({ data }),
  },
  markDelivered: {
    mutationKey: schoolMutationKeys.reportCards.markDelivered,
    mutationFn: (data: Parameters<typeof markReportCardDelivered>[0]['data']) => markReportCardDelivered({ data }),
  },
  markViewed: {
    mutationKey: schoolMutationKeys.reportCards.markViewed,
    mutationFn: (data: Parameters<typeof markReportCardViewed>[0]['data']) => markReportCardViewed({ data }),
  },
}

// Report card templates mutations
export const reportCardTemplatesMutations = {
  create: {
    mutationKey: schoolMutationKeys.reportCardTemplates.create,
    mutationFn: (data: Parameters<typeof createReportCardTemplate>[0]['data']) => createReportCardTemplate({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.reportCardTemplates.update,
    mutationFn: (data: Parameters<typeof updateReportCardTemplate>[0]['data']) => updateReportCardTemplate({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.reportCardTemplates.delete,
    mutationFn: (data: Parameters<typeof deleteReportCardTemplate>[0]['data']) => deleteReportCardTemplate({ data }),
  },
}

// Teacher comments mutations
export const teacherCommentsMutations = {
  create: {
    mutationKey: schoolMutationKeys.teacherComments.create,
    mutationFn: (data: Parameters<typeof createTeacherComment>[0]['data']) => createTeacherComment({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.teacherComments.update,
    mutationFn: (data: Parameters<typeof updateTeacherComment>[0]['data']) => updateTeacherComment({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.teacherComments.delete,
    mutationFn: (data: Parameters<typeof deleteTeacherComment>[0]['data']) => deleteTeacherComment({ data }),
  },
}
