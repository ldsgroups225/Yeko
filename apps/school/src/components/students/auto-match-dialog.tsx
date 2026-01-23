import {
  IconCircleCheck,
  IconLoader2,
  IconUserPlus,
  IconUsers,
  IconWand,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "@/i18n";
import { parentsOptions } from "@/lib/queries/parents";
import { studentsKeys } from "@/lib/queries/students";
import { createParent, linkParentToStudent } from "@/school/functions/parents";

interface AutoMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Relationship =
  | "father"
  | "mother"
  | "guardian"
  | "grandparent"
  | "sibling"
  | "other";

interface Suggestion {
  studentId: string;
  studentName: string;
  phone: string;
  existingParent?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
}

interface SelectedMatch {
  studentId: string;
  relationship: Relationship;
  createNew: boolean;
}

export function AutoMatchDialog({ open, onOpenChange }: AutoMatchDialogProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [selectedMatches, setSelectedMatches] = useState(
    () => new Map<string, SelectedMatch>(),
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    linked: number;
    created: number;
  } | null>(null);

  const { data, isLoading } = useQuery({
    ...parentsOptions.autoMatch(),
    enabled: open,
  });

  const suggestions: Suggestion[] = data?.suggestions || [];

  const toggleSelection = (studentId: string, suggestion: Suggestion) => {
    const newMap = new Map(selectedMatches);
    if (newMap.has(studentId)) {
      newMap.delete(studentId);
    } else {
      newMap.set(studentId, {
        studentId,
        relationship: "guardian",
        createNew: !suggestion.existingParent,
      });
    }
    setSelectedMatches(newMap);
  };

  const updateRelationship = (
    studentId: string,
    relationship: Relationship,
  ) => {
    const newMap = new Map(selectedMatches);
    const match = newMap.get(studentId);
    if (match) {
      newMap.set(studentId, { ...match, relationship });
      setSelectedMatches(newMap);
    }
  };

  const selectAll = () => {
    const newMap = new Map<string, SelectedMatch>();
    suggestions.forEach((s) => {
      newMap.set(s.studentId, {
        studentId: s.studentId,
        relationship: "guardian",
        createNew: !s.existingParent,
      });
    });
    setSelectedMatches(newMap);
  };

  const deselectAll = () => {
    setSelectedMatches(new Map());
  };

  const processMatches = async () => {
    setIsProcessing(true);
    let linked = 0;
    let created = 0;

    try {
      for (const [studentId, match] of selectedMatches) {
        const suggestion = suggestions.find((s) => s.studentId === studentId);
        if (!suggestion) continue;

        let parentId: string;

        if (suggestion.existingParent) {
          parentId = suggestion.existingParent.id;
        } else {
          // Create new parent from emergency contact
          const nameParts = suggestion.studentName.split(" ");
          const parent = await createParent({
            data: {
              firstName: t.students.emergencyContact(),
              lastName: nameParts[0] || "",
              phone: suggestion.phone,
            },
          });
          parentId = parent.id;
          created++;
        }

        await linkParentToStudent({
          data: {
            studentId,
            parentId,
            relationship: match.relationship,
            isPrimary: true,
            canPickup: true,
            receiveNotifications: true,
          },
        });
        linked++;
      }

      setResults({ linked, created });
      queryClient.invalidateQueries({ queryKey: studentsKeys.all });
      toast.success(t.students.autoMatchSuccess({ count: linked }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedMatches(new Map());
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconWand className="h-5 w-5" />
            {t.students.autoMatchParents()}
          </DialogTitle>
          <DialogDescription>
            {t.students.autoMatchDescription()}
          </DialogDescription>
        </DialogHeader>

        {results ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
              <IconCircleCheck className="h-12 w-12 text-green-500" />
              <h3 className="text-lg font-semibold">
                {t.students.autoMatchComplete()}
              </h3>
              <div className="text-center text-sm text-muted-foreground">
                <p>{t.students.autoMatchLinked({ count: results.linked })}</p>
                {results.created > 0 && (
                  <p>
                    {t.students.autoMatchCreated({ count: results.created })}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>{t.common.close()}</Button>
            </DialogFooter>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <IconUsers className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">{t.students.noMatchSuggestions()}</h3>
            <p className="text-sm text-muted-foreground">
              {t.students.noMatchSuggestionsDescription()}
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleClose}>
                {t.common.close()}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t.students.matchSuggestionsCount({
                  count: suggestions.length,
                })}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {t.common.selectAll()}
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  {t.common.deselectAll()}
                </Button>
              </div>
            </div>

            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {suggestions.map((suggestion) => {
                const isSelected = selectedMatches.has(suggestion.studentId);
                const match = selectedMatches.get(suggestion.studentId);

                return (
                  <div
                    key={suggestion.studentId}
                    className={`rounded-xl border p-3 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/40 bg-card/30 hover:bg-card/50"}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          toggleSelection(suggestion.studentId, suggestion)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {suggestion.studentName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.phone}
                            </p>
                          </div>
                          {suggestion.existingParent ? (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <IconUserPlus className="h-3 w-3" />
                              {t.students.existingParentFound()}
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {t.students.willCreateParent()}
                            </Badge>
                          )}
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
                                {suggestion.existingParent.lastName}{" "}
                                {suggestion.existingParent.firstName}
                              </p>
                              <p className="text-muted-foreground">
                                {suggestion.existingParent.phone}
                              </p>
                            </div>
                          </div>
                        )}

                        {isSelected && (
                          <div className="flex items-center gap-2 pt-1">
                            <Label className="text-sm">
                              {t.students.relationship()}:
                            </Label>
                            <Select
                              value={match?.relationship || "guardian"}
                              onValueChange={(v) =>
                                updateRelationship(
                                  suggestion.studentId,
                                  (v ?? "guardian") as Relationship,
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="father">
                                  {t.parents.relationshipFather()}
                                </SelectItem>
                                <SelectItem value="mother">
                                  {t.parents.relationshipMother()}
                                </SelectItem>
                                <SelectItem value="guardian">
                                  {t.parents.relationshipGuardian()}
                                </SelectItem>
                                <SelectItem value="grandparent">
                                  {t.parents.relationshipGrandparent()}
                                </SelectItem>
                                <SelectItem value="other">
                                  {t.parents.relationshipOther()}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t.common.cancel()}
              </Button>
              <Button
                onClick={processMatches}
                disabled={selectedMatches.size === 0 || isProcessing}
              >
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
  );
}
