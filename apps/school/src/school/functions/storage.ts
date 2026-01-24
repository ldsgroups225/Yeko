import process from 'node:process'
import {
  generatePresignedUploadUrl,
  initR2,
  isR2Configured,
  isValidFileSize,
  isValidImageType,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

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
  entityType: z.enum(['student', 'staff', 'user']),
  entityId: z.string().min(1, 'Entity ID is required'),
})

export const getPresignedUploadUrl = createServerFn()
  .inputValidator(data => GetPresignedUrlSchema.parse(data))
  .handler(async (ctx) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('students', 'edit')

    const { filename, contentType, fileSize, entityType, entityId } = ctx.data

    // Try to initialize R2 from environment variables
    ensureR2Initialized()

    // IconCheck if R2 is configured
    if (!isR2Configured()) {
      return {
        success: false as const,
        error:
          'Le stockage de fichiers n\'est pas configuré. Veuillez utiliser une URL externe.',
        configured: false,
      }
    }

    // Validate image type
    if (!isValidImageType(contentType)) {
      return {
        success: false as const,
        error:
          'Type de fichier non supporté. Utilisez JPEG, PNG, GIF, WebP ou SVG.',
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
        folder: `${context.schoolId}/${entityType}/${entityId}`,
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
        error: 'Failed to generate upload URL.',
        configured: true,
      }
    }
  })

export const checkStorageConfigured = createServerFn().handler(async () => {
  // Try to initialize R2 from environment variables
  ensureR2Initialized()

  return {
    configured: isR2Configured(),
  }
})

// Legacy function for backward compatibility with base64 uploads
const uploadPhotoSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
  filename: z.string().min(1, 'Filename is required'),
  entityType: z.enum(['student', 'staff', 'user']),
  entityId: z.string().min(1, 'Entity ID is required'),
})

/**
 * @deprecated Use getPresignedUploadUrl and upload directly to R2 instead
 * This function is kept for backward compatibility but stores as base64
 */
export const uploadPhoto = createServerFn()
  .inputValidator(data => uploadPhotoSchema.parse(data))
  .handler(async (ctx) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('students', 'edit')

    const { imageData } = ctx.data

    // For backward compatibility, return the base64 data URL
    // New code should use getPresignedUploadUrl instead
    return {
      success: true,
      photoUrl: imageData,
      key: '',
    }
  })

/**
 * Delete a photo from storage
 */
export const deletePhoto = createServerFn()
  .inputValidator(
    z.object({
      key: z.string().min(1, 'Key is required'),
    }),
  )
  .handler(async (_ctx) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('students', 'edit')

    // TODO: Implement actual R2 deletion when needed
    // For now, just return success
    return {
      success: true,
    }
  })
