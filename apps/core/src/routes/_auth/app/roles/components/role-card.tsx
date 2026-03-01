import type { Role, SystemAction } from '@repo/data-ops'
import { IconDots, IconLock, IconShield, IconTrash } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { domMax, LazyMotion, m } from 'motion/react'

interface RoleCardProps {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  can: (resource: string, action: SystemAction) => boolean
  resourceMap: Record<string, string>
}

export function RoleCard({ role, onEdit, onDelete, can, resourceMap }: RoleCardProps) {
  const permissionsCount = Object.keys(role.permissions || {}).length
  const isPlatform = role.scope === 'system'

  return (
    <LazyMotion features={domMax}>
      <m.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8 }}
        className="group"
      >
        <Card className="
          border-border/40 bg-background/50
          hover:shadow-primary/5 hover:border-primary/30
          relative h-full overflow-hidden rounded-3xl shadow-xl backdrop-blur-xl
          transition-all duration-500
          hover:shadow-2xl
        "
        >
          <div className="absolute top-0 right-0 p-4">
            {isPlatform
              ? (
                  <Badge
                    variant="outline"
                    className="
                      bg-primary/5 text-primary border-primary/20 flex
                      items-center gap-1.5 rounded-full px-3 py-1 text-[10px]
                      font-bold tracking-wider uppercase
                    "
                  >
                    <IconLock size={12} className="stroke-3" />
                    Système
                  </Badge>
                )
              : (
                  <Badge
                    variant="outline"
                    className="
                      flex items-center gap-1.5 rounded-full
                      border-emerald-500/20 bg-emerald-500/5 px-3 py-1
                      text-[10px] font-bold tracking-wider text-emerald-600
                      uppercase
                    "
                  >
                    <IconShield size={12} className="stroke-3" />
                    École
                  </Badge>
                )}
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className={`
                rounded-2xl p-4 transition-transform duration-500
                group-hover:scale-110
                ${isPlatform
      ? `bg-primary/10 text-primary ring-primary/20 ring-1`
      : `bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20`}
              `}
              >
                <IconShield className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="flex-1 space-y-1">
                <CardTitle className="
                  group-hover:text-primary
                  text-2xl font-bold tracking-tight transition-colors
                "
                >
                  {role.name}
                </CardTitle>
                <code className="
                  bg-muted/50 text-muted-foreground rounded-sm px-2 py-0.5
                  font-mono text-[10px]
                "
                >
                  {role.slug}
                </code>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex h-[calc(100%-110px)] flex-col space-y-6">
            <p className="
              text-muted-foreground/90 line-clamp-2 min-h-[40px] text-sm
              leading-relaxed italic
            "
            >
              {role.description || 'Aucune description stratégique définie pour ce rôle.'}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="
                  text-muted-foreground/60 text-[11px] font-black
                  tracking-[0.2em] uppercase
                "
                >
                  Périmètre d'accès
                </span>
                <span className="
                  bg-muted text-muted-foreground rounded-full px-2 py-0.5
                  text-[10px] font-medium
                "
                >
                  {permissionsCount}
                  {' '}
                  modules
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(role.permissions as Record<string, string[]>).slice(0, 4).map(([resId, acts]) => {
                  const humanName = resourceMap[resId] || resId
                  return (
                    <Badge
                      key={resId}
                      variant="secondary"
                      className="
                        bg-background/50 border-border/50 text-foreground/80
                        hover:bg-primary/5 hover:border-primary/20
                        flex items-center gap-1.5 rounded-lg border px-2.5 py-1
                        text-[11px] transition-all
                      "
                    >
                      <span className="bg-primary/40 h-1.5 w-1.5 rounded-full" />
                      {humanName}
                      <span className="ml-1 text-[8px] font-bold opacity-40">
                        (
                        {acts.length}
                        )
                      </span>
                    </Badge>
                  )
                })}
                {permissionsCount > 4 && (
                  <div className="
                    text-muted-foreground flex items-center px-2 text-[10px]
                    font-semibold
                  "
                  >
                    +
                    {permissionsCount - 4}
                    {' '}
                    autres...
                  </div>
                )}
              </div>
            </div>

            <div className="
              border-border/30 mt-auto flex items-center justify-between
              border-t pt-6
            "
            >
              <div className="flex -space-x-1.5">
                <div className="
                  bg-primary/20 border-background ring-primary/10 flex h-8 w-8
                  items-center justify-center rounded-full border-2 text-[10px]
                  font-bold ring-1
                "
                >
                  A
                </div>
                <div className="
                  border-background flex h-8 w-8 items-center justify-center
                  rounded-full border-2 bg-emerald-500/20 text-[10px] font-bold
                  ring-1 ring-emerald-500/10
                "
                >
                  B
                </div>
                <div className="
                  border-background text-muted-foreground ring-border flex h-8
                  w-8 items-center justify-center rounded-full border-2
                  bg-amber-500/10 text-[10px] font-black shadow-sm ring-1
                "
                >
                  +5
                </div>
              </div>

              <div className="
                flex translate-y-2 transform items-center gap-1 opacity-100
                transition-all duration-300
                group-hover:translate-y-0 group-hover:opacity-100
                sm:opacity-0
              "
              >
                {can('global_settings', 'manage') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="
                      hover:bg-primary/10 hover:text-primary
                      h-10 w-10 rounded-xl transition-colors
                    "
                    onClick={() => onEdit(role)}
                  >
                    <IconDots size={20} />
                  </Button>
                )}
                {!role.isSystemRole && can('global_settings', 'manage') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="
                      text-destructive
                      hover:text-destructive hover:bg-destructive/10
                      h-10 w-10 rounded-xl transition-colors
                    "
                    onClick={() => onDelete(role)}
                  >
                    <IconTrash size={20} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  )
}
