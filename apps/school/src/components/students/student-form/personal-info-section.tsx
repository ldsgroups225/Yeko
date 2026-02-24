import { IconLoader2, IconRefresh, IconUpload } from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { useTranslations } from '@/i18n'
import { useStudentForm } from './student-form-context'

export function PersonalInfoSection() {
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { state, actions } = useStudentForm()
  const { mode, student, isUploadingPhoto } = state
  const { form, setShowPhotoDialog, handlePhotoUpload, generateMatricule } = actions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/20 bg-white/50 backdrop-blur-xl dark:bg-card/20"
    >
      <div className="border-b border-border/10 bg-white/30 px-6 py-4">
        <h3 className="text-lg font-semibold">{t.students.personalInfo()}</h3>
      </div>
      <div className="p-6 space-y-8">
        {/* Photo Upload */}
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={form.watch('photoUrl') || undefined} />
            <AvatarFallback className="text-2xl">
              {form.watch('firstName')?.[0]}
              {form.watch('lastName')?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            {mode === 'edit' && student?.id
              ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPhotoDialog(true)}
                  >
                    <IconUpload className="mr-2 h-4 w-4" />
                    {t.students.uploadPhoto()}
                  </Button>
                )
              : (
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    {isUploadingPhoto ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconUpload className="h-4 w-4" />}
                    {isUploadingPhoto ? t.common.uploading() : t.students.uploadPhoto()}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={isUploadingPhoto}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file)
                          handlePhotoUpload(file)
                        if (fileInputRef.current)
                          fileInputRef.current.value = ''
                      }}
                    />
                  </label>
                )}
            <p className="text-sm text-muted-foreground">
              {t.students.photoRequirements()}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.students.lastName()}
                  {' '}
                  *
                </FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.students.firstName()}
                  {' '}
                  *
                </FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.students.dateOfBirth()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <DatePicker
                    captionLayout="dropdown"
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={date => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    placeholder={t.students.dateOfBirth()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.students.gender()}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t.students.selectGender()}>
                        {field.value && (
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${
                              field.value === 'M' ? 'bg-blue-500' : field.value === 'F' ? 'bg-pink-500' : 'bg-gray-500'
                            }`}
                            />
                            <span className="ml-2">
                              {field.value === 'M' ? t.students.male() : field.value === 'F' ? t.students.female() : t.students.other()}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="M">{t.students.male()}</SelectItem>
                    <SelectItem value="F">{t.students.female()}</SelectItem>
                    <SelectItem value="other">{t.students.other()}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthPlace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.students.birthPlace()}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.students.nationality()}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="matricule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.students.matricule()}</FormLabel>
                <div className="flex gap-2">
                  <FormControl><Input {...field} placeholder={t.students.matriculePlaceholder()} /></FormControl>
                  {mode === 'create' && (
                    <Button type="button" variant="outline" onClick={generateMatricule}>
                      <IconRefresh className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormDescription>{t.students.matriculeDescription()}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.students.admissionDate()}</FormLabel>
                <FormControl>
                  <DatePicker
                    captionLayout="dropdown"
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={date => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    placeholder={t.students.admissionDate()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="previousSchool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.students.previousSchool()}</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  )
}
