import type { SchoolSubjectWithDetails } from '@repo/data-ops/queries/school-subjects'
import type { ColumnDef } from '@tanstack/react-table'
import { IconBook } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { useMemo } from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { SubjectStatusToggle } from './subject-status-toggle'

export const SUBJECT_CATEGORY_KEYS = [
  'litteraire',
  'scientifique',
  'sportif',
  'autre',
] as const
export type SubjectCategoryKey = (typeof SUBJECT_CATEGORY_KEYS)[number]

export const CATEGORY_STYLES: Record<string, { className: string, icon: React.ReactNode }> = {
  Scientifique: {
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: <span className="mr-1.5">🔬</span>,
  },
  Littéraire: {
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: <span className="mr-1.5">📖</span>,
  },
  Sportif: {
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: <span className="mr-1.5">⚽</span>,
  },
  Autre: {
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: <span className="mr-1.5">🎨</span>,
  },
}

export const SUBJECT_CATEGORY_FILTER_MAP: Record<
  SubjectCategoryKey,
  'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
> = {
  litteraire: 'Littéraire',
  scientifique: 'Scientifique',
  sportif: 'Sportif',
  autre: 'Autre',
}

interface UseSchoolSubjectColumnsProps {
  toggleStatus: (id: string, status: 'active' | 'inactive') => void
  isPending: boolean
}

export function useSchoolSubjectColumns({ toggleStatus, isPending }: UseSchoolSubjectColumnsProps) {
  const t = useTranslations()

  return useMemo<ColumnDef<SchoolSubjectWithDetails>[]>(
    () => [
      {
        accessorKey: 'subject.name',
        header: t.academic.subjects.messages.subjectName(),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border/40 text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
              <IconBook className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {row.original.subject.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {row.original.subject.shortName}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'subject.category',
        header: t.academic.subjects.filterByCategory(),
        cell: ({ row }) => {
          const category = row.original.subject.category || 'Autre'
          const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.Autre
          if (!style)
            return category // Fallback if something is very wrong
          return (
            <Badge
              variant="outline"
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all duration-300 group-hover:shadow-sm',
                style.className,
              )}
            >
              {style.icon}
              {category}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: t.academic.subjects.filterByStatus(),
        cell: ({ row }) => (
          <SubjectStatusToggle
            status={row.original.status}
            onToggle={status => toggleStatus(row.original.id, status)}
            disabled={isPending}
          />
        ),
      },
    ],
    [t, toggleStatus, isPending],
  )
}
