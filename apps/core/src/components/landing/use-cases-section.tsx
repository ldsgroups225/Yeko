import { BookOpen, GraduationCap, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const useCases = [
  {
    icon: GraduationCap,
    title: 'School Administration',
    description: 'Manage entire school operations from enrollment to graduation with complete oversight and control.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: BookOpen,
    title: 'Teacher Management',
    description: 'Empower teachers with mobile tools for grading, attendance, and parent communication on the go.',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: Users,
    title: 'Parent Engagement',
    description: 'Keep parents informed with real-time updates on their children\'s academic progress and school activities.',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
]

export function UseCasesSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Every School Stakeholder
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tailored experiences for administrators, teachers, and parents
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {useCases.map((useCase) => {
            const IconComponent = useCase.icon
            return (
              <Card key={useCase.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2">
                <CardContent className="p-8">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${useCase.color} mb-6`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
