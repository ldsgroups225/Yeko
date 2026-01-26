import { zodResolver } from '@hookform/resolvers/zod'
import { IconLink } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { linkTeacherByEmailFn } from '@/school/functions/teachers'

const formSchema = z.object({
  email: z.string().email('Email invalide'),
})

export function LinkTeacherDialog() {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const linkMutation = useMutation({
    mutationFn: linkTeacherByEmailFn,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Enseignant lié avec succès')
        setOpen(false)
        form.reset()
      }
      else {
        toast.error(result.message || 'Erreur lors de la liaison')
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Une erreur est survenue')
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    linkMutation.mutate({ data: values })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(
          <Button variant="outline">
            <IconLink className="mr-2 h-4 w-4" />
            Lier par email
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lier un enseignant</DialogTitle>
          <DialogDescription>
            Entrez l'adresse email de l'utilisateur pour le lier à son compte enseignant.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="enseignant@ecole.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={linkMutation.isPending}>
                {linkMutation.isPending ? 'Liaison en cours...' : 'Lier le compte'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
