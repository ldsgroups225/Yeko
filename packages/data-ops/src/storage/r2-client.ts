// packages/data-ops/src/storage/r2-client.ts
// Using aws4fetch for Cloudflare Workers compatibility
import { AwsClient } from 'aws4fetch'

let r2Client: AwsClient | null = null

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl?: string
}

let r2Config: R2Config | null = null

export function initR2(config: R2Config) {
  r2Config = config
  r2Client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: 's3',
    region: 'auto',
  })
  return r2Client
}

export function getR2Client(): AwsClient {
  if (!r2Client) {
    throw new Error('R2 client not initialized. Call initR2() first.')
  }
  return r2Client
}

export function getR2Config(): R2Config {
  if (!r2Config) {
    throw new Error('R2 config not initialized. Call initR2() first.')
  }
  return r2Config
}

export function isR2Configured(): boolean {
  return r2Client !== null && r2Config !== null
}

export function getR2Endpoint(): string {
  if (!r2Config) {
    throw new Error('R2 config not initialized.')
  }
  return `https://${r2Config.accountId}.r2.cloudflarestorage.com`
}
