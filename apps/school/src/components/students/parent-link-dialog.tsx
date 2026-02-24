import {
  IconLoader2,
  IconUserPlus,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { parentsOptions } from '@/lib/queries/parents'
import { studentsKeys } from '@/lib/queries/students'
import { createParent, linkParentToStudent } from '@/school/functions/parents'
import { ExistingParentSearch } from './parents/existing-parent-search'
import { NewParentForm } from './parents/new-parent-form'

type Relationship = 'father' | 'mother' | 'guardian' | 'grandparent' | 'sibling' | 'other'

interface ParentLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
}

export function ParentLinkDialog({ open, onOpenChange, studentId }: ParentLinkDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'existing' | 'new'>('existing')
  const [search, setSearch] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [linkRelationship, setLinkRelationship] = useState<Relationship>('guardian')
  const [linkIsPrimary, setLinkIsPrimary] = useState(false)

  // New parent form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [occupation, setOccupation] = useState('')
  const [newRelationship, setNewRelationship] = useState<Relationship>('guardian')
  const [newIsPrimary, setNewIsPrimary] = useState(false)
  const [newCanPickup, setNewCanPickup] = useState(true)
  const [newReceiveNotifications, setNewReceiveNotifications] = useState(true)

  const { data: parentsData, isPending: isPendingParents } = useQuery({
    ...parentsOptions.list({ search, limit: 10 }),
    enabled: open && tab === 'existing' && search.length >= 2,
  })

  const resetNewForm = () => {
    setFirstName('')
    setLastName('')
    setPhone('')
    setEmail('')
    setOccupation('')
    setNewRelationship('guardian')
    setNewIsPrimary(false)
    setNewCanPickup(true)
    setNewReceiveNotifications(true)
  }

  const createAndLinkMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.create,
    mutationFn: async () => {
      const parentResult = await createParent({ data: { firstName, lastName, phone, email: email || undefined, occupation: occupation || undefined } })
      if (!parentResult.success)
        throw new Error(parentResult.error)
      await linkParentToStudent({ data: { studentId, parentId: parentResult.data.id, relationship: newRelationship, isPrimary: newIsPrimary, canPickup: newCanPickup, receiveNotifications: newReceiveNotifications } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) })
      toast.success(t.parents.parentLinked())
      onOpenChange(false)
      resetNewForm()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const linkExistingMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.link,
    mutationFn: async () => {
      if (!selectedParentId)
        throw new Error('No parent selected')
      await linkParentToStudent({ data: { studentId, parentId: selectedParentId, relationship: linkRelationship, isPrimary: linkIsPrimary, canPickup: true, receiveNotifications: true } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) })
      toast.success(t.parents.parentLinked())
      onOpenChange(false)
      setSelectedParentId(null)
      setSearch('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.students.linkParent()}</DialogTitle>
          <DialogDescription>{t.parents.description()}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={v => setTab(v as 'existing' | 'new')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">{t.parents.list()}</TabsTrigger>
            <TabsTrigger value="new">{t.parents.addParent()}</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <ExistingParentSearch
              search={search}
              onSearchChange={setSearch}
              isPending={isPendingParents}
              parentsData={parentsData}
              selectedParentId={selectedParentId}
              onParentSelect={setSelectedParentId}
              relationship={linkRelationship}
              onRelationshipChange={setLinkRelationship}
              isPrimary={linkIsPrimary}
              onIsPrimaryChange={setLinkIsPrimary}
              onTabChange={v => setTab(v as 'existing' | 'new')}
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel()}</Button>
              <Button onClick={() => linkExistingMutation.mutate()} disabled={!selectedParentId || linkExistingMutation.isPending}>
                {linkExistingMutation.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.students.linkParent()}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="new">
            <NewParentForm
              firstName={firstName}
              onFirstNameChange={setFirstName}
              lastName={lastName}
              onLastNameChange={setLastName}
              phone={phone}
              onPhoneChange={setPhone}
              email={email}
              onEmailChange={setEmail}
              occupation={occupation}
              onOccupationChange={setOccupation}
              relationship={newRelationship}
              onRelationshipChange={setNewRelationship}
              isPrimary={newIsPrimary}
              onIsPrimaryChange={setNewIsPrimary}
              canPickup={newCanPickup}
              onCanPickupChange={setNewCanPickup}
              receiveNotifications={newReceiveNotifications}
              onReceiveNotificationsChange={setNewReceiveNotifications}
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel()}</Button>
              <Button onClick={() => createAndLinkMutation.mutate()} disabled={!firstName.trim() || !lastName.trim() || phone.trim().length < 8 || createAndLinkMutation.isPending}>
                {createAndLinkMutation.isPending ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconUserPlus className="mr-2 h-4 w-4" />}
                Link parent
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
