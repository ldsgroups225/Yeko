import { IconRocket, IconSettings, IconUserPlus } from '@tabler/icons-react'
import { Card, CardContent } from '@workspace/ui/components/card'

const steps = [
  {
    icon: IconUserPlus,
    step: '1',
    title: 'Sign Up & Setup',
    description: 'Create your school account and add your staff, teachers, and students in minutes.',
  },
  {
    icon: IconSettings,
    step: '2',
    title: 'Configure Your School',
    description: 'Set up classes, subjects, fee structures, and academic calendar with our intuitive interface.',
  },
  {
    icon: IconRocket,
    step: '3',
    title: 'Go Live',
    description: 'Start managing grades, attendance, and communication. Your school is now digital!',
  },
]

export function HowItWorksSection() {
  return (
    <section className="
      bg-muted/30 py-24
      sm:py-32
    "
    >
      <div className="
        mx-auto max-w-7xl px-6
        lg:px-8
      "
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="
            text-foreground text-3xl font-bold tracking-tight
            sm:text-4xl
          "
          >
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            From signup to full operation in less than a week
          </p>
        </div>

        <div className="
          mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8
          lg:mx-0 lg:max-w-none lg:grid-cols-3
        "
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <div className="
                    from-primary/50 absolute top-16 left-full hidden h-0.5
                    w-full -translate-x-1/2 bg-gradient-to-r to-transparent
                    lg:block
                  "
                  />
                )}
                <Card className="
                  relative overflow-hidden border-2 transition-all duration-300
                  hover:shadow-xl
                "
                >
                  <CardContent className="p-8">
                    <div className="
                      text-primary/5 absolute top-4 right-4 text-6xl font-bold
                    "
                    >
                      {step.step}
                    </div>
                    <div className="
                      bg-primary text-primary-foreground mb-6 flex h-14 w-14
                      items-center justify-center rounded-xl
                    "
                    >
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <div className="text-primary mb-2 text-sm font-semibold">
                      Step
                      {step.step}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
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
