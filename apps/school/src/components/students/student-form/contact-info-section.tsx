import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { PhoneInput } from '@workspace/ui/components/phone-number'
import { Textarea } from '@workspace/ui/components/textarea'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useStudentForm } from './student-form-context'

export function ContactInfoSection() {
  const t = useTranslations()
  const { actions } = useStudentForm()
  const { form } = actions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        border-border/20
        dark:bg-card/20
        rounded-xl border bg-white/50 backdrop-blur-xl
      "
    >
      <div className="border-border/10 border-b bg-white/30 px-6 py-4">
        <h3 className="text-lg font-semibold">{t.students.contactInfo()}</h3>
      </div>
      <div className="space-y-6 p-6">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.students.address()}</FormLabel>
              <FormControl><Textarea {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="
          grid gap-4
          sm:grid-cols-2
        "
        >
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.students.emergencyContact()}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormDescription>{t.students.emergencyContactDescription()}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.students.emergencyPhone()}</FormLabel>
                <FormControl><PhoneInput defaultCountry="CI" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}
