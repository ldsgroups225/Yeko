import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import {
  getMessageDetails,
  getMessageTemplates,
  getTeacherMessages,
  markMessageRead,
  searchParents,
  sendMessage,
} from '@/teacher/functions/messages'
import { getTeacherNotifications } from '@/teacher/functions/notifications'
import { teacherMutationKeys } from './keys'

export const messagesKeys = {
  all: ['teacher', 'messages'] as const,
  lists: () => [...messagesKeys.all, 'list'] as const,
  list: (teacherId: string, folder?: string, page?: number) =>
    [...messagesKeys.lists(), teacherId, folder ?? 'inbox', page ?? 1] as const,
  details: () => [...messagesKeys.all, 'detail'] as const,
  detail: (messageId: string) => [...messagesKeys.details(), messageId] as const,
}

interface MessagesParams {
  teacherId: string
  folder?: 'inbox' | 'sent' | 'archived'
  isRead?: boolean
  page?: number
  pageSize?: number
}

export function teacherMessagesQueryOptions(params: MessagesParams) {
  return queryOptions({
    queryKey: messagesKeys.list(params.teacherId, params.folder, params.page),
    queryFn: () =>
      getTeacherMessages({
        data: {
          teacherId: params.teacherId,
          folder: params.folder ?? 'inbox',
          isRead: params.isRead,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }),
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: keepPreviousData,
  })
}

interface MessageDetailParams {
  messageId: string
  teacherId: string
}

export function messageDetailQueryOptions(params: MessageDetailParams) {
  return queryOptions({
    queryKey: messagesKeys.detail(params.messageId),
    queryFn: () => getMessageDetails({ data: params }),
    staleTime: 60 * 1000, // 1 minute
  })
}

interface ParentSearchParams {
  teacherId: string
  schoolId: string
  schoolYearId: string
  query: string
  classId?: string
}

export function parentSearchQueryOptions(params: ParentSearchParams) {
  return queryOptions({
    queryKey: ['teacher', 'parents', 'search', params.query],
    queryFn: () => searchParents({ data: params }),
    staleTime: 30 * 1000, // 30 seconds
    enabled: params.query.length >= 2,
  })
}

interface TemplatesParams {
  schoolId: string
  category?: 'attendance' | 'grades' | 'behavior' | 'general' | 'reminder' | 'congratulations'
}

export function messageTemplatesQueryOptions(params: TemplatesParams) {
  return queryOptions({
    queryKey: ['teacher', 'templates', params.schoolId, params.category],
    queryFn: () => getMessageTemplates({ data: params }),
    staleTime: 30 * 60 * 1000, // 30 minutes - templates rarely change
  })
}

interface NotificationsParams {
  teacherId: string
  isRead?: boolean
  limit?: number
}

export function teacherNotificationsQueryOptions(params: NotificationsParams) {
  return queryOptions({
    queryKey: ['teacher', 'notifications', params.teacherId, params.isRead],
    queryFn: () =>
      getTeacherNotifications({
        data: {
          teacherId: params.teacherId,
          isRead: params.isRead,
          limit: params.limit ?? 20,
        },
      }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Messages mutations
export const messagesMutations = {
  send: {
    mutationKey: teacherMutationKeys.messages.send,
    mutationFn: (data: Parameters<typeof sendMessage>[0]['data']) => sendMessage({ data }),
  },
  markRead: {
    mutationKey: teacherMutationKeys.messages.markRead,
    mutationFn: (data: Parameters<typeof markMessageRead>[0]['data']) => markMessageRead({ data }),
  },
}
