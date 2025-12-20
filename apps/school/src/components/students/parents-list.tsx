'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/hr/empty-state'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
import { parentsKeys, parentsOptions } from '@/lib/queries/parents'
import { deleteParent, sendParentInvitation } from '@/school/functions/parents'

import { generateUUID } from '@/utils/generateUUID'
import { AutoMatchDialog } from './auto-match-dialog'
import { ParentFormDialog } from './parent-form-dialog'

const invitationStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function ParentsList() {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [invitationStatus, setInvitationStatus] = useState<string>('all')
  const [page, setPage] = useState(1)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [autoMatchDialogOpen, setAutoMatchDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<any>(null)

  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useQuery(
    parentsOptions.list({
      search: debouncedSearch || undefined,
      invitationStatus: invitationStatus === 'all' ? undefined : invitationStatus,
      page,
      limit: 20,
    }),
  )

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteParent({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.deleteSuccess())
      setDeleteDialogOpen(false)
      setSelectedParent(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (id: string) => sendParentInvitation({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.invitationSent())
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = (parent: any) => {
    setSelectedParent(parent)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.parents.totalParents()}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.parents.invitationPending()}
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.data?.filter((p: any) => p.parent.invitationStatus === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.parents.invitationSentCount()}
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.data?.filter((p: any) => p.parent.invitationStatus === 'sent').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.parents.registered()}
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.data?.filter((p: any) => p.parent.invitationStatus === 'accepted').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.parents.searchPlaceholder()}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={invitationStatus} onValueChange={setInvitationStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.parents.filterByStatus()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all()}</SelectItem>
              <SelectItem value="pending">{t.parents.statusPending()}</SelectItem>
              <SelectItem value="sent">{t.parents.statusSent()}</SelectItem>
              <SelectItem value="accepted">{t.parents.statusAccepted()}</SelectItem>
              <SelectItem value="expired">{t.parents.statusExpired()}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAutoMatchDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t.students.autoMatch()}
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.parents.addParent()}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.parents.list()}</CardTitle>
          <CardDescription>{t.parents.listDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.parents.parent()}</TableHead>
                <TableHead>{t.parents.phone()}</TableHead>
                <TableHead>{t.parents.email()}</TableHead>
                <TableHead>{t.parents.children()}</TableHead>
                <TableHead>{t.parents.invitationStatus()}</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? (
                    Array.from({ length: 5 }, () => (
                      <TableRow key={`skeleton-${generateUUID()}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  )
                : data?.data?.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <EmptyState
                            icon={Users}
                            title={t.parents.noParents()}
                            description={t.parents.noParentsDescription()}
                            action={{
                              label: t.parents.addParent(),
                              onClick: () => setCreateDialogOpen(true),
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : (
                      data?.data?.map((item: any, index: number) => (
                        <motion.tr
                          key={item.parent.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {item.parent.firstName?.[0]}
                                  {item.parent.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {item.parent.lastName}
                                  {' '}
                                  {item.parent.firstName}
                                </p>
                                {item.parent.occupation && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.parent.occupation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {item.parent.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.parent.email
                              ? (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    {item.parent.email}
                                  </div>
                                )
                              : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.childrenCount}
                              {' '}
                              {t.parents.childrenCount()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={invitationStatusColors[item.parent.invitationStatus || 'pending']}>
                              {{
                                pending: t.parents.statusPending,
                                sent: t.parents.statusSent,
                                accepted: t.parents.statusAccepted,
                                expired: t.parents.statusExpired,
                              }[item.parent.invitationStatus as 'pending' | 'sent' | 'accepted' | 'expired']()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {item.parent.invitationStatus !== 'accepted' && (
                                  <DropdownMenuItem
                                    onClick={() => inviteMutation.mutate(item.parent.id)}
                                    disabled={inviteMutation.isPending}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    {t.parents.sendInvitation()}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(item)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t.common.delete()}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t.common.showing()}
                {' '}
                {((page - 1) * 20) + 1}
                -
                {Math.min(page * 20, data.total)}
                {' '}
                {t.common.of()}
                {' '}
                {data.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t.common.previous()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  {t.common.next()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Parent Dialog */}
      <ParentFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Auto Match Dialog */}
      <AutoMatchDialog
        open={autoMatchDialogOpen}
        onOpenChange={setAutoMatchDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.parents.deleteTitle()}</DialogTitle>
            <DialogDescription>
              {t.parents.deleteDescription({
                name: `${selectedParent?.parent?.lastName} ${selectedParent?.parent?.firstName}`,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t.common.cancel()}
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedParent && deleteMutation.mutate(selectedParent.parent.id)}
              disabled={deleteMutation.isPending}
            >
              {t.common.delete()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
