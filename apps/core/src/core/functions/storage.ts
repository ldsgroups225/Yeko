import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Helper function to safely get env vars (process.env or import.meta.env)
function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env)
    return process.env[key]
  if (typeof import.meta !== 'undefined' && import.meta.env)
    return import.meta.env[key]
  return undefined
}

// Auto-initialize R2 from environment variables if available
async function ensureR2Initialized() {
  const { isR2Configured, initR2 } = await import('@repo/data-ops/storage')
  if (isR2Configured())
    return true

  const accountId = getEnv('R2_ACCOUNT_ID')
  const accessKeyId = getEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = getEnv('R2_SECRET_ACCESS_KEY')
  const bucketName = getEnv('R2_BUCKET_NAME')
  const publicUrl = getEnv('R2_PUBLIC_URL')

  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    initR2({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl,
    })
    return true
  }

  return false
}

const GetPresignedUrlSchema = z.object({
  filename: z.string().min(1, 'Le nom du fichier est requis'),
  contentType: z.string().min(1, 'Le type de contenu est requis'),
  fileSize: z.number().positive('La taille du fichier doit être positive'),
  folder: z.string().optional(),
})

export const getPresignedUploadUrl = createServerFn()
  .inputValidator(data => GetPresignedUrlSchema.parse(data))
  .handler(async (ctx) => {
    const { filename, contentType, fileSize, folder } = ctx.data
    const { isR2Configured, isValidImageType, isValidFileSize, generatePresignedUploadUrl } = await import('@repo/data-ops/storage')

    // Try to initialize R2 from environment variables
    await ensureR2Initialized()

    // Check if R2 is configured
    if (!isR2Configured()) {
      return {
        success: false as const,
        error: 'Le stockage de fichiers n\'est pas configuré. Veuillez utiliser une URL externe.',
        configured: false,
      }
    }

    // Validate image type
    if (!isValidImageType(contentType)) {
      return {
        success: false as const,
        error: 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF, WebP ou SVG.',
        configured: true,
      }
    }

    // Validate file size (max 5MB)
    if (!isValidFileSize(fileSize, 5)) {
      return {
        success: false as const,
        error: 'Le fichier est trop volumineux. Taille maximale: 5MB.',
        configured: true,
      }
    }

    try {
      const result = await generatePresignedUploadUrl({
        filename,
        contentType,
        folder: folder || 'logos',
        expiresIn: 3600, // 1 hour
      })

      return {
        success: true as const,
        presignedUrl: result.presignedUrl,
        publicUrl: result.publicUrl,
        key: result.key,
        configured: true,
        isR2: true,
      }
    }
    catch (error) {
      console.error('Failed to generate presigned URL:', error)
      return {
        success: false as const,
        error: 'Erreur lors de la génération de l\'URL de téléversement.',
        configured: true,
      }
    }
  })

export const checkStorageConfigured = createServerFn()
  .handler(async () => {
    const { isR2Configured } = await import('@repo/data-ops/storage')
    // Try to initialize R2 from environment variables
    await ensureR2Initialized()

    return {
      configured: isR2Configured(),
    }
  })
