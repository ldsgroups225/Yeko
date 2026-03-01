import { IconMail, IconSend, IconUserPlus, IconUsers } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'

interface ParentStatsProps {
  total: number
  pending: number
  sent: number
  accepted: number
}

export function ParentStats({ total, pending, sent, accepted }: ParentStatsProps) {
  const t = useTranslations()

  return (
    <div className="
      grid gap-4
      md:grid-cols-4
    "
    >
      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">{t.parents.totalParents()}</CardTitle>
          <IconUsers className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">{t.parents.invitationPending()}</CardTitle>
          <IconMail className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent><div className="text-accent text-2xl font-bold">{pending}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">{t.parents.invitationSentCount()}</CardTitle>
          <IconSend className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-blue-600">{sent}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">{t.parents.registered()}</CardTitle>
          <IconUserPlus className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-green-600">{accepted}</div></CardContent>
      </Card>
    </div>
  )
}
