import type { WizardSchool, WizardStudent } from '../wizard-shell'
import { IconCircleCheck, IconHeart, IconHome, IconPrinter, IconSend } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { motion } from 'motion/react'

interface SuccessStepProps {
  school: WizardSchool
  student: WizardStudent
}

export function SuccessStep({ school, student }: SuccessStepProps) {
  return (
    <div className="space-y-8 py-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center shadow-2xl shadow-secondary/40"
        >
          <IconCircleCheck className="w-12 h-12 text-secondary-foreground" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-foreground">Félicitations !</h2>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
            La pré-inscription de
            {' '}
            <span className="text-foreground font-bold">{student.firstName}</span>
            {' '}
            a été enregistrée avec succès.
          </p>
        </div>
      </div>

      <Card className="bg-card border-border/40 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full -mr-16 -mt-16" />
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Récapitulatif</p>
            <h3 className="text-xl font-black text-foreground text-center uppercase tracking-tight">
              {student.firstName}
              {' '}
              {student.lastName}
            </h3>
            <Badge className="bg-muted/40 border-border/50 text-foreground/80 font-mono">
              MATRICULE:
              {' '}
              {student.matricule || 'En cours'}
            </Badge>
          </div>

          <div className="h-px bg-border/40 w-full" />

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Établissement</span>
              <span className="font-bold text-foreground">{school.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Statut Dossier</span>
              <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                En attente de validation
              </Badge>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
            <IconHeart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/80 leading-relaxed font-medium">
              Veuillez vous présenter à l'administration de l'école dans les 48h avec vos pièces justificatives pour valider définitivement l'inscription.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-14 border-border/60 bg-muted/40 hover:bg-muted/60 text-foreground font-bold flex items-center justify-center gap-2"
        >
          <IconPrinter className="w-4 h-4" />
          Reçu PDF
        </Button>
        <Button
          variant="outline"
          className="h-14 border-border/60 bg-muted/40 hover:bg-muted/60 text-foreground font-bold flex items-center justify-center gap-2"
        >
          <IconSend className="w-4 h-4" />
          Partager
        </Button>
      </div>

      <Button
        className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-black text-lg active:scale-[0.98] transition-all"
        onClick={() => window.location.href = '/'}
      >
        Retour à l'accueil
        <IconHome className="w-5 h-5 ml-2" />
      </Button>
    </div>
  )
}
