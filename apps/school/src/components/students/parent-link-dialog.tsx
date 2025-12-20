'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search, User, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from '@/i18n'
import { parentsOptions } from '@/lib/queries/parents'
import { studentsKeys } from '@/lib/queries/students'
import { createParent, linkParentToStudent } from '@/school/functions/parents'

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

  const { data: parentsData, isLoading: parentsLoading } = useQuery({
    ...parentsOptions.list({ search, limit: 10 }),
    enabled: open && tab === 'existing' && search.length >= 2,
  })

  const canSubmitNew = firstName.trim() && lastName.trim() && phone.trim().length >= 8

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
    mutationFn: async () => {
      const parent = await createParent({
        data: { firstName, lastName, phone, email: email || undefined, occupation: occupation || undefined },
      })
      await linkParentToStudent({
        data: {
          studentId,
          parentId: parent.id,
          relationship: newRelationship,
          isPrimary: newIsPrimary,
          canPickup: newCanPickup,
          receiveNotifications: newReceiveNotifications,
        },
      })
      return parent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) })
      toast.success(t.parents.parentLinked())
      onOpenChange(false)
      resetNewForm()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const linkExistingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedParentId)
        throw new Error('No parent selected')
      await linkParentToStudent({
        data: {
          studentId,
          parentId: selectedParentId,
          relationship: linkRelationship,
          isPrimary: linkIsPrimary,
          canPickup: true,
          receiveNotifications: true,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) })
      toast.success(t.parents.parentLinked())
      onOpenChange(false)
      setSelectedParentId(null)
      setSearch('')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.students.linkParent()}</DialogTitle>
          <DialogDescription>{t.parents.description()}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={v => setTab(v as 'existing' | 'new')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">{t.parents.list()}</TabsTrigger>
            <TabsTrigger value="new">{t.parents.addParent()}</TabsTrigger>
          </TabsList>

          {/* Link Existing Parent */}
          <TabsContent value="existing" className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.parents.searchPlaceholder()}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {parentsLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {!parentsLoading && search.length >= 2 && parentsData?.data && parentsData.data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <User className="h-8 w-8 opacity-50 mb-2" />
                <p>{t.parents.noParents()}</p>
                <Button variant="link" onClick={() => setTab('new')} className="mt-2">
                  {t.parents.addParent()}
                </Button>
              </div>
            )}

            {parentsData?.data && parentsData.data.length > 0 && (
              <RadioGroup value={selectedParentId || ''} onValueChange={setSelectedParentId} className="max-h-[240px] overflow-y-auto pr-2">
                <div className="space-y-2">
                  {parentsData.data.map((parent: any) => (
                    <div key={parent.id} className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <RadioGroupItem value={parent.id} id={parent.id} />
                      <Label htmlFor={parent.id} className="flex flex-1 cursor-pointer items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {parent.firstName?.[0]}
                            {parent.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {parent.lastName}
                            {' '}
                            {parent.firstName}
                          </p>
                          <p className="text-sm text-muted-foreground">{parent.phone}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {selectedParentId && (
              <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.parents.relationship()}</Label>
                    <Select value={linkRelationship} onValueChange={v => setLinkRelationship(v as Relationship)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">{t.parents.relationshipFather()}</SelectItem>
                        <SelectItem value="mother">{t.parents.relationshipMother()}</SelectItem>
                        <SelectItem value="guardian">{t.parents.relationshipGuardian()}</SelectItem>
                        <SelectItem value="grandparent">{t.parents.relationshipGrandparent()}</SelectItem>
                        <SelectItem value="sibling">{t.parents.relationshipSibling()}</SelectItem>
                        <SelectItem value="other">{t.parents.relationshipOther()}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch checked={linkIsPrimary} onCheckedChange={setLinkIsPrimary} />
                    <Label>Primary contact</Label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t.common.cancel()}
              </Button>
              <Button
                onClick={() => linkExistingMutation.mutate()}
                disabled={!selectedParentId || linkExistingMutation.isPending}
              >
                {linkExistingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.students.linkParent()}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Create New Parent */}
          <TabsContent value="new" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  {t.parents.lastName()}
                  {' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>
                  {t.parents.firstName()}
                  {' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>
                  {t.parents.phone()}
                  {' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
              </div>
              <div className="space-y-2">
                <Label>{t.parents.email()}</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-2">
                <Label>
                  {t.parents.relationship()}
                  {' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Select value={newRelationship} onValueChange={v => setNewRelationship(v as Relationship)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">{t.parents.relationshipFather()}</SelectItem>
                    <SelectItem value="mother">{t.parents.relationshipMother()}</SelectItem>
                    <SelectItem value="guardian">{t.parents.relationshipGuardian()}</SelectItem>
                    <SelectItem value="grandparent">{t.parents.relationshipGrandparent()}</SelectItem>
                    <SelectItem value="sibling">{t.parents.relationshipSibling()}</SelectItem>
                    <SelectItem value="other">{t.parents.relationshipOther()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.parents.occupation()}</Label>
                <Input value={occupation} onChange={e => setOccupation(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center space-x-2">
                <Switch checked={newIsPrimary} onCheckedChange={setNewIsPrimary} />
                <Label className="cursor-pointer" onClick={() => setNewIsPrimary(!newIsPrimary)}>Primary contact</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={newCanPickup} onCheckedChange={setNewCanPickup} />
                <Label className="cursor-pointer" onClick={() => setNewCanPickup(!newCanPickup)}>Can pick up</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={newReceiveNotifications} onCheckedChange={setNewReceiveNotifications} />
                <Label className="cursor-pointer" onClick={() => setNewReceiveNotifications(!newReceiveNotifications)}>Receives notifications</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t.common.cancel()}
              </Button>
              <Button
                onClick={() => createAndLinkMutation.mutate()}
                disabled={!canSubmitNew || createAndLinkMutation.isPending}
              >
                {createAndLinkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!createAndLinkMutation.isPending && <UserPlus className="mr-2 h-4 w-4" />}
                Link parent
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
