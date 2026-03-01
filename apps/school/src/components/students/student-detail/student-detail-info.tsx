import { formatDate, formatPhone } from '@repo/data-ops'
import {
  IconHeart,
  IconMapPin,
  IconSchool,
  IconUser,
} from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

interface StudentDetailInfoProps {
  student: any
  onEnroll: () => void
  onTransfer: () => void
}

export function StudentDetailInfo({ student, onEnroll, onTransfer }: StudentDetailInfoProps) {
  const t = useTranslations()

  const currentEnrollment = student.enrollmentHistory?.[0]?.enrollment
  const currentClass = student.enrollmentHistory?.[0]?.class

  return (
    <div className="
      grid gap-6
      md:grid-cols-2
    "
    >
      {/* Personal Details */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
      >
        <Card className="
          border-border/20
          dark:bg-card/20
          h-full bg-white/50 backdrop-blur-xl
        "
        >
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2 text-lg">
              <div className="bg-primary/10 rounded-lg p-2">
                <IconUser className="h-5 w-5" />
              </div>
              {t.students.personalInfo()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t.students.dateOfBirth()}
              value={formatDate(student.dob, 'MEDIUM')}
            />
            <InfoRow
              label={t.students.gender()}
              value={
                student.gender === 'M'
                  ? t.students.male()
                  : student.gender === 'F'
                    ? t.students.female()
                    : '-'
              }
            />
            <InfoRow
              label={t.students.birthPlace()}
              value={student.birthPlace}
            />
            <InfoRow
              label={t.students.nationality()}
              value={student.nationality}
            />
            <InfoRow
              label={t.students.admissionDate()}
              value={
                student.admissionDate
                  ? formatDate(student.admissionDate, 'MEDIUM')
                  : '-'
              }
            />
            <InfoRow
              label={t.students.previousSchool()}
              value={student.previousSchool}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Enrollment */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        <Card className="
          border-border/20
          dark:bg-card/20
          h-full bg-white/50 backdrop-blur-xl
        "
        >
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2 text-lg">
              <div className="bg-primary/10 rounded-lg p-2">
                <IconSchool className="h-5 w-5" />
              </div>
              {t.students.currentEnrollment()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentClass?.gradeName && currentClass?.section
              ? (
                  <>
                    <InfoRow
                      label={t.students.class()}
                      value={`${currentClass.gradeName} ${currentClass.section}${currentClass.seriesName ? ` (${currentClass.seriesName})` : ''}`}
                      highlight
                    />
                    <InfoRow
                      label={t.students.enrollmentDate()}
                      value={
                        currentEnrollment?.enrollmentDate
                          ? formatDate(currentEnrollment.enrollmentDate, 'MEDIUM')
                          : '-'
                      }
                    />
                    <InfoRow
                      label={t.students.rollNumber()}
                      value={currentEnrollment?.rollNumber?.toString()}
                    />
                    <InfoRow
                      label={t.students.enrollmentStatus()}
                      value={(() => {
                        const statusMap = {
                          confirmed: t.students.enrollmentConfirmed,
                          pending: t.students.enrollmentPending,
                          cancelled: t.students.enrollmentCancelled,
                          transferred: t.students.enrollmentTransferred,
                        } as Record<string, (() => string) | undefined>
                        const translationFn = currentEnrollment?.status
                          ? statusMap[currentEnrollment.status]
                          : undefined
                        return translationFn ? translationFn() : (currentEnrollment?.status ?? '-')
                      })()}
                    />
                    {currentEnrollment?.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="
                          border-primary/20
                          hover:bg-primary/5 hover:text-primary
                          mt-4 w-full
                        "
                        onClick={onTransfer}
                      >
                        {t.students.transferStudent()}
                      </Button>
                    )}
                  </>
                )
              : (
                  <div className="
                    text-muted-foreground flex h-32 flex-col items-center
                    justify-center text-center
                  "
                  >
                    <p>{t.students.notEnrolled()}</p>
                    <Button
                      variant="link"
                      onClick={onEnroll}
                    >
                      {t.students.enrollStudent()}
                    </Button>
                  </div>
                )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
      >
        <Card className="
          border-border/20
          dark:bg-card/20
          h-full bg-white/50 backdrop-blur-xl
        "
        >
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2 text-lg">
              <div className="bg-primary/10 rounded-lg p-2">
                <IconMapPin className="h-5 w-5" />
              </div>
              {t.students.contactInfo()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t.students.address()}
              value={student.address}
            />
            <Separator className="bg-border/50" />
            <InfoRow
              label={t.students.emergencyContact()}
              value={student.emergencyContact}
            />
            <InfoRow
              label={t.students.emergencyPhone()}
              value={formatPhone(student.emergencyPhone)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Medical Info */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.4 }}
      >
        <Card className="
          border-border/20
          dark:bg-card/20
          h-full bg-white/50 backdrop-blur-xl
        "
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-pink-500">
              <div className="rounded-lg bg-pink-500/10 p-2">
                <IconHeart className="h-5 w-5" />
              </div>
              {t.students.medicalInfo()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t.students.bloodType()}
              value={student.bloodType}
            />
            <InfoRow
              label={t.students.medicalNotes()}
              value={student.medicalNotes}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value?: string | null
  highlight?: boolean
}) {
  return (
    <div
      className={`
        border-border/50 flex items-center justify-between border-b
        border-dashed py-2
        last:border-0
        ${highlight
      ? `bg-primary/5 -mx-2 rounded-md px-2`
      : ''}
      `}
    >
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <span
        className={`
          text-sm
          ${highlight
      ? 'text-primary font-bold'
      : `font-medium`}
        `}
      >
        {value || '-'}
      </span>
    </div>
  )
}
