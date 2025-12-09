// packages/data-ops/src/storage/upload.ts
// Cloudflare Workers compatible presigned URL generation using aws4fetch
import { getR2Client, getR2Config, getR2Endpoint, isR2Configured } from './r2-client'

export interface PresignedUrlOptions {
  filename: string
  contentType: string
  folder?: string
  expiresIn?: number // seconds, default 3600 (1 hour)
}

export interface PresignedUrlResult {
  presignedUrl: string
  publicUrl: string
  key: string
}

/**
 * Generate a presigned URL for uploading a file to R2
 * Uses aws4fetch which is compatible with Cloudflare Workers
 */
export async function generatePresignedUploadUrl(
  options: PresignedUrlOptions,
): Promise<PresignedUrlResult> {
  if (!isR2Configured()) {
    throw new Error('R2 storage is not configured')
  }

  const client = getR2Client()
  const config = getR2Config()
  const endpoint = getR2Endpoint()

  // Generate a unique key for the file
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const sanitizedFilename = options.filename.replace(/[^a-z0-9.-]/gi, '_')
  const folder = options.folder ? `${options.folder}/` : ''
  const key = `${folder}${timestamp}-${randomSuffix}-${sanitizedFilename}`

  // Build the URL for the object
  const expiresIn = options.expiresIn || 3600
  const objectUrl = new URL(`/${config.bucketName}/${key}`, endpoint)

  // Add X-Amz-Expires as query parameter (not header) for presigned URLs
  objectUrl.searchParams.set('X-Amz-Expires', String(expiresIn))

  // Create a signed request for PUT operation using aws4fetch
  const signedRequest = await client.sign(objectUrl.toString(), {
    method: 'PUT',
    aws: {
      signQuery: true, // Sign as query parameters for presigned URL
      allHeaders: true,
    },
  })

  const presignedUrl = signedRequest.url

  // Construct the public URL
  const publicUrl = config.publicUrl
    ? `${config.publicUrl}/${key}`
    : `${endpoint}/${config.bucketName}/${key}`

  return {
    presignedUrl,
    publicUrl,
    key,
  }
}

/**
 * Validate file type for image uploads
 */
export function isValidImageType(contentType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ]
  return validTypes.includes(contentType)
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 5): boolean {
  return size <= maxSizeMB * 1024 * 1024
}
