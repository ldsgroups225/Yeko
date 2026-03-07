import type { ReactNode } from 'react'
import type { ConductStudentRow } from './-conduct.types'
import type { TranslationFunctions } from '@/i18n'
import {
  IconEye,
  IconPlus,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ConductStudentsTableProps {
  t: TranslationFunctions
  rows: ConductStudentRow[]
  errorMessage?: string | null
  onCreateRecord: (row: ConductStudentRow) => void
}

export function ConductStudentsTable({ t, rows, errorMessage, onCreateRecord }: ConductStudentsTableProps) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-[0_22px_48px_rgba(15,23,42,0.07)] backdrop-blur">
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <TableHeadCell className="w-14 text-center">#</TableHeadCell>
                <TableHeadCell>{t.conduct.student()}</TableHeadCell>
                <TableHeadCell>{t.common.classes()}</TableHeadCell>
                <TableHeadCell className="w-[150px] text-center">{t.reportCards.average()}</TableHeadCell>
                <TableHeadCell className="w-[190px] text-center text-slate-800">Détails</TableHeadCell>
                <TableHeadCell className="w-[120px] text-center">{t.reportCards.attendance()}</TableHeadCell>
                <TableHeadCell className="text-center">{t.conduct.type.incident()}</TableHeadCell>
                <TableHeadCell className="text-center">{t.common.actions()}</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {errorMessage && (
                <tr>
                  <td colSpan={8} className="text-destructive py-10 text-center font-medium">
                    {errorMessage}
                  </td>
                </tr>
              )}

              {!errorMessage && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted-foreground py-10 text-center">
                    {t.conduct.noRecordsDescription()}
                  </td>
                </tr>
              )}

              {!errorMessage && rows.map((row, index) => {
                const note = getScoreTone(row.score)
                const attendance = getAttendanceMeta(t, row)

                return (
                  <motion.tr
                    key={row.studentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group"
                  >
                    <td className="border-b border-slate-100 px-4 py-4 align-middle">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 transition-colors group-hover:bg-slate-200">
                        {index + 1}
                      </div>
                    </td>

                    <td className="border-b border-slate-100 px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={row.photoUrl ?? undefined} alt={row.studentName} />
                          <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 font-semibold text-white">
                            {getInitials(row.studentName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-foreground font-bold">{row.studentName}</div>
                          <div className="text-muted-foreground font-medium">{row.matricule ?? t.common.notAvailable()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="border-b border-slate-100 px-4 py-4 align-middle">
                      <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                        {row.className}
                      </Badge>
                    </td>

                    <td className="border-b border-slate-100 px-4 py-4 align-middle text-center">
                      <div className="mx-auto max-w-[102px] space-y-1.5">
                        <div className={cn('text-[2.2rem] leading-none font-black tracking-tight', note.valueClassName)}>
                          {row.score.toFixed(1)}
                        </div>
                        <div className="mx-auto h-1.5 w-[78px] rounded-full bg-slate-100">
                          <div
                            className={cn('h-full rounded-full transition-all', note.barClassName)}
                            style={{ width: `${Math.max(6, (row.score / 20) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4 align-middle">
                      <Tooltip>
                        <TooltipTrigger
                          render={<div className="grid cursor-help grid-cols-2 gap-1.5" />}
                        >
                          <DetailPill
                            label="A"
                            value={formatDetailScore(row.detailScores.attendance, 6)}
                            tone="blue"
                          />
                          <DetailPill
                            label="T"
                            value={formatDetailScore(row.detailScores.punctuality, 3)}
                            tone="green"
                          />
                          <DetailPill
                            label="M"
                            value={formatDetailScore(row.detailScores.morality, 4)}
                            tone="violet"
                          />
                          <DetailPill
                            label="D"
                            value={formatDetailScore(row.detailScores.discipline, 7)}
                            tone="rose"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="min-w-[260px] max-w-[340px] bg-slate-900 px-4 py-3 text-sm text-white">
                          <div className="space-y-1.5">
                            <div>{`${t.reportCards.attendance()}: ${formatDetailScore(row.detailScores.attendance, 6)}`}</div>
                            <div>{`Tenue: ${formatDetailScore(row.detailScores.punctuality, 3)}`}</div>
                            <div>{`Moralité: ${formatDetailScore(row.detailScores.morality, 4)}`}</div>
                            <div>{`Discipline: ${formatDetailScore(row.detailScores.discipline, 7)}`}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </td>

                    <td className="border-b border-slate-100 px-3 py-4 align-middle text-center">
                      <Tooltip>
                        <TooltipTrigger
                          render={<div className="space-y-1.5 cursor-help" />}
                        >
                          <div className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', attendance.badgeClassName)}>
                            {attendance.rateLabel}
                          </div>
                          <div className="flex justify-center gap-1.5">
                            <TinyAttendanceBadge tone="red" label={`${row.absentCount}-A`} />
                            <TinyAttendanceBadge tone="amber" label={`${row.lateCount}-R`} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="min-w-[240px] max-w-[340px] bg-slate-900 px-4 py-3 text-sm text-white">
                          <div className="space-y-1.5">
                            <div className="font-semibold">{attendance.statusLabel}</div>
                            <div>{`${t.attendance.attendanceRate()}: ${row.attendanceRate?.toFixed(1) ?? t.common.notAvailable()}%`}</div>
                            <div>{`${t.attendance.status.absent()}: ${row.absentCount}`}</div>
                            <div>{`${t.attendance.status.late()}: ${row.lateCount}`}</div>
                            <div>{`${t.attendance.status.excused()}: ${row.excusedCount}`}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </td>

                    <td className="border-b border-slate-100 px-4 py-4 align-middle text-center">
                      <div className="inline-flex min-w-10 items-center justify-center rounded-full bg-emerald-100 px-3 py-2 font-bold text-emerald-700">
                        {row.incidents}
                      </div>
                    </td>

                    <td className="border-b border-slate-100 px-4 py-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Link to="/students/$studentId" params={{ studentId: row.studentId }}>
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-300 text-slate-700">
                            <IconEye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          className="h-10 w-10 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                          onClick={() => onCreateRecord(row)}
                        >
                          <IconPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function TableHeadCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th className={cn('px-4 py-4 text-left text-sm font-bold', className)}>
      {children}
    </th>
  )
}

function DetailPill({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'blue' | 'green' | 'violet' | 'rose'
}) {
  const tones = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    violet: 'bg-violet-100 text-violet-700',
    rose: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className={cn('rounded-md px-2.5 py-1.5 text-center text-xs font-semibold', tones[tone])}>
      <span className="font-bold">{`${label}: `}</span>
      {value}
    </div>
  )
}

function TinyAttendanceBadge({
  label,
  tone,
}: {
  label: string
  tone: 'red' | 'amber'
}) {
  return (
    <span
      className={cn(
        'rounded-md px-2 py-1 text-[11px] font-bold',
        tone === 'red'
          ? 'bg-red-100 text-red-700'
          : 'bg-amber-100 text-amber-700',
      )}
    >
      {label}
    </span>
  )
}

function getScoreTone(score: number) {
  if (score >= 16) {
    return {
      valueClassName: 'text-emerald-600',
      barClassName: 'bg-emerald-500',
    }
  }

  if (score >= 12) {
    return {
      valueClassName: 'text-blue-600',
      barClassName: 'bg-blue-500',
    }
  }

  if (score >= 8) {
    return {
      valueClassName: 'text-amber-600',
      barClassName: 'bg-amber-500',
    }
  }

  return {
    valueClassName: 'text-red-600',
    barClassName: 'bg-red-500',
  }
}

function getAttendanceMeta(
  t: TranslationFunctions,
  row: ConductStudentRow,
) {
  if (row.attendanceRate === null) {
    return {
      rateLabel: t.common.notAvailable(),
      statusLabel: t.common.notAvailable(),
      badgeClassName: 'bg-slate-100 text-slate-600',
    }
  }

  const baseStatus = row.attendanceStatus === 'late'
    ? t.attendance.status.late()
    : row.attendanceStatus === 'absent'
      ? t.attendance.status.absent()
      : row.attendanceStatus === 'excused'
        ? t.attendance.status.excused()
        : t.attendance.status.present()

  if (row.attendanceRate >= 90) {
    return {
      rateLabel: `${row.attendanceRate.toFixed(1)}%`,
      statusLabel: baseStatus,
      badgeClassName: 'bg-emerald-100 text-emerald-700',
    }
  }

  if (row.attendanceRate >= 60) {
    return {
      rateLabel: `${row.attendanceRate.toFixed(1)}%`,
      statusLabel: baseStatus,
      badgeClassName: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    rateLabel: `${row.attendanceRate.toFixed(1)}%`,
    statusLabel: baseStatus,
    badgeClassName: 'bg-red-100 text-red-700',
  }
}

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || '?'
}

function formatDetailScore(score: number, max: number) {
  const value = Number.isInteger(score) ? score.toString() : score.toFixed(1)
  return `${value}/${max}`
}
