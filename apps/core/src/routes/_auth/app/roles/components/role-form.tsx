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
    <DialogContent className="
      bg-card/95 border-border/40 max-h-[90vh] max-w-lg gap-0 overflow-hidden
      rounded-3xl p-0 shadow-2xl backdrop-blur-xl
      sm:max-w-3xl
    "
    >
      <DialogHeader className="
        from-primary/5 border-border/20 bg-background/80 sticky top-0 z-10
        border-b bg-linear-to-b to-transparent p-5 backdrop-blur-md
        sm:p-8
      "
      >
        <div className="
          flex items-center gap-3
          sm:gap-4
        "
        >
          <div className="
            bg-primary/10 text-primary shrink-0 rounded-2xl p-2.5
            sm:p-3
          "
          >
            <IconPlus className="
              h-5 w-5
              sm:h-6 sm:w-6
            "
            />
          </div>
          <div>
            <DialogTitle className="
              text-xl font-bold tracking-tight
              sm:text-2xl
            "
            >
              {editingRole ? t.roles.edit() : t.roles.create()}
            </DialogTitle>
            <DialogDescription className="
              line-clamp-1 text-sm
              sm:text-base
            "
            >
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
        className="
          scrollbar-none max-h-[calc(90vh-120px)] space-y-8 overflow-y-auto p-5
          sm:p-8
        "
      >
        <FieldGroup className="
          grid-cols-1
          sm:grid-cols-2
        "
        >
          {/* Name */}
          <form.Field
            name="name"
            children={(field: any) => (
              <Field>
                <FieldLabel htmlFor={field.name}>{t.roles.name()}</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="ex: Superviseur Pédagogique"
                  className="
                    bg-background/50 border-border/40
                    focus:ring-primary/20
                    h-11 rounded-xl font-bold transition-all
                    sm:h-12!
                  "
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
                  <SelectTrigger
                    id={field.name}
                    className="
                      bg-background/50 border-border/40
                      focus:ring-primary/20
                      h-11! w-full rounded-xl font-bold transition-all
                      sm:h-12!
                    "
                  >
                    <SelectValue placeholder="Choisir le périmètre">
                      {field.state.value === 'system' ? 'Yeko Core' : 'Yeko School'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="
                    bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
                  "
                  >
                    <SelectItem
                      value="system"
                      className="
                        focus:bg-primary/10 focus:text-primary
                        rounded-lg font-medium
                      "
                    >
                      Yeko Core
                    </SelectItem>
                    <SelectItem
                      value="school"
                      className="
                        focus:bg-primary/10 focus:text-primary
                        rounded-lg font-medium
                      "
                    >
                      Yeko School
                    </SelectItem>
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
                  className="
                    bg-muted/30 border-border/40 h-11 rounded-xl font-mono
                    text-xs opacity-70
                    sm:h-12!
                  "
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
                  className="
                    bg-background/50 border-border/40
                    focus:ring-primary/20
                    h-11 rounded-xl font-medium transition-all
                    sm:h-12!
                  "
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
          <div className="
            border-border/20 flex items-center justify-between border-b pb-3
          "
          >
            <h3 className="
              text-lg font-bold tracking-tight
              sm:text-xl
            "
            >
              {t.roles.permissions()}
            </h3>
            <Badge
              variant="outline"
              className="
                bg-primary/5 text-primary border-primary/20 rounded-full px-3
                py-1 text-xs
              "
            >
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
                            className={`
                              border-border/40
                              hover:border-primary/30
                              rounded-2xl border p-5 transition-all
                              ${idx % 2 === 0
                            ? `bg-muted/5`
                            : `bg-background/30`}
                            `}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-bold">{resource.name}</p>
                                  <code className="
                                    text-muted-foreground/50 font-mono
                                    text-[10px] uppercase
                                  "
                                  >
                                    {resource.category}
                                  </code>
                                </div>
                              </div>

                              <div className="
                                xs:grid-cols-3
                                grid grid-cols-2 gap-3
                                sm:grid-cols-5
                              "
                              >
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
                                      className={`
                                        flex cursor-pointer flex-col
                                        items-center justify-center gap-2.5
                                        rounded-2xl border p-3 text-xs
                                        font-medium shadow-xs transition-all
                                        active:scale-95
                                        ${isChecked
                                      ? `
                                        bg-primary/10 border-primary/40
                                        text-primary ring-primary/20 ring-1
                                      `
                                      : `
                                        bg-background/40 border-border/60
                                        text-muted-foreground
                                        hover:bg-primary/5
                                        hover:border-primary/20
                                      `}
                                      `}
                                    >
                                      <Checkbox
                                        checked={!!isChecked}
                                        onCheckedChange={toggle}
                                        className="pointer-events-none"
                                      />
                                      <span className="
                                        text-[10px] font-black tracking-wider
                                        uppercase
                                      "
                                      >
                                        {action.name}
                                      </span>
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

        <DialogFooter className="border-border/10 gap-3 border-t pt-8">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="rounded-xl px-6 font-bold"
            onClick={onCancel}
          >
            {t.common.cancel()}
          </Button>
          <form.Subscribe
            selector={(state: any) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
              <Button
                type="submit"
                size="lg"
                className="
                  shadow-primary/20 rounded-xl px-10 font-black tracking-widest
                  uppercase shadow-xl transition-all
                  hover:scale-[1.02]
                "
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
