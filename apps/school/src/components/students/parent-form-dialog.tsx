import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
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

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { parentsKeys } from '@/lib/queries/parents'
import { createParent, updateParent } from '@/school/functions/parents'

const phoneRegex = /^(\+225)?\d{10}$/

const parentFormSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  phone: z
    .string()
    .min(10, 'Le téléphone est requis')
    .regex(phoneRegex, 'Format: +2250701020304 ou 0701020304'),
  phone2: z
    .string()
    .regex(phoneRegex, 'Format invalide')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  occupation: z.string().max(100).optional(),
  workplace: z.string().max(200).optional(),
})

type ParentFormValues = z.infer<typeof parentFormSchema>

interface ParentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent?: ParentFormValues & { id: string }
}

export function ParentFormDialog({
  open,
  onOpenChange,
  parent,
}: ParentFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isEditing = !!parent

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      firstName: parent?.firstName || '',
      lastName: parent?.lastName || '',
      phone: parent?.phone || '',
      phone2: parent?.phone2 || '',
      email: parent?.email || '',
      address: parent?.address || '',
      occupation: parent?.occupation || '',
      workplace: parent?.workplace || '',
    },
  })

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.create,
    mutationFn: (data: ParentFormValues) => createParent({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.createSuccess())
      onOpenChange(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.update,
    mutationFn: (data: ParentFormValues) =>
      updateParent({ data: { id: parent!.id, updates: data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.updateSuccess())
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data: ParentFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data)
    }
    else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t.parents.editParent() : t.parents.addParent()}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t.parents.editParentDescription()
              : t.parents.addParentDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.parents.lastName()}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.parents.placeholders.lastName()}
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        placeholder={t.parents.placeholders.firstName()}
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        placeholder={t.parents.placeholders.phone()}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t.parents.phoneDescription()}
                    </FormDescription>
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
                    <FormControl>
                      <Input
                        placeholder={t.parents.placeholders.phone()}
                        {...field}
                      />
                    </FormControl>
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
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t.parents.placeholders.email()}
                      {...field}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      placeholder={t.parents.placeholders.address()}
                      {...field}
                    />
                  </FormControl>
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
                    <FormControl>
                      <Input
                        placeholder={t.parents.placeholders.occupation()}
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        placeholder={t.parents.placeholders.workplace()}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t.common.cancel()}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t.common.loading() : t.common.save()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
