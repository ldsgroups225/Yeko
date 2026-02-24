import type { UseFormReturn } from 'react-hook-form'
import { IconCopy, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useTranslations } from '@/i18n'
import { feeCategories, feeCategoryLabels } from '@/schemas/fee-type'

interface FeeTypeFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  onCancel: () => void
  isPending: boolean
  isEditMode: boolean
  templates?: any[]
  onTemplateSelect: (templateId: string) => void
}

export function FeeTypeForm({
  form,
  onSubmit,
  onCancel,
  isPending,
  isEditMode,
  templates,
  onTemplateSelect,
}: FeeTypeFormProps) {
  const t = useTranslations()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEditMode && (
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                  <IconCopy className="h-3 w-3" />
                  Import from template
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value)
                      onTemplateSelect(value)
                    }
                  }}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                      <SelectValue placeholder="Sélectionner un modèle...">
                        {field.value
                          ? (() => {
                              const tpl = templates?.find(tpl => tpl.id === field.value)
                              return tpl
                                ? (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{tpl.name}</span>
                                      <span className="text-muted-foreground text-xs">
                                        (
                                        {tpl.code}
                                        )
                                      </span>
                                    </div>
                                  )
                                : undefined
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                    {templates?.map(template => (
                      <SelectItem
                        key={template.id}
                        value={template.id}
                        className="rounded-lg cursor-pointer focus:bg-primary/10"
                      >
                        <span className="font-medium">{template.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          (
                          {template.code}
                          )
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-[11px]">
                  Sélectionnez un modèle pour pré-remplir le formulaire
                </FormDescription>
              </FormItem>
            )}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {t.common.code()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t.finance.feeTypes.placeholders.code()}
                    className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {t.finance.feeTypes.category()}
                  {' '}
                  *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                      <SelectValue placeholder={t.finance.feeTypes.category()}>
                        {field.value ? feeCategoryLabels[field.value as keyof typeof feeCategoryLabels] : null}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                    {feeCategories.map(cat => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="rounded-lg cursor-pointer focus:bg-primary/10"
                      >
                        {feeCategoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.common.name()}
                {' '}
                *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.feeTypes.placeholders.name()}
                  className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nameEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.common.nameEn()}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.feeTypes.placeholders.nameEn()}
                  className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                />
              </FormControl>
              <FormDescription className="text-[11px]">
                {t.common.optionalEnglishName()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.common.displayOrder()}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-6 pt-2">
          <FormField
            control={form.control}
            name="isMandatory"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 rounded-xl border border-border/40 p-3 bg-muted/10">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-border/60 rounded-md"
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  {t.finance.feeTypes.mandatory()}
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 rounded-xl border border-border/40 p-3 bg-muted/10">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-border/60 rounded-md"
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  {t.finance.feeTypes.recurring()}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-border/40"
          >
            {t.common.cancel()}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl shadow-lg shadow-primary/20"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? t.common.save() : t.finance.feeTypes.create()}
          </Button>
        </div>
      </form>
    </Form>
  )
}
