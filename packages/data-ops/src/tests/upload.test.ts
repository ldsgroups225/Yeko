import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePresignedUploadUrl } from '../storage/upload'
import { initR2 } from '../storage/r2-client'

describe('upload storage', () => {
  beforeEach(() => {
    initR2({
      accountId: 'test-account',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      bucketName: 'test-bucket',
    })
  })

  it('sanitizes folder parameter to prevent path traversal', async () => {
    // Need to mock fetch or let it fail gracefully since we aren't testing aws4fetch logic
    const result = await generatePresignedUploadUrl({
      filename: 'test.png',
      contentType: 'image/png',
      folder: '../../secret-folder/../',
    })

    expect(result.key).not.toContain('..')
    expect(result.key).toContain('_/_/secret-folder/_/')
  })
})
