import {
  IconCalendar,
  IconEdit,
  IconHeart,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconSchool,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslations } from "@/i18n";
import { studentsKeys, studentsOptions } from "@/lib/queries/students";

import { updateStudent } from "@/school/functions/students";
import { generateUUID } from "@/utils/generateUUID";
import { EnrollmentDialog } from "./enrollment-dialog";
import { EnrollmentTimeline } from "./enrollment-timeline";
import { ParentLinkDialog } from "./parent-link-dialog";
import { PhotoUploadDialog } from "./photo-upload-dialog";
import { TransferDialog } from "./transfer-dialog";

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  graduated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  transferred:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  withdrawn: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface StudentDetailProps {
  studentId: string;
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(studentsOptions.detail(studentId));
  const [parentDialogOpen, setParentDialogOpen] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const updatePhotoMutation = useMutation({
    mutationFn: (photoUrl: string) =>
      updateStudent({ data: { id: studentId, updates: { photoUrl } } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentsKeys.detail(studentId),
      });
    },
  });

  if (isLoading) {
    return <StudentDetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t.students.notFound()}</p>
      </div>
    );
  }

  const {
    student,
    currentClass,
    currentEnrollment,
    parents,
    enrollmentHistory,
  } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br from-primary/10 via-white/50 to-white/80 p-8 backdrop-blur-2xl dark:from-primary/10 dark:via-black/50 dark:to-black/80">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <button
              type="button"
              onClick={() => setPhotoDialogOpen(true)}
              className="group relative cursor-pointer"
              title={t.students.changePhoto()}
            >
              <div className="relative h-28 w-28 rounded-full border-4 border-white overflow-hidden dark:border-white/10">
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={student.photoUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <IconEdit className="h-8 w-8 text-white drop-shadow-md" />
                </div>
              </div>
            </button>

            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {student.lastName}{" "}
                <span className="font-light text-muted-foreground">
                  {student.firstName}
                </span>
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1 font-mono uppercase tracking-widest bg-white/50 dark:bg-black/20"
                >
                  {student.matricule}
                </Badge>
                <Badge
                  className={`${statusColors[student.status as keyof typeof statusColors]} border-0 px-3 py-1 text-sm shadow-none`}
                >
                  {{
                    active: t.students.statusActive,
                    graduated: t.students.statusGraduated,
                    transferred: t.students.statusTransferred,
                    withdrawn: t.students.statusWithdrawn,
                  }[
                    student.status as
                      | "active"
                      | "graduated"
                      | "transferred"
                      | "withdrawn"
                  ]()}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            render={
              <Link to="/students/$studentId/edit" params={{ studentId }}>
                <IconEdit className="mr-2 h-4 w-4" />
                {t.common.edit()}
              </Link>
            }
            size="lg"
            className="rounded-full shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-8 p-1 h-auto bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 w-full md:w-auto inline-flex justify-start">
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

        {/* Personal IconInfoCircle Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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
              <Card className="h-full border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconUser className="h-5 w-5" />
                    </div>
                    {t.students.personalInfo()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow
                    label={t.students.dateOfBirth()}
                    value={new Date(student.dob).toLocaleDateString()}
                  />
                  <InfoRow
                    label={t.students.gender()}
                    value={
                      student.gender === "M"
                        ? t.students.male()
                        : student.gender === "F"
                          ? t.students.female()
                          : "-"
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
                        ? new Date(student.admissionDate).toLocaleDateString()
                        : "-"
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
              <Card className="h-full border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconSchool className="h-5 w-5" />
                    </div>
                    {t.students.currentEnrollment()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentClass?.gradeName && currentClass?.section ? (
                    <>
                      <InfoRow
                        label={t.students.class()}
                        value={`${currentClass.gradeName} ${currentClass.section}${currentClass.seriesName ? ` (${currentClass.seriesName})` : ""}`}
                        highlight
                      />
                      <InfoRow
                        label={t.students.enrollmentDate()}
                        value={
                          currentEnrollment?.enrollmentDate
                            ? new Date(
                                currentEnrollment.enrollmentDate,
                              ).toLocaleDateString()
                            : "-"
                        }
                      />
                      <InfoRow
                        label={t.students.rollNumber()}
                        value={currentEnrollment?.rollNumber?.toString()}
                      />
                      <InfoRow
                        label={t.students.enrollmentStatus()}
                        value={
                          currentEnrollment?.status
                            ? {
                                confirmed: t.students.enrollmentConfirmed,
                                pending: t.students.enrollmentPending,
                                cancelled: t.students.enrollmentCancelled,
                                transferred: t.students.enrollmentTransferred,
                              }[
                                currentEnrollment.status as
                                  | "confirmed"
                                  | "pending"
                                  | "cancelled"
                                  | "transferred"
                              ]()
                            : "-"
                        }
                      />
                      {currentEnrollment?.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                          onClick={() => setTransferDialogOpen(true)}
                        >
                          {t.students.transferStudent()}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                      <p>{t.students.notEnrolled()}</p>
                      <Button
                        variant="link"
                        onClick={() => setEnrollmentDialogOpen(true)}
                      >
                        {t.students.enrollStudent()}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact IconInfoCircle */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <div className="p-2 rounded-lg bg-primary/10">
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
                    value={student.emergencyPhone}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Medical IconInfoCircle */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-pink-500">
                    <div className="p-2 rounded-lg bg-pink-500/10">
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
        </TabsContent>

        {/* Parents Tab */}
        <TabsContent value="parents" className="space-y-4">
          <Card className="border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-white/30 px-6 py-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconUsers className="h-5 w-5 text-primary" />
                  {t.students.linkedParents()}
                </CardTitle>
                <CardDescription>
                  {t.students.linkedParentsDescription()}
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setParentDialogOpen(true)}
                className="shadow-sm"
              >
                <IconPlus className="mr-2 h-4 w-4" />
                {t.students.linkParent()}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {parents && parents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {parents.map((item, idx: number) => (
                    <motion.div
                      key={item.parent.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between rounded-xl border border-white/20 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-white/20">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {item.parent.firstName[0]}
                            {item.parent.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-lg">
                            {item.parent.lastName} {item.parent.firstName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize font-medium text-primary/80">
                              {{
                                father: t.parents.relationshipFather,
                                mother: t.parents.relationshipMother,
                                guardian: t.parents.relationshipGuardian,
                                grandparent: t.parents.relationshipGrandparent,
                                sibling: t.parents.relationshipSibling,
                                other: t.parents.relationshipOther,
                              }[
                                item.relationship as
                                  | "father"
                                  | "mother"
                                  | "guardian"
                                  | "grandparent"
                                  | "sibling"
                                  | "other"
                              ]()}
                            </span>
                            {item.isPrimary && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {t.students.primaryContact()}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            {item.parent.phone && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <IconPhone className="h-3 w-3" />
                                {item.parent.phone}
                              </div>
                            )}
                            {item.parent.email && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <IconMail className="h-3 w-3" />
                                {item.parent.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {item.canPickup && (
                          <Badge
                            variant="outline"
                            className="justify-center data-[state=active]:bg-green-100"
                          >
                            {t.students.canPickup()}
                          </Badge>
                        )}
                        {item.receiveNotifications && (
                          <Badge
                            variant="outline"
                            className="justify-center text-xs"
                          >
                            {t.students.receivesNotifications()}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <IconUsers className="h-12 w-12 opacity-20 mb-3" />
                  <p>{t.students.noParentsLinked()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment IconHistory Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card className="border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-white/30 px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconCalendar className="h-5 w-5 text-primary" />
                {t.students.enrollmentHistory()}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setEnrollmentDialogOpen(true)}
                className="shadow-sm"
              >
                <IconPlus className="mr-2 h-4 w-4" />
                {t.students.enrollStudent()}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <EnrollmentTimeline
                enrollments={
                  enrollmentHistory?.map((item) => ({
                    ...item,
                    enrollment: {
                      ...item.enrollment,
                      confirmedAt:
                        item.enrollment.confirmedAt?.toISOString() || null,
                      cancelledAt:
                        item.enrollment.cancelledAt?.toISOString() || null,
                      transferredAt:
                        item.enrollment.transferredAt?.toISOString() || null,
                    },
                  })) || []
                }
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
        entityId={studentId}
        entityName={`${student.firstName} ${student.lastName}`}
        onPhotoUploaded={(photoUrl) => {
          updatePhotoMutation.mutate(photoUrl);
        }}
      />
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-2 border-b border-dashed border-border/50 last:border-0 ${highlight ? "bg-primary/5 -mx-2 px-2 rounded-md" : ""}`}
    >
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span
        className={`text-sm ${highlight ? "font-bold text-primary" : "font-medium"}`}
      >
        {value || "-"}
      </span>
    </div>
  );
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
                <div
                  key={`field-${generateUUID()}`}
                  className="flex justify-between"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
