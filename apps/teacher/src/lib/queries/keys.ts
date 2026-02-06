/**
 * Teacher App Mutation Key Factories
 *
 * Centralized mutation keys for TanStack Query v5 compatibility.
 * Following convention: ['app', 'domain', 'action']
 *
 * These keys enable:
 * - useMutationState() filtering for cross-component mutation tracking
 * - DevTools filtering and debugging
 * - Global mutation observers
 */

export const teacherMutationKeys = {
  // ============================================================================
  // Attendance
  // ============================================================================
  attendance: {
    save: ['teacher', 'attendance', 'save'] as const,
    saveBulk: ['teacher', 'attendance', 'save-bulk'] as const,
  },

  // ============================================================================
  // Chat / Messages
  // ============================================================================
  messages: {
    markRead: ['teacher', 'messages', 'mark-read'] as const,
    send: ['teacher', 'messages', 'send'] as const,
  },

  // ============================================================================
  // Sessions
  // ============================================================================
  sessions: {
    saveParticipation: ['teacher', 'sessions', 'save-participation'] as const,
    saveAttendance: ['teacher', 'sessions', 'save-attendance'] as const,
    complete: ['teacher', 'sessions', 'complete'] as const,
  },

  // ============================================================================
  // Grades
  // ============================================================================
  grades: {
    publish: ['teacher', 'grades', 'publish'] as const,
  },

  // ============================================================================
  // Homework
  // ============================================================================
  homework: {
    create: ['teacher', 'homework', 'create'] as const,
    update: ['teacher', 'homework', 'update'] as const,
    delete: ['teacher', 'homework', 'delete'] as const,
  },

  // ============================================================================
  // Local Notes (PGlite)
  // ============================================================================
  localNotes: {
    save: ['teacher', 'local-notes', 'save'] as const,
    update: ['teacher', 'local-notes', 'update'] as const,
    delete: ['teacher', 'local-notes', 'delete'] as const,
    publish: ['teacher', 'local-notes', 'publish'] as const,
    publishAll: ['teacher', 'local-notes', 'publish-all'] as const,
    clearAfterPublish: ['teacher', 'local-notes', 'clear-after-publish'] as const,
    updateGrade: ['teacher', 'local-notes', 'update-grade'] as const,
  },
}
