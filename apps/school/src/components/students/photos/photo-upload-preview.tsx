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
        <AvatarFallback className="text-4xl bg-muted">
          {entityName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-card/30 p-8 transition-all hover:border-primary hover:bg-card/50 hover:shadow-sm">
        <IconUpload className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="font-medium text-lg">{t.students.clickToUpload()}</p>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">{t.students.photoRequirements()}</p>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileSelect} className="sr-only" />
      </label>
    </div>
  )
}
