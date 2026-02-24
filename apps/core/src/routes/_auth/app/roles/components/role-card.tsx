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
        <Card className="h-full border-border/40 bg-background/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 overflow-hidden relative rounded-3xl">
          <div className="absolute top-0 right-0 p-4">
            {isPlatform
              ? (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <IconLock size={12} className="stroke-3" />
                    Système
                  </Badge>
                )
              : (
                  <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 gap-1.5 flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <IconShield size={12} className="stroke-3" />
                    École
                  </Badge>
                )}
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500 ${isPlatform ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'}`}>
                <IconShield className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="flex-1 space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {role.name}
                </CardTitle>
                <code className="text-[10px] px-2 py-0.5 rounded bg-muted/50 text-muted-foreground font-mono">
                  {role.slug}
                </code>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 flex flex-col h-[calc(100%-110px)]">
            <p className="text-sm text-muted-foreground/90 italic leading-relaxed line-clamp-2 min-h-[40px]">
              {role.description || 'Aucune description stratégique définie pour ce rôle.'}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Périmètre d'accès
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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
                      className="px-2.5 py-1 bg-background/50 border border-border/50 text-foreground/80 hover:bg-primary/5 hover:border-primary/20 transition-all rounded-lg text-[11px] flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      {humanName}
                      <span className="text-[8px] opacity-40 font-bold ml-1">
                        (
                        {acts.length}
                        )
                      </span>
                    </Badge>
                  )
                })}
                {permissionsCount > 4 && (
                  <div className="text-[10px] text-muted-foreground font-semibold px-2 flex items-center">
                    +
                    {permissionsCount - 4}
                    {' '}
                    autres...
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-border/30 flex items-center justify-between mt-auto">
              <div className="flex -space-x-1.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold ring-1 ring-primary/10">A</div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-background flex items-center justify-center text-[10px] font-bold ring-1 ring-emerald-500/10">B</div>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border-2 border-background flex items-center justify-center text-[10px] font-black text-muted-foreground ring-1 ring-border shadow-sm">+5</div>
              </div>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                {can('global_settings', 'manage') && (
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onEdit(role)}>
                    <IconDots size={20} />
                  </Button>
                )}
                {!role.isSystemRole && can('global_settings', 'manage') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
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
