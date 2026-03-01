import type { StudentFormProps } from './student-form/types'
import { Form } from '@workspace/ui/components/form'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { lazy, Suspense } from 'react'
import { useTranslations } from '@/i18n'
import { ContactInfoSection } from './student-form/contact-info-section'
import { MedicalInfoSection } from './student-form/medical-info-section'
import { PersonalInfoSection } from './student-form/personal-info-section'
import { StudentFormActions } from './student-form/student-form-actions'
import { useStudentForm } from './student-form/student-form-context'
import { StudentFormProvider } from './student-form/student-form-provider'

const StudentFormDialogs = lazy(() => import('./student-form/student-form-dialogs'))

function StudentFormInner() {
  const t = useTranslations()
  const { actions } = useStudentForm()
  const { form, onSubmit } = actions

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full space-y-8">
          <TabsList className="
            dark:bg-card/40
            border-border/20
            dark:border-border/10
            inline-flex h-auto w-full justify-start rounded-full border
            bg-white/40 p-1 backdrop-blur-md
            md:w-auto
          "
          >
            <TabsTrigger
              value="personal"
              className="
                data-[state=active]:text-primary
                rounded-full px-6 py-2.5 transition-all
                data-[state=active]:bg-white data-[state=active]:shadow-sm
              "
            >
              {t.students.personalInfo()}
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="
                data-[state=active]:text-primary
                rounded-full px-6 py-2.5 transition-all
                data-[state=active]:bg-white data-[state=active]:shadow-sm
              "
            >
              {t.students.contactInfo()}
            </TabsTrigger>
            <TabsTrigger
              value="medical"
              className="
                data-[state=active]:text-primary
                rounded-full px-6 py-2.5 transition-all
                data-[state=active]:bg-white data-[state=active]:shadow-sm
              "
            >
              {t.students.medicalInfo()}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <PersonalInfoSection />
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <ContactInfoSection />
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <MedicalInfoSection />
          </TabsContent>
        </Tabs>

        <StudentFormActions />
      </form>

      <Suspense fallback={null}>
        <StudentFormDialogs />
      </Suspense>
    </Form>
  )
}

export function StudentForm(props: StudentFormProps) {
  return (
    <StudentFormProvider {...props}>
      <StudentFormInner />
    </StudentFormProvider>
  )
}
