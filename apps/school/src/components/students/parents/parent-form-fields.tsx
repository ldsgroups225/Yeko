import type { UseFormReturn } from 'react-hook-form'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { PhoneInput } from '@workspace/ui/components/phone-number'
import { useTranslations } from '@/i18n'

interface ParentFormFieldsProps {
  form: UseFormReturn<any>
}

export function ParentFormFields({ form }: ParentFormFieldsProps) {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.parents.lastName()}</FormLabel>
              <FormControl><Input placeholder={t.parents.placeholders.lastName()} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.parents.firstName()}</FormLabel>
              <FormControl><Input placeholder={t.parents.placeholders.firstName()} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t.parents.phone()}
                {' '}
                *
              </FormLabel>
              <FormControl><PhoneInput defaultCountry="CI" placeholder={t.parents.placeholders.phone()} {...field} /></FormControl>
              <FormDescription>{t.parents.phoneDescription()}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.parents.phone2()}</FormLabel>
              <FormControl><PhoneInput defaultCountry="CI" placeholder={t.parents.placeholders.phone()} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.parents.email()}</FormLabel>
            <FormControl><Input type="email" placeholder={t.parents.placeholders.email()} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.parents.address()}</FormLabel>
            <FormControl><Input placeholder={t.parents.placeholders.address()} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.parents.occupation()}</FormLabel>
              <FormControl><Input placeholder={t.parents.placeholders.occupation()} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workplace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.parents.workplace()}</FormLabel>
              <FormControl><Input placeholder={t.parents.placeholders.workplace()} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
