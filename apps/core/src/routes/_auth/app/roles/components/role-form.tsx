import type { Role, RoleScope as SchoolScope } from '@repo/data-ops'
import { IconPlus } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { ACTIONS, RESOURCES } from '../constants'

interface RoleFormProps {
  form: any
  editingRole: Role | null
  onCancel: () => void
  t: any
}

export function RoleForm({ form, editingRole, onCancel, t }: RoleFormProps) {
  return (
    <DialogContent className="max-w-lg sm:max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl">
      <DialogHeader className="p-5 sm:p-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border/20 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <IconPlus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
              {editingRole ? t.roles.edit() : t.roles.create()}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base line-clamp-1">
              Définissez précisément les responsabilités et les accès.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="p-5 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-none"
      >
        <FieldGroup className="grid-cols-1 sm:grid-cols-2">
          {/* Name */}
          <form.Field
            name="name"
            children={(field: any) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t.roles.name()}</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="ex: Superviseur Pédagogique"
                  className="h-11 sm:h-12! rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          {/* Scope */}
          <form.Field
            name="scope"
            children={(field: any) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t.roles.scope()}</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={val => field.handleChange(val as SchoolScope)}
                  disabled={!!editingRole}
                >
                  <SelectTrigger id={field.name} className="w-full h-11! sm:h-12! rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                    <SelectValue placeholder="Choisir le périmètre">
                      {field.state.value === 'system' ? 'Yeko Core' : 'Yeko School'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                    <SelectItem value="system" className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">Yeko Core</SelectItem>
                    <SelectItem value="school" className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">Yeko School</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          {/* Slug */}
          <form.Field
            name="slug"
            children={(field: any) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t.roles.slug()}</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="superviseur_pedagogique"
                  disabled={!!editingRole}
                  className="h-11 sm:h-12! rounded-xl bg-muted/30 font-mono text-xs border-border/40 opacity-70"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          {/* Description */}
          <form.Field
            name="description"
            children={(field: any) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t.roles.description()}</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="Objectif principal de ce rôle..."
                  className="h-11 sm:h-12! rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-medium"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />
        </FieldGroup>

        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-3">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">{t.roles.permissions()}</h3>
            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 text-xs px-3 py-1">
              Configuration Granulaire
            </Badge>
          </div>

          <form.Field
            name="permissions"
            children={(field: any) => (
              <div className="space-y-4">
                <form.Subscribe
                  selector={(state: any) => state.values.scope}
                  children={(scope: string) => {
                    const filteredResources = RESOURCES.filter(r => (scope === 'system' ? r.category === 'Système' : r.category === 'École'))
                    return (
                      <div className="grid gap-4">
                        {filteredResources.map((resource, idx) => (
                          <div
                            key={resource.id}
                            className={`rounded-2xl border border-border/40 p-5 transition-all hover:border-primary/30 ${idx % 2 === 0 ? 'bg-muted/5' : 'bg-background/30'}`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-sm">{resource.name}</p>
                                  <code className="text-[10px] text-muted-foreground/50 font-mono uppercase">{resource.category}</code>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3">
                                {ACTIONS.map((action) => {
                                  const currentPerms = (field.state.value[resource.id] || []) as string[]
                                  const isChecked = currentPerms.includes(action.id)

                                  const toggle = () => {
                                    const next = isChecked
                                      ? currentPerms.filter(id => id !== action.id)
                                      : [...currentPerms, action.id]

                                    field.handleChange({
                                      ...field.state.value,
                                      [resource.id]: next,
                                    })
                                  }

                                  return (
                                    <div
                                      key={action.id}
                                      role="button"
                                      tabIndex={0}
                                      onClick={toggle}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ')
                                          toggle()
                                      }}
                                      className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-2xl border text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs ${isChecked
                                        ? 'bg-primary/10 border-primary/40 text-primary ring-1 ring-primary/20'
                                        : 'bg-background/40 border-border/60 text-muted-foreground hover:bg-primary/5 hover:border-primary/20'}`}
                                    >
                                      <Checkbox
                                        checked={!!isChecked}
                                        onCheckedChange={toggle}
                                        className="pointer-events-none"
                                      />
                                      <span className="text-[10px] font-black uppercase tracking-wider">{action.name}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
              </div>
            )}
          />
        </div>

        <DialogFooter className="pt-8 gap-3 border-t border-border/10">
          <Button type="button" variant="ghost" size="lg" className="rounded-xl font-bold px-6" onClick={onCancel}>
            {t.common.cancel()}
          </Button>
          <form.Subscribe
            selector={(state: any) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
              <Button
                type="submit"
                size="lg"
                className="rounded-xl px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? t.common.loading() : editingRole ? t.common.save() : t.common.create()}
              </Button>
            )}
          />
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
