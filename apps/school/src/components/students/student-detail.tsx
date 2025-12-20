'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  Edit,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { studentsKeys, studentsOptions } from '@/lib/queries/students'
import { updateStudent } from '@/school/functions/students'

import { generateUUID } from '@/utils/generateUUID'
import { EnrollmentDialog } from './enrollment-dialog'
import { EnrollmentTimeline } from './enrollment-timeline'
import { ParentLinkDialog } from './parent-link-dialog'
import { PhotoUploadDialog } from './photo-upload-dialog'
import { TransferDialog } from './transfer-dialog'

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  graduated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  transferred: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  withdrawn: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

interface StudentDetailProps {
  studentId: string
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(studentsOptions.detail(studentId))
  const [parentDialogOpen, setParentDialogOpen] = useState(false)
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)

  const updatePhotoMutation = useMutation({
    mutationFn: (photoUrl: string) =>
      updateStudent({ data: { id: studentId, updates: { photoUrl } } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) })
    },
  })

  if (isLoading) {
    return <StudentDetailSkeleton />
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('students.notFound')}</p>
      </div>
    )
  }

  const { student, currentClass, currentEnrollment, parents, enrollmentHistory } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPhotoDialogOpen(true)}
            className="group relative cursor-pointer"
            title={t('students.changePhoto')}
          >
            <Avatar className="h-20 w-20 transition-opacity group-hover:opacity-75">
              <AvatarImage src={student.photoUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {student.firstName[0]}
                {student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Edit className="h-6 w-6 text-white" />
            </div>
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {student.lastName}
              {' '}
              {student.firstName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-sm text-muted-foreground">{student.matricule}</p>
              <Badge variant="outline" className={statusColors[student.status as keyof typeof statusColors]}>
                {t(`students.status${student.status.charAt(0).toUpperCase() + student.status.slice(1)}`)}
              </Badge>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link to="/students/$studentId/edit" params={{ studentId }}>
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">{t('students.personalInfo')}</TabsTrigger>
          <TabsTrigger value="parents">{t('students.parents')}</TabsTrigger>
          <TabsTrigger value="enrollments">{t('students.enrollmentHistory')}</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  {t('students.personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label={t('students.dateOfBirth')} value={new Date(student.dob).toLocaleDateString()} />
                <InfoRow label={t('students.gender')} value={student.gender === 'M' ? t('students.male') : student.gender === 'F' ? t('students.female') : '-'} />
                <InfoRow label={t('students.birthPlace')} value={student.birthPlace} />
                <InfoRow label={t('students.nationality')} value={student.nationality} />
                <InfoRow label={t('students.admissionDate')} value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'} />
                <InfoRow label={t('students.previousSchool')} value={student.previousSchool} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  {t('students.currentEnrollment')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentClass?.gradeName && currentClass?.section
                  ? (
                      <>
                        <InfoRow
                          label={t('students.class')}
                          value={`${currentClass.gradeName} ${currentClass.section}${currentClass.seriesName ? ` (${currentClass.seriesName})` : ''}`}
                        />
                        <InfoRow label={t('students.enrollmentDate')} value={currentEnrollment?.enrollmentDate ? new Date(currentEnrollment.enrollmentDate).toLocaleDateString() : '-'} />
                        <InfoRow label={t('students.rollNumber')} value={currentEnrollment?.rollNumber?.toString()} />
                        <InfoRow
                          label={t('students.enrollmentStatus')}
                          value={currentEnrollment?.status ? t(`students.enrollment${currentEnrollment.status.charAt(0).toUpperCase() + currentEnrollment.status.slice(1)}`) : '-'}
                        />
                        {currentEnrollment?.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => setTransferDialogOpen(true)}
                          >
                            {t('students.transferStudent')}
                          </Button>
                        )}
                      </>
                    )
                  : (
                      <p className="text-muted-foreground">{t('students.notEnrolled')}</p>
                    )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  {t('students.contactInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label={t('students.address')} value={student.address} />
                <Separator />
                <InfoRow label={t('students.emergencyContact')} value={student.emergencyContact} />
                <InfoRow label={t('students.emergencyPhone')} value={student.emergencyPhone} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5" />
                  {t('students.medicalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label={t('students.bloodType')} value={student.bloodType} />
                <InfoRow label={t('students.medicalNotes')} value={student.medicalNotes} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Parents Tab */}
        <TabsContent value="parents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  {t('students.linkedParents')}
                </CardTitle>
                <CardDescription>{t('students.linkedParentsDescription')}</CardDescription>
              </div>
              <Button size="sm" onClick={() => setParentDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('students.linkParent')}
              </Button>
            </CardHeader>
            <CardContent>
              {parents && parents.length > 0
                ? (
                    <div className="space-y-4">
                      {parents.map((item: any) => (
                        <div key={item.parent.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {item.parent.firstName[0]}
                                {item.parent.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {item.parent.lastName}
                                {' '}
                                {item.parent.firstName}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{t(`students.relationship${item.relationship.charAt(0).toUpperCase() + item.relationship.slice(1)}`)}</span>
                                {item.isPrimary && (
                                  <Badge variant="secondary" className="text-xs">{t('students.primaryContact')}</Badge>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                {item.parent.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {item.parent.phone}
                                  </span>
                                )}
                                {item.parent.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {item.parent.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.canPickup && <Badge variant="outline">{t('students.canPickup')}</Badge>}
                            {item.receiveNotifications && <Badge variant="outline">{t('students.receivesNotifications')}</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <p className="text-muted-foreground py-4 text-center">{t('students.noParentsLinked')}</p>
                  )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment History Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                {t('students.enrollmentHistory')}
              </CardTitle>
              <Button size="sm" onClick={() => setEnrollmentDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('students.enrollStudent')}
              </Button>
            </CardHeader>
            <CardContent>
              <EnrollmentTimeline
                enrollments={enrollmentHistory?.map(item => ({
                  ...item,
                  enrollment: {
                    ...item.enrollment,
                    confirmedAt: item.enrollment.confirmedAt?.toISOString() || null,
                    cancelledAt: item.enrollment.cancelledAt?.toISOString() || null,
                    transferredAt: item.enrollment.transferredAt?.toISOString() || null,
                  },
                })) || []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ParentLinkDialog
        open={parentDialogOpen}
        onOpenChange={setParentDialogOpen}
        studentId={studentId}
      />
      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={setEnrollmentDialogOpen}
        studentId={studentId}
        studentName={`${student.firstName} ${student.lastName}`}
      />
      {currentEnrollment && currentClass && (
        <TransferDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          studentId={studentId}
          studentName={`${student.firstName} ${student.lastName}`}
          currentEnrollmentId={currentEnrollment.id}
          currentClassName={`${currentClass.gradeName} ${currentClass.section}`}
          schoolYearId={currentEnrollment.schoolYearId}
        />
      )}
      <PhotoUploadDialog
        open={photoDialogOpen}
        onOpenChange={setPhotoDialogOpen}
        currentPhotoUrl={student.photoUrl}
        entityType="student"
        entityName={`${student.firstName} ${student.lastName}`}
        onPhotoUploaded={(photoUrl) => {
          updatePhotoMutation.mutate(photoUrl)
        }}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string, value?: string | null }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-sm">{value || '-'}</span>
    </div>
  )
}

function StudentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, () => (
          <Card key={`card-${generateUUID()}`}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }, () => (
                <div key={`field-${generateUUID()}`} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
