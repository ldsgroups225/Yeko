import { queryOptions } from '@tanstack/react-query'

import {
  getMessageDeliveryStatusFn,
  getMessageTemplatesFn,
  getStudentParentsFn,
  getTeacherMessageCountTodayFn,
  getTeacherParentContactsFn,
  getTeacherSentMessagesFn,
  getTeacherUnreadMessageCountFn,
  searchParentsForMessagingFn,
  sendBulkMessagesFn,
} from '@/teacher/functions/parent-communication'

// ============================================
// PARENT CONTACTS
// ============================================

interface StudentParentsParams {
  studentId: string
}

export function studentParentsQueryOptions(params: StudentParentsParams) {
  return queryOptions({
    queryKey: ['student', params.studentId, 'parents'],
    queryFn: () => getStudentParentsFn({ data: params }),
    staleTime: 5 * 60 * 1000,
  })
}

interface TeacherParentContactsParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  classId?: string
}

export function teacherParentContactsQueryOptions(params: TeacherParentContactsParams) {
  return queryOptions({
    queryKey: ['teacher', 'parent-contacts', params.teacherId, params.schoolYearId, params.classId],
    queryFn: () => getTeacherParentContactsFn({ data: params }),
    staleTime: 10 * 60 * 1000,
  })
}

interface SearchParentsParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  query: string
  classId?: string
}

export function searchParentsQueryOptions(params: SearchParentsParams) {
  return queryOptions({
    queryKey: ['parents', 'search', params.teacherId, params.query, params.classId],
    queryFn: () => searchParentsForMessagingFn({ data: params }),
    staleTime: 60 * 1000, // 1 minute for search results
  })
}

// ============================================
// MESSAGE TEMPLATES
// ============================================

interface MessageTemplatesParams {
  schoolId: string
  category?: string
}

export function messageTemplatesQueryOptions(params: MessageTemplatesParams) {
  return queryOptions({
    queryKey: ['message-templates', params.schoolId, params.category],
    queryFn: () => getMessageTemplatesFn({ data: params }),
    staleTime: 30 * 60 * 1000, // 30 minutes - templates rarely change
  })
}

// ============================================
// MESSAGE HISTORY
// ============================================

interface TeacherSentMessagesParams {
  teacherId: string
  schoolId: string
  startDate?: string
  endDate?: string
  category?: string
  page?: number
  pageSize?: number
}

export function teacherSentMessagesQueryOptions(params: TeacherSentMessagesParams) {
  return queryOptions({
    queryKey: ['teacher', 'sent-messages', params.teacherId, params.startDate, params.endDate, params.category, params.page],
    queryFn: () => getTeacherSentMessagesFn({ data: params }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

interface MessageDeliveryStatusParams {
  messageId: string
}

export function messageDeliveryStatusQueryOptions(params: MessageDeliveryStatusParams) {
  return queryOptions({
    queryKey: ['message', params.messageId, 'delivery'],
    queryFn: () => getMessageDeliveryStatusFn({ data: params }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// ============================================
// BULK MESSAGING
// ============================================

interface TeacherMessageCountParams {
  teacherId: string
}

export function teacherMessageCountQueryOptions(params: TeacherMessageCountParams) {
  return queryOptions({
    queryKey: ['teacher', params.teacherId, 'message-count-today'],
    queryFn: () => getTeacherMessageCountTodayFn({ data: params }),
    staleTime: 60 * 1000, // 1 minute
  })
}

// ============================================
// UNREAD MESSAGE COUNT
// ============================================

interface UnreadMessageCountParams {
  teacherId: string
}

export function unreadMessageCountQueryOptions(params: UnreadMessageCountParams) {
  return queryOptions({
    queryKey: ['teacher', params.teacherId, 'unread-count'],
    queryFn: () => getTeacherUnreadMessageCountFn({ data: params }),
    staleTime: 30 * 1000, // 30 seconds
  })
}
