import { formatPhone } from '@repo/data-ops'
import {
  IconMail,
  IconPhone,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react'
import {
  Avatar,
  AvatarFallback,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

interface StudentDetailParentsProps {
  parents: any[]
  onLinkParent: () => void
}

export function StudentDetailParents({ parents, onLinkParent }: StudentDetailParentsProps) {
  const t = useTranslations()

  return (
    <Card className="border-border/20 bg-white/50 backdrop-blur-xl dark:bg-card/20">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-white/30 px-6 py-4">
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
          onClick={onLinkParent}
          className="shadow-sm"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t.students.linkParent()}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {parents && parents.length > 0
          ? (
              <div className="grid gap-4 md:grid-cols-2">
                {parents.map((item, idx: number) => (
                  <motion.div
                    key={item.parent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-border/20 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 dark:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-border/20">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {item.parent.firstName[0]}
                          {item.parent.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-lg">
                          {item.parent.lastName}
                          {' '}
                          {item.parent.firstName}
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
                              | 'father'
                              | 'mother'
                              | 'guardian'
                              | 'grandparent'
                              | 'sibling'
                              | 'other'
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
                              {formatPhone(item.parent.phone)}
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
            )
          : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <IconUsers className="h-12 w-12 opacity-20 mb-3" />
                <p>{t.students.noParentsLinked()}</p>
              </div>
            )}
      </CardContent>
    </Card>
  )
}
