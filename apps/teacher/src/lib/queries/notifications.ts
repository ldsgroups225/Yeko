import { queryOptions } from '@tanstack/react-query'
import {
  getTeacherNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/teacher/functions/notifications'
import { teacherMutationKeys } from './keys'

export function teacherNotificationsQueryOptions(params: Parameters<typeof getTeacherNotifications>[0]['data']) {
  return queryOptions({
    queryKey: ['teacher', 'notifications', params.teacherId, params.isRead],
    queryFn: () => getTeacherNotifications({ data: params }),
    staleTime: 60 * 1000,
  })
}

// Notifications mutations
export const notificationsMutations = {
  markRead: {
    mutationKey: teacherMutationKeys.notifications.markRead,
    mutationFn: (data: Parameters<typeof markNotificationRead>[0]['data']) => markNotificationRead({ data }),
  },
  markAllRead: {
    mutationKey: teacherMutationKeys.notifications.markAllRead,
    mutationFn: (data: Parameters<typeof markAllNotificationsRead>[0]['data']) => markAllNotificationsRead({ data }),
  },
}
