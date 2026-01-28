// packages/data-ops/src/storage/index.ts
export { getR2Client, getR2Config, getR2Endpoint, initR2, isR2Configured } from './r2-client'
export type { R2Config } from './r2-client'
export {
  deleteFile,
  generatePresignedUploadUrl,
  isValidFileSize,
  isValidImageType,
} from './upload'
export type { PresignedUrlOptions, PresignedUrlResult } from './upload'
