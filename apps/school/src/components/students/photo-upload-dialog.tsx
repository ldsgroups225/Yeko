'use client'

import type { Crop } from 'react-image-crop'
import { useMutation } from '@tanstack/react-query'
import { Camera, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { uploadPhoto } from '@/school/functions/storage'
import 'react-image-crop/dist/ReactCrop.css'

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
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  )
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  currentPhotoUrl,
  entityType,
  entityId,
  entityName,
  onPhotoUploaded,
}: PhotoUploadDialogProps) {
  const { t } = useTranslation()
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
    mutationFn: async (imageData: string) => {
      return uploadPhoto({
        data: {
          imageData,
          filename: selectedFile?.name || 'photo.jpg',
          entityType,
          entityId,
        },
      })
    },
    onSuccess: (result) => {
      onPhotoUploaded(result.photoUrl)
      toast.success(t('students.photoUploadSuccess'))
      handleClose()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    if (!file.type.startsWith('image/')) {
      toast.error(t('students.invalidFileType'))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('students.fileTooLarge'))
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setImgSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [t])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, ASPECT_RATIO))
  }, [])

  const getCroppedImage = useCallback(async (): Promise<string> => {
    const image = imgRef.current
    if (!image || !completedCrop) {
      throw new Error('No image or crop data')
    }

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

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize,
    )

    return canvas.toDataURL('image/jpeg', 0.85)
  }, [completedCrop])

  const handleUpload = async () => {
    try {
      const croppedImage = await getCroppedImage()
      uploadMutation.mutate(croppedImage)
    }
    catch {
      toast.error(t('students.cropError'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('students.uploadPhoto')}</DialogTitle>
          <DialogDescription>
            {t('students.uploadPhotoDescription', { name: entityName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!imgSrc
            ? (
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentPhotoUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {entityName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary hover:bg-muted/50">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 font-medium">{t('students.clickToUpload')}</p>
                    <p className="text-sm text-muted-foreground">{t('students.photoRequirements')}</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="sr-only"
                    />
                  </label>
                </div>
              )
            : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={c => setCompletedCrop(c)}
                      aspect={ASPECT_RATIO}
                      minWidth={MIN_DIMENSION}
                      minHeight={MIN_DIMENSION}
                      circularCrop
                      className="max-h-[400px]"
                    >
                      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                      <img
                        ref={imgRef}
                        src={imgSrc}
                        alt="Crop preview"
                        onLoad={onImageLoad}
                        className="max-h-[400px]"
                      />
                    </ReactCrop>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImgSrc('')
                        setSelectedFile(null)
                        setCrop(undefined)
                        setCompletedCrop(undefined)
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {t('students.chooseAnother')}
                    </Button>
                  </div>
                </div>
              )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!completedCrop || uploadMutation.isPending}
          >
            {uploadMutation.isPending
              ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )
              : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
            {t('students.savePhoto')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
