import { Result as R } from '@praha/byethrow'
import { getTeacherNotificationsQuery, markAllNotificationsAsReadQuery } from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Get teacher notifications
export const getTeacherNotifications = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      isRead: z.boolean().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    const notificationsResult = await getTeacherNotificationsQuery({
      teacherId: data.teacherId,
      unreadOnly: data.isRead === false,
      limit: data.limit,
    })

    if (R.isFailure(notificationsResult)) {
      return {
        notifications: [],
        unreadCount: 0,
      }
    }

    const notifications = notificationsResult.value
    const unreadCount = notifications.filter(n => !n.isRead).length // Approximate if not paginated fully

    return {
      notifications: notifications.map((n) => {
        // Safe casting with interface instead of any
        interface NotificationRow {
          id: string
          type: string
          title: string
          body: string | null
          actionType: string | null
          actionData: unknown
          relatedType: string | null
          relatedId: string | null
          isRead: boolean
          createdAt: Date
        }
        const notification = n as unknown as NotificationRow

        return {
          id: notification.id,
          type: notification.type as string,
          title: notification.title,
          body: notification.body,
          actionType: notification.actionType,
          actionData: notification.actionData as Record<string, object> | null,
          relatedType: notification.relatedType,
          relatedId: notification.relatedId,
          isRead: notification.isRead,
          createdAt: notification.createdAt.toISOString(),
        }
      }),
      unreadCount, // For now returning count from fetched batch
    }
  })

// Mark notification as read
export const markNotificationRead = createServerFn()
  .inputValidator(
    z.object({
      notificationId: z.string(),
      teacherId: z.string(),
    }),
  )

// Mark all notifications as read
export const markAllNotificationsRead = createServerFn()
  .inputValidator(z.object({ teacherId: z.string() }))
  .handler(async ({ data }) => {
    const result = await markAllNotificationsAsReadQuery(data.teacherId)

    if (R.isFailure(result)) {
      return {
        success: false,
        updatedCount: 0,
      }
    }

    return {
      success: true,
      updatedCount: result.value.updatedCount,
    }
  })
