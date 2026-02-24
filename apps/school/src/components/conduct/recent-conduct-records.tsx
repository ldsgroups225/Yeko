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
    <Card className="rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border/10 bg-muted/20">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
          <IconInfoCircle className="size-3" />
          {t.conduct.recentRecords()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border/10 h-14">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6">{t.conduct.date()}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.student()}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Type</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.title()}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.slice(0, 10).map(record => (
              <TableRow key={record.id} className="border-border/10 hover:bg-muted/10 transition-colors h-16">
                <TableCell className="px-6">
                  <div className="font-black tracking-tight">
                    {record.incidentDate ? new Date(record.incidentDate).toLocaleDateString() : new Date(record.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-black tracking-tight text-primary hover:underline cursor-pointer">
                    {record.studentName ?? 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <ConductTypeBadge type={record.type as 'incident' | 'sanction' | 'reward' | 'note'} />
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-medium text-muted-foreground italic">
                  {record.title}
                </TableCell>
                <TableCell className="px-6 text-right">
                  {record.severity
                    ? (
                        <ConductSeverityBadge severity={record.severity as 'low' | 'medium' | 'high' | 'critical' | 'urgent'} />
                      )
                    : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">—</span>
                      )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {records.length > 10 && (
          <div className="p-4 border-t border-border/10 bg-muted/5 flex justify-center">
            <Link to="/conducts/conduct">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:text-primary">
                {t.common.view()}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
