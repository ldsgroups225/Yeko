import { useTranslations } from '@/i18n'
import { dayOfWeekLabels } from '@/schemas/timetable'
import { generateUUID } from '@/utils/generateUUID'
import { useTimetableImport } from './timetable-import-context'

export function TimetableImportPreview() {
  const t = useTranslations()
  const { state } = useTimetableImport()
  const { allParsed, countValid, preview } = state

  if (preview.length === 0)
    return null

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
        {t.timetables.preview.title()}
        {' '}
        (
        {countValid}
        {' '}
        {t.timetables.preview.validLines()}
        {' '}
        /
        {' '}
        {allParsed.length}
        )
      </div>
      <div className="max-h-[300px] overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/10 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">{t.timetables.columns.class()}</th>
              <th className="px-3 py-2 text-left">{t.timetables.columns.subject()}</th>
              <th className="px-3 py-2 text-left">{t.timetables.columns.teacher()}</th>
              <th className="px-3 py-2 text-left">{t.timetables.columns.day()}</th>
              <th className="px-3 py-2 text-left">{t.timetables.columns.time()}</th>
              <th className="px-3 py-2 text-left">{t.timetables.columns.status()}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {allParsed.slice(0, 100).map((row) => {
              const isValid = row.classId && row.subjectId && row.teacherId && row.dayOfWeek > 0
              return (
                <tr key={generateUUID()} className={!isValid ? 'bg-destructive/10' : ''}>
                  <td className="px-3 py-2">
                    {row.className}
                    {!row.classId && <span className="block text-[10px] text-destructive font-bold">{t.timetables.status.notFound()}</span>}
                  </td>
                  <td className="px-3 py-2">
                    {row.subjectName}
                    {!row.subjectId && <span className="block text-[10px] text-destructive font-bold">{t.timetables.status.notFound()}</span>}
                  </td>
                  <td className="px-3 py-2">
                    {row.teacherName}
                    {!row.teacherId && <span className="block text-[10px] text-destructive font-bold">{t.timetables.status.notFound()}</span>}
                  </td>
                  <td className="px-3 py-2">
                    {dayOfWeekLabels[row.dayOfWeek] || row.dayOfWeek || t.timetables.status.error()}
                  </td>
                  <td className="px-3 py-2">
                    {row.startTime}
                    {' '}
                    -
                    {' '}
                    {row.endTime}
                  </td>
                  <td className="px-3 py-2 font-bold">
                    {isValid ? <span className="text-green-500">{t.timetables.status.ok()}</span> : <span className="text-destructive">{t.timetables.status.error()}</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
