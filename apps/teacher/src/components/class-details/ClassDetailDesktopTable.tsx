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
    <div className="hidden lg:block">
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead
                className="sticky left-0 z-20 min-w-[200px] cursor-pointer bg-muted/50 font-semibold transition-colors hover:bg-muted"
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
                      <TableHead className="text-center min-w-[100px]">{LL.common.participation()}</TableHead>
                      <TableHead className="text-center min-w-[80px]">{LL.grades.quizzes()}</TableHead>
                      <TableHead className="text-center min-w-[80px]">{LL.grades.tests()}</TableHead>
                      <TableHead className="text-center min-w-[80px]">{LL.grades.level_tests()}</TableHead>
                      <TableHead
                        className="sticky right-0 z-20 min-w-[120px] bg-muted/50 text-center font-semibold cursor-pointer hover:bg-muted"
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
                      <TableHead className="text-center min-w-[80px]">{LL.common.actions()}</TableHead>
                    </>
                  )
                : (
                    <TableHead className="text-center min-w-[150px] font-black text-primary italic">
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
                  'transition-colors hover:bg-muted/50',
                  idx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                )}
              >
                <TableCell className="sticky left-0 z-10 bg-inherit min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border/50 shrink-0">
                      <AvatarImage src={student.photoUrl ?? undefined} alt={student.firstName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {student.lastName}
                        {' '}
                        {student.firstName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{student.matricule}</p>
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
                        <TableCell className="text-center text-muted-foreground text-xs">{LL.common.notAvailable()}</TableCell>
                        <TableCell className="text-center text-muted-foreground text-xs">{LL.common.notAvailable()}</TableCell>
                        <TableCell className="text-center text-muted-foreground text-xs">{LL.common.notAvailable()}</TableCell>
                        <TableCell className="sticky right-0 z-10 bg-inherit text-center font-bold text-lg text-muted-foreground border-l">
                          {LL.common.notAvailable()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link to="/app/students/$studentId/notes" params={{ studentId: student.id }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                              <IconEdit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </>
                    )
                  : (
                      <TableCell className="text-center bg-primary/5">
                        <div className="flex items-center justify-center gap-2 max-w-[120px] mx-auto">
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder={LL.common.notAvailable()}
                            value={gradesMap.get(student.id) || ''}
                            onChange={e => onGradeChange(student.id, e.target.value)}
                            className="h-10 text-center text-lg font-black bg-background border-primary/30 rounded-lg focus:ring-2 focus:ring-primary/40"
                          />
                          <span className="text-xs font-bold text-muted-foreground">
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
