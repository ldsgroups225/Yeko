import { IconUserPlus } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { useTranslations } from '@/i18n'

interface Suggestion {
  studentId: string
  studentName: string
  phone: string
  existingParent?: {
    id: string
    firstName: string | null
    lastName: string | null
    phone: string
  }
}

interface AutoMatchSuggestionCardProps {
  suggestion: Suggestion
  isSelected: boolean
  onSelect: (selected: boolean) => void
  relationship: string
  onRelationshipChange: (value: any) => void
}

export function AutoMatchSuggestionCard({
  suggestion,
  isSelected,
  onSelect,
  relationship,
  onRelationshipChange,
}: AutoMatchSuggestionCardProps) {
  const t = useTranslations()

  return (
    <div className={`rounded-xl border p-3 transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/40 bg-card/30 hover:bg-card/50'}`}>
      <div className="flex items-start gap-3">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} className="mt-1" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{suggestion.studentName}</p>
              <p className="text-sm text-muted-foreground">{suggestion.phone}</p>
            </div>
            {suggestion.existingParent
              ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <IconUserPlus className="h-3 w-3" />
                    {t.students.existingParentFound()}
                  </Badge>
                )
              : <Badge variant="outline">{t.students.willCreateParent()}</Badge>}
          </div>

          {suggestion.existingParent && (
            <div className="flex items-center gap-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/20 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {suggestion.existingParent.firstName?.[0]}
                  {suggestion.existingParent.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">
                  {suggestion.existingParent.lastName}
                  {' '}
                  {suggestion.existingParent.firstName}
                </p>
                <p className="text-muted-foreground">{suggestion.existingParent.phone}</p>
              </div>
            </div>
          )}

          {isSelected && (
            <div className="flex items-center gap-2 pt-1">
              <Label className="text-sm">
                {t.students.relationship()}
                :
              </Label>
              <Select value={relationship} onValueChange={onRelationshipChange}>
                <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['father', 'mother', 'guardian', 'grandparent', 'other'].map(r => (
                    <SelectItem key={r} value={r}>
                      {((t.parents as any)[`relationship${r.charAt(0).toUpperCase() + r.slice(1)}`])?.() ?? r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
