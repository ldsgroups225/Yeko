import { IconInfoCircle } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table'
import { ConductSeverityBadge } from '@/components/conduct/conduct-severity-badge'
import { ConductTypeBadge } from '@/components/conduct/conduct-type-badge'
import { useTranslations } from '@/i18n'

interface RecentConductRecordsProps {
  records: any[]
}

export function RecentConductRecords({ records }: RecentConductRecordsProps) {
  const t = useTranslations()

  return (
    <Card className="
      border-border/40 bg-card/30 overflow-hidden rounded-3xl shadow-xl
      backdrop-blur-xl
    "
    >
      <CardHeader className="border-border/10 bg-muted/20 border-b">
        <CardTitle className="
          text-muted-foreground/60 flex items-center gap-2 text-[10px]
          font-black tracking-widest uppercase
        "
        >
          <IconInfoCircle className="size-3" />
          {t.conduct.recentRecords()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="
              border-border/10 h-14
              hover:bg-transparent
            "
            >
              <TableHead className="
                text-muted-foreground/60 px-6 text-[10px] font-black
                tracking-widest uppercase
              "
              >
                {t.conduct.date()}
              </TableHead>
              <TableHead className="
                text-muted-foreground/60 text-[10px] font-black tracking-widest
                uppercase
              "
              >
                {t.conduct.student()}
              </TableHead>
              <TableHead className="
                text-muted-foreground/60 text-[10px] font-black tracking-widest
                uppercase
              "
              >
                Type
              </TableHead>
              <TableHead className="
                text-muted-foreground/60 text-[10px] font-black tracking-widest
                uppercase
              "
              >
                {t.conduct.title()}
              </TableHead>
              <TableHead className="
                text-muted-foreground/60 px-6 text-[10px] font-black
                tracking-widest uppercase
              "
              >
                Severity
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.slice(0, 10).map(record => (
              <TableRow
                key={record.id}
                className="
                  border-border/10
                  hover:bg-muted/10
                  h-16 transition-colors
                "
              >
                <TableCell className="px-6">
                  <div className="font-black tracking-tight">
                    {record.incidentDate ? new Date(record.incidentDate).toLocaleDateString() : new Date(record.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="
                    text-primary cursor-pointer font-black tracking-tight
                    hover:underline
                  "
                  >
                    {record.studentName ?? 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <ConductTypeBadge type={record.type as 'incident' | 'sanction' | 'reward' | 'note'} />
                </TableCell>
                <TableCell className="
                  text-muted-foreground max-w-[200px] truncate font-medium
                  italic
                "
                >
                  {record.title}
                </TableCell>
                <TableCell className="px-6 text-right">
                  {record.severity
                    ? (
                        <ConductSeverityBadge severity={record.severity as 'low' | 'medium' | 'high' | 'critical' | 'urgent'} />
                      )
                    : (
                        <span className="
                          text-muted-foreground/30 text-[10px] font-black
                          tracking-widest uppercase
                        "
                        >
                          —
                        </span>
                      )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {records.length > 10 && (
          <div className="
            border-border/10 bg-muted/5 flex justify-center border-t p-4
          "
          >
            <Link to="/conducts/conduct">
              <Button
                variant="ghost"
                className="
                  hover:text-primary
                  text-[10px] font-black tracking-widest uppercase
                "
              >
                {t.common.view()}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
