import { IconDownload, IconFileText, IconUpload } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useBulkImport } from './bulk-import-context'

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function BulkImportSteps() {
  const t = useTranslations()
  const { actions } = useBulkImport()
  const { downloadTemplate, handleFileChange } = actions

  return (
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
          <Label htmlFor="csv-file" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.hr.users.selectFile()}
          </Label>
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
  )
}
