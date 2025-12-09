import {
  generatePresignedUploadUrl,
  initR2,
  isR2Configured,
  isValidFileSize,
  isValidImageType,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Auto-initialize R2 from environment variables if available
function ensureR2Initialized() {
  if (isR2Configured())
    return true

  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME
  const publicUrl = process.env.R2_PUBLIC_URL

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

    // Try to initialize R2 from environment variables
    ensureR2Initialized()

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
    // Try to initialize R2 from environment variables
    ensureR2Initialized()

    return {
      configured: isR2Configured(),
    }
  })
