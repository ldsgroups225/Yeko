import {
  IconLoader2,
  IconUsers,
  IconWand,
} from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { parentsOptions } from '@/lib/queries/parents'
import { studentsKeys } from '@/lib/queries/students'
import { createParent, linkParentToStudent } from '@/school/functions/parents'
import { AutoMatchResultView } from './parents/auto-match-result-view'
import { AutoMatchSuggestionCard } from './parents/auto-match-suggestion-card'

interface AutoMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Relationship = 'father' | 'mother' | 'guardian' | 'grandparent' | 'other'

interface Suggestion {
  studentId: string
  studentName: string
  phone: string
  existingParent?: { id: string, firstName: string | null, lastName: string | null, phone: string }
}

interface SelectedMatch {
  studentId: string
  relationship: Relationship
  createNew: boolean
}

export function AutoMatchDialog({ open, onOpenChange }: AutoMatchDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [selectedMatches, setSelectedMatches] = useState(() => new Map<string, SelectedMatch>())
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ linked: number, created: number } | null>(null)

  const { data, isPending } = useQuery({ ...parentsOptions.autoMatch(), enabled: open })
  const suggestions: Suggestion[] = data ? data.suggestions : []

  const toggleSelection = (studentId: string, suggestion: Suggestion) => {
    const newMap = new Map(selectedMatches)
    if (newMap.has(studentId))
      newMap.delete(studentId)
    else newMap.set(studentId, { studentId, relationship: 'guardian', createNew: !suggestion.existingParent })
    setSelectedMatches(newMap)
  }

  const updateRelationship = (studentId: string, relationship: Relationship) => {
    const newMap = new Map(selectedMatches)
    const match = newMap.get(studentId)
    if (match) {
      newMap.set(studentId, { ...match, relationship })
      setSelectedMatches(newMap)
    }
  }

  const processMatches = async () => {
    setIsProcessing(true)
    let linked = 0
    let created = 0

    try {
      for (const [studentId, match] of selectedMatches) {
        const suggestion = suggestions.find(s => s.studentId === studentId)
        if (!suggestion)
          continue
        let parentId: string
        if (suggestion.existingParent) {
          parentId = suggestion.existingParent.id
        }
        else {
          const nameParts = suggestion.studentName.split(' ')
          const parentResult = await createParent({ data: { firstName: t.students.emergencyContact(), lastName: nameParts[0] || '', phone: suggestion.phone } })
          if (!parentResult.success) {
            toast.error(parentResult.error)
            continue
          }
          parentId = parentResult.data.id
          created++
        }
        await linkParentToStudent({ data: { studentId, parentId, relationship: match.relationship, isPrimary: true, canPickup: true, receiveNotifications: true } })
        linked++
      }
      setResults({ linked, created })
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.autoMatchSuccess({ count: linked }))
    }
    catch (err) { toast.error(err instanceof Error ? err.message : t.common.error()) }
    finally { setIsProcessing(false) }
  }

  const handleClose = () => {
    setSelectedMatches(new Map())
    setResults(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="
        bg-card/95 border-border/40 max-w-2xl backdrop-blur-xl
      "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconWand className="h-5 w-5" />
            {t.students.autoMatchParents()}
          </DialogTitle>
          <DialogDescription>{t.students.autoMatchDescription()}</DialogDescription>
        </DialogHeader>

        {results
          ? <AutoMatchResultView linked={results.linked} created={results.created} onClose={handleClose} />
          : isPending
            ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="
                    text-muted-foreground h-8 w-8 animate-spin
                  "
                  />
                </div>
              )
            : suggestions.length === 0
              ? (
                  <div className="
                    flex flex-col items-center justify-center gap-3 py-8
                    text-center
                  "
                  >
                    <IconUsers className="text-muted-foreground h-12 w-12" />
                    <h3 className="font-semibold">{t.students.noMatchSuggestions()}</h3>
                    <p className="text-muted-foreground text-sm">{t.students.noMatchSuggestionsDescription()}</p>
                    <DialogFooter className="mt-4"><Button variant="outline" onClick={handleClose}>{t.common.close()}</Button></DialogFooter>
                  </div>
                )
              : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">{t.students.matchSuggestionsCount({ count: suggestions.length })}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedMatches(new Map(suggestions.map(s => [s.studentId, { studentId: s.studentId, relationship: 'guardian', createNew: !s.existingParent }])))}>{t.common.selectAll()}</Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedMatches(new Map())}>{t.common.deselectAll()}</Button>
                      </div>
                    </div>
                    <div className="max-h-[400px] space-y-2 overflow-y-auto">
                      {suggestions.map(suggestion => (
                        <AutoMatchSuggestionCard
                          key={suggestion.studentId}
                          suggestion={suggestion}
                          isSelected={selectedMatches.has(suggestion.studentId)}
                          onSelect={() => toggleSelection(suggestion.studentId, suggestion)}
                          relationship={selectedMatches.get(suggestion.studentId)?.relationship || 'guardian'}
                          onRelationshipChange={v => updateRelationship(suggestion.studentId, v)}
                        />
                      ))}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleClose}>{t.common.cancel()}</Button>
                      <Button onClick={processMatches} disabled={selectedMatches.size === 0 || isProcessing}>
                        {isProcessing && (
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <IconWand className="mr-2 h-4 w-4" />
                        {t.students.linkSelected({ count: selectedMatches.size })}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
      </DialogContent>
    </Dialog>
  )
}
