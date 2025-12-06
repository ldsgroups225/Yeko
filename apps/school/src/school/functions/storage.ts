import { Buffer } from 'node:buffer'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

// Maximum file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const uploadPhotoSchema = z.object({
  // Base64 encoded image data (after cropping)
  imageData: z.string().min(1, 'Image data is required'),
  // Original filename for extension
  filename: z.string().min(1, 'Filename is required'),
  // Entity type (student, staff, etc.)
  entityType: z.enum(['student', 'staff', 'user']),
  // Entity ID
  entityId: z.string().min(1, 'Entity ID is required'),
})

/**
 * Upload a photo to R2 storage
 * Returns the public URL of the uploaded image
 */
export const uploadPhoto = createServerFn()
  .inputValidator(uploadPhotoSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('students', 'edit')

    const { imageData, entityType, entityId } = data

    // Validate base64 data
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches || !matches[1] || !matches[2]) {
      throw new Error('Invalid image data format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    // Validate mime type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      throw new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`)
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    // Generate unique filename
    const ext = mimeType.split('/')[1] ?? 'jpg'
    const timestamp = Date.now()
    const key = `${context.schoolId}/${entityType}/${entityId}/${timestamp}.${ext}`

    // For now, we'll store as a data URL since R2 requires worker env access
    // In production, this would upload to R2 and return the public URL
    // TODO: Implement actual R2 upload when bucket is configured

    // Return the data URL for now (works for development)
    // In production, replace with R2 URL
    const photoUrl = imageData

    return {
      success: true,
      photoUrl,
      key,
    }
  })

/**
 * Delete a photo from storage
 */
export const deletePhoto = createServerFn()
  .inputValidator(z.object({
    key: z.string().min(1, 'Key is required'),
  }))
  .handler(async ({ data: _data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('students', 'edit')

    // TODO: Implement actual R2 deletion when bucket is configured
    // For now, just return success
    // const { key } = _data

    return {
      success: true,
    }
  })
