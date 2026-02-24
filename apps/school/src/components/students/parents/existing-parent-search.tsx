import { IconLoader2, IconSearch, IconUser } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Switch } from '@workspace/ui/components/switch'
import { useTranslations } from '@/i18n'

interface ExistingParentSearchProps {
  search: string
  onSearchChange: (value: string) => void
  isPending: boolean
  parentsData: any
  selectedParentId: string | null
  onParentSelect: (id: string | null) => void
  relationship: string
  onRelationshipChange: (value: any) => void
  isPrimary: boolean
  onIsPrimaryChange: (value: boolean) => void
  onTabChange: (value: string) => void
}

export function ExistingParentSearch({
  search,
  onSearchChange,
  isPending,
  parentsData,
  selectedParentId,
  onParentSelect,
  relationship,
  onRelationshipChange,
  isPrimary,
  onIsPrimaryChange,
  onTabChange,
}: ExistingParentSearchProps) {
  const t = useTranslations()

  return (
    <div className="space-y-4 pt-4">
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t.parents.searchPlaceholder()}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {isPending && <div className="flex justify-center py-8"><IconLoader2 className="h-6 w-6 animate-spin text-primary" /></div>}

      {!isPending && search.length >= 2 && parentsData?.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <IconUser className="h-8 w-8 opacity-50 mb-2" />
          <p>{t.parents.noParents()}</p>
          <Button variant="link" onClick={() => onTabChange('new')} className="mt-2">{t.parents.addParent()}</Button>
        </div>
      )}

      {parentsData?.data.length > 0 && (
        <RadioGroup
          value={selectedParentId || ''}
          onValueChange={onParentSelect}
          className="max-h-[240px] overflow-y-auto pr-2"
        >
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
              <Select value={relationship} onValueChange={onRelationshipChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t.parents.relationship()}>
                    {((t.parents as any)[`relationship${relationship.charAt(0).toUpperCase() + relationship.slice(1)}`])?.() ?? relationship}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other'].map(r => (
                    <SelectItem key={r} value={r}>
                      {((t.parents as any)[`relationship${r.charAt(0).toUpperCase() + r.slice(1)}`])?.() ?? r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch checked={isPrimary} onCheckedChange={onIsPrimaryChange} />
              <Label>Primary contact</Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
