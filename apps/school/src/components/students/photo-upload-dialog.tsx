import type { Crop } from 'react-image-crop'
import {
  IconCamera,
  IconLoader2,
} from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useCallback, useRef, useState } from 'react'
import { centerCrop, makeAspectCrop } from 'react-image-crop'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getPresignedUploadUrl } from '@/school/functions/storage'
import { PhotoUploadEditor } from './photos/photo-upload-editor'
import { PhotoUploadPreview } from './photos/photo-upload-preview'

interface PhotoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPhotoUrl?: string | null
  entityType: 'student' | 'staff' | 'user'
  entityId: string
  entityName: string
  onPhotoUploaded: (photoUrl: string) => void
}

const ASPECT_RATIO = 1
const MIN_DIMENSION = 150

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

export function PhotoUploadDialog({ open, onOpenChange, currentPhotoUrl, entityType, entityId, entityName, onPhotoUploaded }: PhotoUploadDialogProps) {
  const t = useTranslations()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement>(null)

  const handleClose = () => {
    setSelectedFile(null)
    setImgSrc('')
    setCrop(undefined)
    setCompletedCrop(undefined)
    onOpenChange(false)
  }

  const uploadMutation = useMutation({
    mutationKey: schoolMutationKeys.students.uploadPhoto,
    mutationFn: async (blob: Blob) => {
      const result = await getPresignedUploadUrl({ data: { filename: selectedFile?.name || 'photo.jpg', contentType: selectedFile?.type || 'image/jpeg', fileSize: blob.size, folder: 'students-photo', entityType, entityId } })
      if (!result.success)
        throw new Error(result.error)
      await fetch(result.data.presignedUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': selectedFile?.type || 'image/jpeg' } })
      return { photoUrl: result.data.publicUrl }
    },
    onSuccess: (res) => {
      onPhotoUploaded(res.photoUrl)
      toast.success(t.students.photoUploadSuccess())
      handleClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return
    if (!file.type.startsWith('image/')) {
      toast.error(t.students.invalidFileType())
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.students.fileTooLarge())
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [t])

  const getCroppedImage = useCallback(async (): Promise<Blob> => {
    const image = imgRef.current
    if (!image || !completedCrop)
      throw new Error('No image or crop data')
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const outputSize = Math.min(400, completedCrop.width * scaleX)
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('Could not get canvas context')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, outputSize, outputSize)
    return new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed')), 'image/jpeg', 0.85))
  }, [completedCrop])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.students.uploadPhoto()}</DialogTitle>
          <DialogDescription>{t.students.uploadPhotoDescription({ name: entityName })}</DialogDescription>
        </DialogHeader>
        {!imgSrc
          ? <PhotoUploadPreview currentPhotoUrl={currentPhotoUrl} entityName={entityName} onFileSelect={handleFileSelect} />
          : (
              <PhotoUploadEditor
                imgSrc={imgSrc}
                crop={crop}
                onCropChange={setCrop}
                onCropComplete={setCompletedCrop}
                onImageLoad={(e) => {
                  const { width, height } = e.currentTarget
                  setCrop(centerAspectCrop(width, height, ASPECT_RATIO))
                }}
                imgRef={imgRef}
                onReset={() => {
                  setImgSrc('')
                  setSelectedFile(null)
                  setCrop(undefined)
                  setCompletedCrop(undefined)
                }}
                aspectRatio={ASPECT_RATIO}
                minDimension={MIN_DIMENSION}
              />
            )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>{t.common.cancel()}</Button>
          <Button
            onClick={async () => {
              try {
                uploadMutation.mutate(await getCroppedImage())
              }
              catch {
                toast.error(t.students.cropError())
              }
            }}
            disabled={(!completedCrop && !!imgSrc) || uploadMutation.isPending || (!imgSrc && !selectedFile)}
          >
            {uploadMutation.isPending ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconCamera className="mr-2 h-4 w-4" />}
            {t.students.savePhoto()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
