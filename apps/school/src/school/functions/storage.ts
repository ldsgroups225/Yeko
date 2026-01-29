import process from 'node:process'
import {
  generatePresignedUploadUrl,
  initR2,
  isR2Configured,
  isValidFileSize,
  isValidImageType,
} from '@repo/data-ops'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

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

export const getPresignedUploadUrl = authServerFn
  .inputValidator(data => GetPresignedUrlSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'edit')

    const { filename, contentType, fileSize, entityType, entityId } = data

    // Try to initialize R2 from environment variables
    ensureR2Initialized()

    // Check if R2 is configured
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
        folder: `${context.school.schoolId}/${entityType}/${entityId}`,
        expiresIn: 3600, // 1 hour
      })

      return {
        success: true as const,
        data: {
          presignedUrl: result.presignedUrl,
          publicUrl: result.publicUrl,
          key: result.key,
          configured: true,
        },
      }
    }
    catch (error) {
      console.error('Failed to generate presigned URL:', error)
      return {
        success: false as const,
        error: 'Échec de la génération de l\'URL de téléchargement.',
        configured: true,
      }
    }
  })

export const checkStorageConfigured = authServerFn.handler(async () => {
  // Try to initialize R2 from environment variables
  ensureR2Initialized()

  return {
    success: true as const,
    data: {
      configured: isR2Configured(),
    },
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
export const uploadPhoto = authServerFn
  .inputValidator(data => uploadPhotoSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'edit')

    const { imageData } = data

    // For backward compatibility, return the base64 data URL
    // New code should use getPresignedUploadUrl instead
    return {
      success: true as const,
      data: {
        photoUrl: imageData,
        key: '',
      },
    }
  })

/**
 * Delete a photo from storage
 */
export const deletePhoto = authServerFn
  .inputValidator(
    z.object({
      key: z.string().min(1, 'Key is required'),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'edit')

    const { key } = data

    // 1. Auditing & Soft Delete in DB (using school_files table)
    const { getDb } = await import('@repo/data-ops/database/setup')
    const { schoolFiles } = await import('@repo/data-ops/drizzle/school-schema')
    const { createAuditLog } = await import('@repo/data-ops/queries/school-admin/audit')
    const { deleteFile: r2DeleteFile, eq } = await import('@repo/data-ops')

    const db = getDb()

    // 1a. Mark as deleted in DB (Soft-Delete)
    await db.update(schoolFiles)
      .set({
        deletedAt: new Date(),
        deletedBy: context.school.userId,
      })
      .where(eq(schoolFiles.key, key))

    // 1b. Create Audit Log
    await createAuditLog({
      schoolId: context.school.schoolId,
      userId: context.school.userId,
      action: 'delete',
      tableName: 'school_files',
      recordId: key,
      oldValues: { key },
    })

    // 2. Physical Delete from R2
    ensureR2Initialized()
    const successResult = await r2DeleteFile(key)

    return {
      success: true as const,
      data: {
        success: successResult,
      },
    }
  })
