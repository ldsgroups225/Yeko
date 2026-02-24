import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useStudentForm } from './student-form-context'

export function MedicalInfoSection() {
  const t = useTranslations()
  const { actions } = useStudentForm()
  const { form } = actions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/20 bg-white/50 backdrop-blur-xl dark:bg-card/20"
    >
      <div className="border-b border-border/10 bg-white/30 px-6 py-4">
        <h3 className="text-lg font-semibold">{t.students.medicalInfo()}</h3>
      </div>
      <div className="p-6 space-y-6">
        <FormField
          control={form.control}
          name="bloodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.students.bloodType()}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t.students.selectBloodType()}>
                      {field.value && (
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            field.value.includes('+') ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          />
                          <span className="ml-2">{field.value}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.students.medicalNotes()}</FormLabel>
              <FormControl><Textarea {...field} rows={4} placeholder={t.students.medicalNotesPlaceholder()} /></FormControl>
              <FormDescription>{t.students.medicalNotesDescription()}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  )
}
