import type { ParsedStudent } from './import-utils'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface ImportPreviewProps {
  preview: ParsedStudent[]
  totalItems: number
}

export function ImportPreview({ preview, totalItems }: ImportPreviewProps) {
  const t = useTranslations()

  if (preview.length === 0)
    return null

  return (
    <div className="rounded-sm border">
      <div className="bg-muted/50 border-b px-3 py-2 text-sm font-medium">
        {t.students.importPreview()}
      </div>
      <div className="max-h-40 overflow-auto p-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1 text-left">{t.students.lastName()}</th>
              <th className="px-2 py-1 text-left">{t.students.firstName()}</th>
              <th className="px-2 py-1 text-left">{t.students.dateOfBirth()}</th>
              <th className="px-2 py-1 text-left">{t.students.gender()}</th>
            </tr>
          </thead>
          <tbody>
            {preview.map(s => (
              <tr
                key={`preview-${generateUUID()}-${s.lastName}-${s.firstName}`}
                className="
                  border-b
                  last:border-0
                "
              >
                <td className="px-2 py-1">{s.lastName}</td>
                <td className="px-2 py-1">{s.firstName}</td>
                <td className="px-2 py-1">{s.dob}</td>
                <td className="px-2 py-1">{s.gender || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalItems > 5 && (
        <div className="
          bg-muted/30 text-muted-foreground border-t px-3 py-2 text-center
          text-sm
        "
        >
          {t.students.importAndMoreRows({ count: totalItems - 5 })}
        </div>
      )}
    </div>
  )
}
