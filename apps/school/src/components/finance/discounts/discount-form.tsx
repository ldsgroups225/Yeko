import type { UseFormReturn } from 'react-hook-form'
import type { DiscountFormData } from './discount-schema'
import { IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { DialogFooter } from '@workspace/ui/components/dialog'
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
import {
  calculationTypeLabels,
  calculationTypes,
  discountTypeLabels,
  discountTypes,
} from '@/schemas/discount'

interface DiscountFormProps {
  form: UseFormReturn<DiscountFormData>
  onSubmit: (data: DiscountFormData) => void
  isPending: boolean
  onCancel: () => void
}

export function DiscountForm({ form, onSubmit, isPending, onCancel }: DiscountFormProps) {
  const t = useTranslations()
  const watchCalculationType = form.watch('calculationType')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="
          grid gap-4
          md:grid-cols-2
        "
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t.common.code()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t.finance.discounts.placeholders.code()}
                    className="
                      border-border/40 bg-muted/20
                      focus:bg-background
                      rounded-xl font-mono transition-colors
                    "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t.finance.discounts.type()}
                  {' '}
                  *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="
                      border-border/40 bg-muted/20
                      focus:bg-background
                      rounded-xl transition-colors
                    "
                    >
                      <SelectValue>
                        {field.value ? discountTypeLabels[field.value as keyof typeof discountTypeLabels] : ''}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="
                    bg-popover/95 border-border/40 rounded-xl shadow-xl
                    backdrop-blur-xl
                  "
                  >
                    {discountTypes.map(type => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="
                          focus:bg-primary/10
                          cursor-pointer rounded-lg
                        "
                      >
                        {discountTypeLabels[type]}
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.common.name()}
                {' '}
                *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.discounts.placeholders.name()}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.common.nameEn()}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.discounts.placeholders.nameEn()}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
                />
              </FormControl>
              <FormDescription className="text-[11px]">
                {t.common.optionalEnglishName()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="
          grid gap-4
          md:grid-cols-2
        "
        >
          <FormField
            control={form.control}
            name="calculationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t.finance.discounts.calculationType()}
                  {' '}
                  *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="
                      border-border/40 bg-muted/20
                      focus:bg-background
                      rounded-xl transition-colors
                    "
                    >
                      <SelectValue>
                        {field.value ? calculationTypeLabels[field.value as keyof typeof calculationTypeLabels] : ''}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="
                    bg-popover/95 border-border/40 rounded-xl shadow-xl
                    backdrop-blur-xl
                  "
                  >
                    {calculationTypes.map(type => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="
                          focus:bg-primary/10
                          cursor-pointer rounded-lg
                        "
                      >
                        {calculationTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t.finance.discounts.value()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      {...field}
                      className="
                        border-border/40 bg-muted/20
                        focus:bg-background
                        rounded-xl pr-12 text-lg font-bold transition-colors
                      "
                      placeholder="0"
                    />
                    <span className="
                      text-muted-foreground absolute top-1/2 right-3
                      -translate-y-1/2 text-sm font-medium
                    "
                    >
                      {watchCalculationType === 'percentage' ? '%' : 'FCFA'}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="requiresApproval"
            render={({ field }) => (
              <FormItem className="
                border-border/40 bg-muted/10 flex h-full items-center gap-3
                space-y-0 rounded-xl border p-3
              "
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="
                  w-full cursor-pointer truncate text-xs font-bold
                "
                >
                  {t.finance.discounts.requiresApproval()}
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoApply"
            render={({ field }) => (
              <FormItem className="
                border-border/40 bg-muted/10 flex h-full items-center gap-3
                space-y-0 rounded-xl border p-3
              "
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="
                  w-full cursor-pointer truncate text-xs font-bold
                "
                >
                  {t.finance.discounts.autoApply()}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border/40 rounded-xl"
          >
            {t.common.cancel()}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="shadow-primary/20 rounded-xl shadow-lg"
          >
            {isPending && (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t.common.save()}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
