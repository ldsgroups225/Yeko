import type { LogMessage } from '@repo/background-tasks'

export interface Env {
  DATABASE_HOST: string
  DATABASE_USERNAME: string
  DATABASE_PASSWORD: string
}

export type QueueMessage = MessageBatch<LogMessage>
