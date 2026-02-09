import { IconAlertCircle, IconCircleCheck, IconDatabase, IconDownload, IconFileText, IconInfoCircle, IconLoader2, IconMail, IconPhone, IconSettings, IconShield, IconUpload } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { formatPhone } from '@/utils/formatPhone'
import { generateUUID } from '@/utils/generateUUID'

interface ImportRow {
  name: string
  email: string
  phone?: string
  roles: string
  status?: string
  error?: string
}

export function BulkImportUsers() {
  const t = useTranslations()
  const [, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ success: number, failed: number } | null>(null)

  const downloadTemplate = () => {
    const csv = `name,email,phone,roles,status
John Doe,john@example.com,+225 01 02 03 04,school_director,active
Jane Smith,jane@example.com,+225 05 06 07 08,academic_coordinator,active`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length === 0)
        return

      const rows: ImportRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]?.split(',').map(v => v.trim()) || []
        const row: ImportRow = {
          name: values[0] || '',
          email: values[1] || '',
          phone: values[2] || '',
          roles: values[3] || '',
          status: values[4] || 'active',
        }

        if (!row.name || row.name.length < 2) {
          row.error = t.validation.required()
        }
        else if (!row.email || !row.email.includes('@')) {
          row.error = t.validation.email()
        }
        else if (!row.roles) {
          row.error = t.hr.users.rolesRequired()
        }

        rows.push(row)
      }

      setPreview(rows)
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile)
      return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error(t.hr.users.invalidFileType())
      return
    }

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const handleImport = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const validRows = preview.filter(row => !row.error)
    const invalidRows = preview.filter(row => row.error)

    setResults({
      success: validRows.length,
      failed: invalidRows.length,
    })

    setIsProcessing(false)

    if (validRows.length > 0) {
      toast.success(
        t.hr.users.importSuccess({ count: validRows.length }),
      )
    }
    if (invalidRows.length > 0) {
      toast.error(
        t.hr.users.importErrors({ count: invalidRows.length }),
      )
    }
  }

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Step 1 */}
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconFileText className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-serif font-semibold">{t.hr.users.step1()}</h2>
          </div>
          <p className="mb-8 text-sm text-muted-foreground leading-relaxed flex-1">
            {t.hr.users.downloadTemplateDescription()}
          </p>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="w-full rounded-xl h-11 font-semibold border-border/40 bg-background/50 hover:bg-background transition-all shadow-sm group"
          >
            <IconDownload className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            {t.hr.users.downloadTemplate()}
          </Button>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconUpload className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-serif font-semibold">{t.hr.users.step2()}</h2>
          </div>
          <p className="mb-8 text-sm text-muted-foreground leading-relaxed flex-1">
            {t.hr.users.uploadFileDescription()}
          </p>
          <div className="space-y-3">
            <Label htmlFor="csv-file" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.hr.users.selectFile()}</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="rounded-xl h-11 border-border/40 bg-background/50 focus:bg-background transition-all cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {preview.length > 0 && (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
          >
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconDatabase className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-serif font-semibold">{t.hr.users.step3()}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-muted/50 border-border/40 font-semibold uppercase text-[10px] tracking-wider">
                  {preview.length}
                  {' '}
                  {t.hr.users.totalRows()}
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-success/10 text-success border-success/20 font-semibold uppercase text-[10px] tracking-wider">
                  {preview.filter(r => !r.error).length}
                  {' '}
                  {t.hr.users.validRows()}
                </Badge>
                {preview.filter(r => r.error).length > 0 && (
                  <Badge variant="outline" className="rounded-full px-3 py-1 bg-destructive/10 text-destructive border-destructive/20 font-semibold uppercase text-[10px] tracking-wider">
                    {preview.filter(r => r.error).length}
                    {' '}
                    {t.hr.users.invalidRows()}
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden mb-8 shadow-inner">
              <Table>
                <TableHeader className="bg-muted/50 backdrop-blur-md">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="w-[80px] text-xs uppercase tracking-wider font-bold py-4">{t.hr.users.status()}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-bold py-4">{t.hr.common.name()}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-bold py-4">{t.hr.common.email()}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-bold py-4">{t.hr.common.phone()}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-bold py-4">{t.hr.common.roles()}</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-bold py-4">{t.hr.users.error()}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, idx) => (
                    <motion.tr
                      key={`${row.email}-${generateUUID()}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-border/40 hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="py-4">
                        {row.error
                          ? (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                <IconAlertCircle className="h-4 w-4" />
                              </div>
                            )
                          : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
                                <IconCircleCheck className="h-4 w-4" />
                              </div>
                            )}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground py-4">{row.name}</TableCell>
                      <TableCell className="py-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <IconMail className="h-3 w-3" />
                          {row.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground whitespace-nowrap">
                        {row.phone
                          ? (
                              <div className="flex items-center gap-1.5">
                                <IconPhone className="h-3 w-3" />
                                {formatPhone(row.phone)}
                              </div>
                            )
                          : '-'}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <IconShield className="h-3 w-3 text-primary/60" />
                          <span className="font-medium text-foreground">{row.roles}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {row.error && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-destructive uppercase tracking-tight">
                            <IconInfoCircle className="h-3 w-3" />
                            {row.error}
                          </div>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end items-center gap-4">
              <Button
                variant="ghost"
                className="rounded-xl px-6 font-medium bg-muted hover:bg-muted/80 transition-colors"
                onClick={() => {
                  setFile(null)
                  setPreview([])
                  setResults(null)
                }}
              >
                {t.common.cancel()}
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  isProcessing
                  || preview.filter(r => !r.error).length === 0
                }
                className="rounded-xl px-8 min-w-[160px] font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing
                  ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground/80" />
                        {t.hr.users.importing()}
                      </>
                    )
                  : (
                      <>
                        <IconUpload className="mr-2 h-4 w-4 group-hover:-translate-y-0.5" />
                        {t.hr.users.importUsers()}
                      </>
                    )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results && (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconSettings className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-serif font-semibold">{t.hr.users.importResults()}</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/10 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                  <IconCircleCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success leading-none">{results.success}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-success/70 mt-1">{t.hr.users.usersImported()}</p>
                </div>
              </div>

              {results.failed > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <IconAlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive leading-none">{results.failed}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-destructive/70 mt-1">{t.hr.users.usersFailed()}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
