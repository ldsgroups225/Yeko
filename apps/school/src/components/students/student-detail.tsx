import { useQuery } from '@tanstack/react-query'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslations } from '@/i18n'
import { studentsOptions } from '@/lib/queries/students'
import { StudentDetailDialogs } from './student-detail/student-detail-dialogs'
import { StudentDetailHeader } from './student-detail/student-detail-header'
import { StudentDetailHistory } from './student-detail/student-detail-history'
import { StudentDetailInfo } from './student-detail/student-detail-info'
import { StudentDetailParents } from './student-detail/student-detail-parents'
import { StudentDetailSkeleton } from './student-detail/student-detail-skeleton'

interface StudentDetailProps {
  studentId: string
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const t = useTranslations()
  const { data: student, isPending } = useQuery(studentsOptions.detail(studentId))

  const [parentDialogOpen, setParentDialogOpen] = useState(false)
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)

  if (isPending) {
    return <StudentDetailSkeleton />
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t.students.notFound()}</p>
      </div>
    )
  }

  const currentEnrollment = student.enrollmentHistory?.[0]?.enrollment
  const currentClass = student.enrollmentHistory?.[0]?.class
  const parents = student.parents || []
  const enrollmentHistory = student.enrollmentHistory || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Profile Card */}
      <StudentDetailHeader
        student={student}
        studentId={studentId}
        onEditPhoto={() => setPhotoDialogOpen(true)}
      />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-8 p-1 h-auto bg-white/40 dark:bg-card/40 backdrop-blur-md rounded-full border border-border/20 dark:border-border/10 w-full md:w-auto inline-flex justify-start">
          <TabsTrigger
            value="info"
            className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            {t.students.personalInfo()}
          </TabsTrigger>
          <TabsTrigger
            value="parents"
            className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            {t.students.parents()}
          </TabsTrigger>
          <TabsTrigger
            value="enrollments"
            className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            {t.students.enrollmentHistory()}
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <StudentDetailInfo
            student={student}
            onEnroll={() => setEnrollmentDialogOpen(true)}
            onTransfer={() => setTransferDialogOpen(true)}
          />
        </TabsContent>

        {/* Parents Tab */}
        <TabsContent value="parents" className="space-y-4">
          <StudentDetailParents
            parents={parents}
            onLinkParent={() => setParentDialogOpen(true)}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <StudentDetailHistory
            enrollmentHistory={enrollmentHistory}
            onEnroll={() => setEnrollmentDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StudentDetailDialogs
        studentId={studentId}
        studentName={`${student.firstName} ${student.lastName}`}
        photoUrl={student.photoUrl}
        currentEnrollment={currentEnrollment}
        currentClass={currentClass}
        parentDialogOpen={parentDialogOpen}
        setParentDialogOpen={setParentDialogOpen}
        enrollmentDialogOpen={enrollmentDialogOpen}
        setEnrollmentDialogOpen={setEnrollmentDialogOpen}
        transferDialogOpen={transferDialogOpen}
        setTransferDialogOpen={setTransferDialogOpen}
        photoDialogOpen={photoDialogOpen}
        setPhotoDialogOpen={setPhotoDialogOpen}
      />
    </motion.div>
  )
}
