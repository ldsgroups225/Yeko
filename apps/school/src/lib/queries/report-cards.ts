import type { ReportCardStatus } from '@/schemas/report-card'

import { queryOptions } from '@tanstack/react-query'
import {
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
} from '@/school/functions/report-cards'

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
      queryFn: () => getReportCards({ data: params }),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      enabled: !!params.classId && !!params.termId,
    }),

  byStudentTerm: (studentId: string, termId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.byStudent(studentId, termId),
      queryFn: () => getReportCardByStudentTerm({ data: { studentId, termId } }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!studentId && !!termId,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: reportCardsKeys.detail(id),
      queryFn: () => getReportCard({ data: { id } }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  data: (params: ReportCardDataParams) =>
    queryOptions({
      queryKey: reportCardsKeys.data(params.studentId, params.termId, params.classId),
      queryFn: () => getReportCardData({ data: params }),
      staleTime: 2 * 60 * 1000, // 2 minutes - averages may update
      gcTime: 15 * 60 * 1000,
      enabled: !!params.studentId && !!params.termId && !!params.classId,
    }),

  stats: (classId: string, termId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.stats(classId, termId),
      queryFn: () => getClassReportCardStats({ data: { classId, termId } }),
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!classId && !!termId,
    }),

  deliveryStatus: (classId: string, termId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.delivery(classId, termId),
      queryFn: () => getDeliveryStatusSummary({ data: { classId, termId } }),
      staleTime: 60 * 1000, // 1 minute - delivery status changes
      gcTime: 10 * 60 * 1000,
      enabled: !!classId && !!termId,
    }),

  templates: (schoolId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.templates(schoolId),
      queryFn: () => getReportCardTemplates({ data: { schoolId } }),
      staleTime: 10 * 60 * 1000, // 10 minutes - templates rarely change
      gcTime: 60 * 60 * 1000, // 1 hour
      enabled: !!schoolId,
    }),

  template: (id: string) =>
    queryOptions({
      queryKey: reportCardsKeys.template(id),
      queryFn: () => getReportCardTemplate({ data: { id } }),
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!id,
    }),

  defaultTemplate: (schoolId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.defaultTemplate(schoolId),
      queryFn: () => getDefaultTemplate({ data: { schoolId } }),
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!schoolId,
    }),

  comments: (reportCardId: string) =>
    queryOptions({
      queryKey: reportCardsKeys.comments(reportCardId),
      queryFn: () => getTeacherComments({ data: { reportCardId } }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!reportCardId,
    }),
}
