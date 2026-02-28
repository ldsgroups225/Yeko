import type { getParents } from '@/school/functions/parents'
import { IconUsers } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/hr/empty-state'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { parentsKeys, parentsOptions } from '@/lib/queries/parents'
import { deleteParent, sendParentInvitation } from '@/school/functions/parents'
import { generateUUID } from '@/utils/generateUUID'
import { AutoMatchDialog } from './auto-match-dialog'
import { ParentFormDialog } from './parent-form-dialog'
import { ParentDeleteDialog } from './parents/parent-delete-dialog'
import { ParentFilters } from './parents/parent-filters'
import { ParentStats } from './parents/parent-stats'
import { ParentTableRow } from './parents/parent-table-row'

type ParentItem = Extract<Awaited<ReturnType<typeof getParents>>, { success: true }>['data']['data'][number]

export function ParentsList() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [invitationStatus, setInvitationStatus] = useState<'all' | 'pending' | 'sent' | 'accepted' | 'expired'>('all')
  const [page, setPage] = useState(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [autoMatchDialogOpen, setAutoMatchDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<ParentItem | null>(null)

  const debouncedSearch = useDebounce(search, 500)
  const { data: parentsResult, isPending } = useQuery(
    parentsOptions.list({
      search: debouncedSearch || undefined,
      invitationStatus: invitationStatus === 'all' ? undefined : invitationStatus,
      page,
      limit: 20,
    }),
  )
  const data = parentsResult || null

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.delete,
    mutationFn: (id: string) => deleteParent({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.deleteSuccess())
      setDeleteDialogOpen(false)
      setSelectedParent(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const inviteMutation = useMutation({
    mutationKey: schoolMutationKeys.parents.invite,
    mutationFn: (id: string) => sendParentInvitation({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentsKeys.all })
      toast.success(t.parents.invitationSent())
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <div className="space-y-6">
      <ParentStats
        total={data?.total || 0}
        pending={data?.data?.filter(p => p.invitationStatus === 'pending').length || 0}
        sent={data?.data?.filter(p => p.invitationStatus === 'sent').length || 0}
        accepted={data?.data?.filter(p => p.invitationStatus === 'accepted').length || 0}
      />

      <ParentFilters
        search={search}
        onSearchChange={setSearch}
        status={invitationStatus}
        onStatusChange={val => setInvitationStatus(val)}
        onAutoMatch={() => setAutoMatchDialogOpen(true)}
        onAddParent={() => setCreateDialogOpen(true)}
      />

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
              {isPending
                ? (
                    Array.from({ length: 5 }).map(() => (
                      <TableRow key={generateUUID()}>
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
                            icon={IconUsers}
                            title={t.parents.noParents()}
                            description={t.parents.noParentsDescription()}
                            action={{ label: t.parents.addParent(), onClick: () => setCreateDialogOpen(true) }}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  : (
                      data?.data?.map((item, index) => (
                        <ParentTableRow
                          key={item.id}
                          item={item}
                          index={index}
                          onInvite={inviteMutation.mutate}
                          onDelete={(p) => {
                            setSelectedParent(p)
                            setDeleteDialogOpen(true)
                          }}
                          isInviting={inviteMutation.isPending}
                        />
                      ))
                    )}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {t.common.showing()}
                {' '}
                {(page - 1) * 20 + 1}
                -
                {Math.min(page * 20, data.total)}
                {' '}
                {t.common.of()}
                {' '}
                {data.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t.common.previous()}</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>{t.common.next()}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ParentFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <AutoMatchDialog open={autoMatchDialogOpen} onOpenChange={setAutoMatchDialogOpen} />
      <ParentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        parent={selectedParent}
        onConfirm={() => selectedParent && deleteMutation.mutate(selectedParent.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
