import type { Crop } from 'react-image-crop'
import { IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import ReactCrop from 'react-image-crop'
import { useTranslations } from '@/i18n'
import 'react-image-crop/dist/ReactCrop.css'

interface PhotoUploadEditorProps {
  imgSrc: string
  crop: Crop | undefined
  onCropChange: (crop: Crop) => void
  onCropComplete: (crop: Crop) => void
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void
  imgRef: React.RefObject<HTMLImageElement | null>
  onReset: () => void
  aspectRatio: number
  minDimension: number
}

export function PhotoUploadEditor({
  imgSrc,
  crop,
  onCropChange,
  onCropComplete,
  onImageLoad,
  imgRef,
  onReset,
  aspectRatio,
  minDimension,
}: PhotoUploadEditorProps) {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <div className="
        bg-card/50 border-border/20 flex justify-center overflow-hidden
        rounded-xl border p-4 backdrop-blur-sm
      "
      >
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => onCropChange(percentCrop)}
          onComplete={c => onCropComplete(c)}
          aspect={aspectRatio}
          minWidth={minDimension}
          minHeight={minDimension}
          circularCrop
          className="max-h-[400px]"
        >
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Crop preview"
            onLoad={onImageLoad}
            className="max-h-[400px] object-contain"
          />
        </ReactCrop>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={onReset}>
          <IconX className="mr-2 h-4 w-4" />
          {t.students.chooseAnother()}
        </Button>
      </div>
    </div>
  )
}
