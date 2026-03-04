import type { ComponentType } from 'react'
import type { WizardAcademic } from '../wizard-shell'
import { IconArrowRight, IconBook, IconBuilding, IconHeart, IconMapPin, IconSchool, IconStack } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { Switch } from '@workspace/ui/components/switch'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { listPreInscriptionAcademicOptions } from '../../../lib/api/pre-inscription'

interface AcademicStepProps {
  schoolId: string
  onSuccess: (data: WizardAcademic) => void
}

interface AcademicOption {
  id: string
  name: string | null
  seriesId: string | null
  availableOptions: Array<'useTransport' | 'useCanteen' | 'isOrphan' | 'isStateAssigned'>
}

interface AcademicGradeOption {
  id: string
  name: string
  classes: AcademicOption[]
}

interface AcademicOptionsResponse {
  schoolYearId: string
  grades: AcademicGradeOption[]
}

const OPTION_METADATA: Record<
  'useTransport' | 'useCanteen' | 'isOrphan' | 'isStateAssigned',
  {
    label: string
    description: string
    icon: ComponentType<{ className?: string }>
  }
> = {
  useTransport: {
    label: 'Transport scolaire',
    description: 'Activer si l\'élève utilise le service de transport.',
    icon: IconMapPin,
  },
  useCanteen: {
    label: 'Cantine',
    description: 'Activer si l\'élève est inscrit à la cantine.',
    icon: IconBook,
  },
  isOrphan: {
    label: 'Élève orphelin',
    description: 'Utilisé pour appliquer les réductions sociales configurées.',
    icon: IconHeart,
  },
  isStateAssigned: {
    label: 'Affecté par l\'État',
    description: 'Utilisé pour appliquer les bourses ou prises en charge publiques.',
    icon: IconBuilding,
  },
}

export function AcademicStep({ schoolId, onSuccess }: AcademicStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [options, setOptions] = useState<AcademicOptionsResponse | null>(null)
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState({
    useTransport: false,
    useCanteen: false,
    isOrphan: false,
    isStateAssigned: false,
  })

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await listPreInscriptionAcademicOptions({ data: { schoolId } })
        if (response.success) {
          setOptions(response.data)
        }
        else {
          toast.error(response.error)
        }
      }
      catch {
        toast.error('Impossible de charger les options académiques')
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchOptions()
  }, [schoolId])

  const selectedGrade = options?.grades.find(g => g.id === selectedGradeId)
  const selectedClass = selectedGrade?.classes.find(cls => cls.id === selectedClassId)
  const dynamicOptions = selectedClass?.availableOptions ?? []

  const handleNext = () => {
    if (selectedGradeId && selectedClassId && selectedClass && options) {
      onSuccess({
        gradeId: selectedGradeId,
        classId: selectedClassId,
        seriesId: selectedClass.seriesId,
        schoolYearId: options.schoolYearId,
        isOrphan: dynamicOptions.includes('isOrphan') ? selectedOptions.isOrphan : false,
        isStateAssigned: dynamicOptions.includes('isStateAssigned') ? selectedOptions.isStateAssigned : false,
        useCanteen: dynamicOptions.includes('useCanteen') ? selectedOptions.useCanteen : false,
        useTransport: dynamicOptions.includes('useTransport') ? selectedOptions.useTransport : false,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Spinner className="w-10 h-10 border-primary/20 border-t-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Chargement des classes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-foreground">Choix de la Classe</h2>
        <p className="text-muted-foreground">Sélectionnez le niveau et la branche souhaitée.</p>
      </div>

      <div className="grid gap-6">
        {/* Grade Selection */}
        <section className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
            <IconStack className="w-4 h-4" />
            Niveau d'enseignement
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {options?.grades.map(grade => (
              <button
                key={grade.id}
                onClick={() => {
                  setSelectedGradeId(grade.id)
                  setSelectedClassId(null)
                  setSelectedOptions({
                    useTransport: false,
                    useCanteen: false,
                    isOrphan: false,
                    isStateAssigned: false,
                  })
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                  selectedGradeId === grade.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border/40 bg-muted/40 hover:border-border/80'
                }`}
              >
                <div className="relative z-10">
                  <p className={`text-sm font-black transition-colors ${selectedGradeId === grade.id ? 'text-primary' : 'text-foreground'}`}>
                    {grade.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                    {grade.classes.length}
                    {' '}
                    Section(s)
                  </p>
                </div>
                {selectedGradeId === grade.id && (
                  <motion.div
                    layoutId="grade-active"
                    className="absolute inset-0 bg-primary/10"
                    initial={false}
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Class Selection */}
        {selectedGradeId && (
          <section className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
              <IconBook className="w-4 h-4" />
              Section / Branche
            </p>
            <div className="grid gap-2">
              {selectedGrade?.classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => {
                    setSelectedClassId(cls.id)
                    setSelectedOptions({
                      useTransport: false,
                      useCanteen: false,
                      isOrphan: false,
                      isStateAssigned: false,
                    })
                  }}
                  className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                    selectedClassId === cls.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/40 bg-muted/40 hover:border-border/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-bold">{cls.name}</span>
                  {selectedClassId === cls.id
                    ? (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <IconArrowRight className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )
                    : (
                        <div className="w-6 h-6 bg-muted/60 rounded-full" />
                      )}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
            <IconSchool className="w-4 h-4" />
            Options de l'élève
          </p>
          {selectedClassId && dynamicOptions.length === 0 && (
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4 text-sm text-muted-foreground">
              Aucune option additionnelle configurée pour cette classe.
            </div>
          )}
          <div className="grid gap-3">
            {dynamicOptions.map((optionKey) => {
              const optionMeta = OPTION_METADATA[optionKey]
              const Icon = optionMeta.icon
              return (
                <div key={optionKey} className="rounded-xl border border-border/40 bg-muted/30 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      {optionMeta.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {optionMeta.description}
                    </p>
                  </div>
                  <Switch
                    checked={selectedOptions[optionKey]}
                    onCheckedChange={checked => setSelectedOptions(prev => ({ ...prev, [optionKey]: checked }))}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <Button
        onClick={handleNext}
        disabled={!selectedGradeId || !selectedClassId}
        className={`w-full h-14 font-black text-lg shadow-lg active:scale-[0.98] transition-all mt-4 ${
          selectedGradeId && selectedClassId
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
            : 'bg-muted/40 text-muted-foreground cursor-not-allowed border border-border/40'
        }`}
      >
        Valider le choix académique
        <IconArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}
