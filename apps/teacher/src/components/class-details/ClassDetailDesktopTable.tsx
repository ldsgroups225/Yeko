import { IconEdit } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { cn } from '@workspace/ui/lib/utils'
import { useI18nContext } from '@/i18n/i18n-react'

interface Student {
  id: string
  firstName: string
  lastName: string
  matricule: string
  photoUrl: string | null
}

interface ClassDetailDesktopTableProps {
  students: Student[]
  isEntryMode: boolean
  gradeOutOf: number
  gradesMap: Map<string, string>
  onGradeChange: (studentId: string, value: string) => void
  onSort: (key: any) => void
  sortConfig: { key: string, direction: 'asc' | 'desc' } | null
}

export function ClassDetailDesktopTable({
  students,
  isEntryMode,
  gradeOutOf,
  gradesMap,
  onGradeChange,
  onSort,
  sortConfig,
}: ClassDetailDesktopTableProps) {
  const { LL } = useI18nContext()

  return (
    <div className="
      hidden
      lg:block
    "
    >
      <Card className="
        border-border/50 bg-card/80 overflow-hidden shadow-lg backdrop-blur-sm
      "
      >
        <Table>
          <TableHeader>
            <TableRow className="
              bg-muted/50
              hover:bg-muted/50
            "
            >
              <TableHead
                className="
                  bg-muted/50
                  hover:bg-muted
                  sticky left-0 z-20 min-w-[200px] cursor-pointer font-semibold
                  transition-colors
                "
                onClick={() => onSort('name')}
              >
                <div className="flex items-center gap-2">
                  {LL.common.student()}
                  {sortConfig?.key === 'name' && (
                    <span className="text-xs">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              {!isEntryMode
                ? (
                    <>
                      <TableHead className="min-w-[100px] text-center">{LL.common.participation()}</TableHead>
                      <TableHead className="min-w-[80px] text-center">{LL.grades.quizzes()}</TableHead>
                      <TableHead className="min-w-[80px] text-center">{LL.grades.tests()}</TableHead>
                      <TableHead className="min-w-[80px] text-center">{LL.grades.level_tests()}</TableHead>
                      <TableHead
                        className="
                          bg-muted/50
                          hover:bg-muted
                          sticky right-0 z-20 min-w-[120px] cursor-pointer
                          text-center font-semibold
                        "
                        onClick={() => onSort('average')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {LL.common.average()}
                          {sortConfig?.key === 'average' && (
                            <span className="text-xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[80px] text-center">{LL.common.actions()}</TableHead>
                    </>
                  )
                : (
                    <TableHead className="
                      text-primary min-w-[150px] text-center font-black italic
                    "
                    >
                      {LL.grades.newNoteTitle()}
                      {' '}
                      (
                      {LL.grades.outOf()}
                      {' '}
                      {gradeOutOf}
                      )
                    </TableHead>
                  )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, idx) => (
              <TableRow
                key={student.id}
                className={cn(
                  `
                    hover:bg-muted/50
                    transition-colors
                  `,
                  idx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                )}
              >
                <TableCell className="
                  sticky left-0 z-10 min-w-[200px] bg-inherit
                "
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="border-border/50 h-8 w-8 shrink-0 border">
                      <AvatarImage src={student.photoUrl ?? undefined} alt={student.firstName} />
                      <AvatarFallback className="
                        bg-primary/10 text-primary text-[10px] font-bold
                      "
                      >
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {student.lastName}
                        {' '}
                        {student.firstName}
                      </p>
                      <p className="
                        text-muted-foreground text-[10px] font-medium
                        tracking-tighter uppercase
                      "
                      >
                        {student.matricule}
                      </p>
                    </div>
                  </div>
                </TableCell>
                {!isEntryMode
                  ? (
                      <>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-medium">
                            {LL.common.notAvailable()}
                          </Badge>
                        </TableCell>
                        <TableCell className="
                          text-muted-foreground text-center text-xs
                        "
                        >
                          {LL.common.notAvailable()}
                        </TableCell>
                        <TableCell className="
                          text-muted-foreground text-center text-xs
                        "
                        >
                          {LL.common.notAvailable()}
                        </TableCell>
                        <TableCell className="
                          text-muted-foreground text-center text-xs
                        "
                        >
                          {LL.common.notAvailable()}
                        </TableCell>
                        <TableCell className="
                          text-muted-foreground sticky right-0 z-10 border-l
                          bg-inherit text-center text-lg font-bold
                        "
                        >
                          {LL.common.notAvailable()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link to="/app/students/$studentId/notes" params={{ studentId: student.id }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="
                                hover:bg-primary/10 hover:text-primary
                                h-8 w-8
                              "
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </>
                    )
                  : (
                      <TableCell className="bg-primary/5 text-center">
                        <div className="
                          mx-auto flex max-w-[120px] items-center justify-center
                          gap-2
                        "
                        >
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder={LL.common.notAvailable()}
                            value={gradesMap.get(student.id) || ''}
                            onChange={e => onGradeChange(student.id, e.target.value)}
                            className="
                              bg-background border-primary/30
                              focus:ring-primary/40
                              h-10 rounded-lg text-center text-lg font-black
                              focus:ring-2
                            "
                          />
                          <span className="
                            text-muted-foreground text-xs font-bold
                          "
                          >
                            /
                            {gradeOutOf}
                          </span>
                        </div>
                      </TableCell>
                    )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
