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
    <div className="
      grid gap-6
      md:grid-cols-2
    "
    >
      {/* Step 1 */}
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        className="
          border-border/40 bg-card/50 flex flex-col rounded-xl border p-8
          shadow-sm backdrop-blur-xl
        "
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="
            bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
            rounded-lg
          "
          >
            <IconFileText className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-semibold">{t.hr.users.step1()}</h2>
        </div>
        <p className="text-muted-foreground mb-8 flex-1 text-sm leading-relaxed">
          {t.hr.users.downloadTemplateDescription()}
        </p>
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="
            border-border/40 bg-background/50
            hover:bg-background
            group h-11 w-full rounded-xl font-semibold shadow-sm transition-all
          "
        >
          <IconDownload className="
            mr-2 h-4 w-4 transition-transform
            group-hover:-translate-y-0.5
          "
          />
          {t.hr.users.downloadTemplate()}
        </Button>
      </motion.div>

      {/* Step 2 */}
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
        className="
          border-border/40 bg-card/50 flex flex-col rounded-xl border p-8
          shadow-sm backdrop-blur-xl
        "
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="
            bg-primary/10 text-primary flex h-8 w-8 items-center justify-center
            rounded-lg
          "
          >
            <IconUpload className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-semibold">{t.hr.users.step2()}</h2>
        </div>
        <p className="text-muted-foreground mb-8 flex-1 text-sm leading-relaxed">
          {t.hr.users.uploadFileDescription()}
        </p>
        <div className="space-y-3">
          <Label
            htmlFor="csv-file"
            className="
              text-muted-foreground text-xs font-bold tracking-wider uppercase
            "
          >
            {t.hr.users.selectFile()}
          </Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="
              border-border/40 bg-background/50
              focus:bg-background
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90
              h-11 cursor-pointer rounded-xl transition-all
              file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-1
              file:text-xs file:font-semibold
            "
          />
        </div>
      </motion.div>
    </div>
  )
}
