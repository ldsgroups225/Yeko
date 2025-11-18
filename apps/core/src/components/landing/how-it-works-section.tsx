import { Rocket, Settings, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  {
    icon: UserPlus,
    step: '1',
    title: 'Sign Up & Setup',
    description: 'Create your school account and add your staff, teachers, and students in minutes.',
  },
  {
    icon: Settings,
    step: '2',
    title: 'Configure Your School',
    description: 'Set up classes, subjects, fee structures, and academic calendar with our intuitive interface.',
  },
  {
    icon: Rocket,
    step: '3',
    title: 'Go Live',
    description: 'Start managing grades, attendance, and communication. Your school is now digital!',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get Started in 3 Simple Steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From signup to full operation in less than a week
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2" />
                )}
                <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="absolute top-4 right-4 text-6xl font-bold text-primary/5">
                      {step.step}
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-6">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <div className="text-sm font-semibold text-primary mb-2">
                      Step
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
