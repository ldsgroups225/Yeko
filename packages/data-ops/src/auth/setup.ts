import type { BetterAuthOptions } from 'better-auth'
import { betterAuth } from 'better-auth'

export function createBetterAuth(config: {
  database: BetterAuthOptions['database']
  secret?: BetterAuthOptions['secret']
  baseURL?: BetterAuthOptions['baseURL']
  socialProviders?: BetterAuthOptions['socialProviders']
  emailAndPassword?: BetterAuthOptions['emailAndPassword']
}): ReturnType<typeof betterAuth> {
  return betterAuth({
    database: config.database,
    secret: config.secret,
    baseURL: config.baseURL,
    emailAndPassword: config.emailAndPassword ?? {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: config.socialProviders,
    user: {
      modelName: 'auth_user',
    },
    session: {
      modelName: 'auth_session',
    },
    verification: {
      modelName: 'auth_verification',
    },
    account: {
      modelName: 'auth_account',
    },
  })
}
