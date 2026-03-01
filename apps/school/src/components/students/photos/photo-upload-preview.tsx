import { IconUpload } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { useTranslations } from '@/i18n'

interface PhotoUploadPreviewProps {
  currentPhotoUrl?: string | null
  entityName: string
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PhotoUploadPreview({ currentPhotoUrl, entityName, onFileSelect }: PhotoUploadPreviewProps) {
  const t = useTranslations()

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Avatar className="h-32 w-32">
        <AvatarImage src={currentPhotoUrl || undefined} />
        <AvatarFallback className="bg-muted text-4xl">
          {entityName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <label className="
        border-border/40 bg-card/30
        hover:border-primary hover:bg-card/50
        flex w-full cursor-pointer flex-col items-center justify-center
        rounded-xl border-2 border-dashed p-8 transition-all
        hover:shadow-sm
      "
      >
        <IconUpload className="text-muted-foreground mb-4 h-10 w-10" />
        <p className="text-lg font-medium">{t.students.clickToUpload()}</p>
        <p className="text-muted-foreground mt-2 max-w-xs text-center text-sm">{t.students.photoRequirements()}</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileSelect}
          className="sr-only"
        />
      </label>
    </div>
  )
}
