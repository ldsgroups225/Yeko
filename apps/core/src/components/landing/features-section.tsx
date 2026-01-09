import {
  IconAward,
  IconBook,
  IconCalendar,
  IconCurrencyDollar,
  IconHome,
  IconMessage,
  IconSchool,
  IconShield,
  IconTrendingUp,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

const schoolManagementFeatures = [
  {
    icon: IconUsers,
    title: 'Student Management',
    description: 'Complete student lifecycle management from enrollment to graduation. Track attendance, grades, conduct, and academic progress.',
    badge: 'Core',
  },
  {
    icon: IconUserCheck,
    title: 'Teacher & Staff Management',
    description: 'Manage teachers, administrative staff, and homeroom assignments. Track punctuality, performance, and workload distribution.',
    badge: 'HR',
  },
  {
    icon: IconSchool,
    title: 'Academic Tracking',
    description: 'Monitor curriculum progress, track grades, generate report cards, and ensure ministerial program compliance.',
    badge: 'Academics',
  },
  {
    icon: IconTrendingUp,
    title: 'Progress Analytics',
    description: 'Real-time insights on class performance, curriculum coverage, and student achievement patterns.',
    badge: 'Analytics',
  },
  {
    icon: IconCurrencyDollar,
    title: 'Financial Management',
    description: 'Handle tuition payments, school accounting, fee structures, and generate financial reports.',
    badge: 'Finance',
  },
  {
    icon: IconCalendar,
    title: 'Schedule Management',
    description: 'Create and manage class timetables, exam schedules, and school events with automated notifications.',
    badge: 'Planning',
  },
  {
    icon: IconMessage,
    title: 'Parent Communication',
    description: 'Built-in messaging system for parent-teacher communication with translation support.',
    badge: 'Communication',
  },
  {
    icon: IconShield,
    title: 'Secure & Compliant',
    description: 'Role-based access control, data privacy protection, and compliance with educational regulations.',
    badge: 'Security',
  },
]

const userPersonaFeatures = [
  {
    icon: IconHome,
    title: 'For School Administrators',
    description: 'Complete oversight of all school operations. Manage multiple schools, track performance metrics, and ensure regulatory compliance.',
    badge: 'Management',
    highlight: true,
  },
  {
    icon: IconBook,
    title: 'For Teachers',
    description: 'Mobile-optimized interface for grade entry, attendance tracking, session management, and parent communication.',
    badge: 'Teaching',
    highlight: true,
  },
  {
    icon: IconUsers,
    title: 'For Parents',
    description: 'Real-time access to children\'s grades, homework, attendance, and direct communication with teachers.',
    badge: 'Engagement',
    highlight: true,
  },
  {
    icon: IconAward,
    title: 'For Students',
    description: 'Track personal academic progress, view assignments, check schedules, and stay connected with school activities.',
    badge: 'Learning',
    highlight: true,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* User Personas Section */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Every School Stakeholder
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each role gets a tailored experience designed for their specific needs and responsibilities
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
          {userPersonaFeatures.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="default" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* School Management Features Section */}
        <div className="mx-auto max-w-2xl text-center mt-24">
          <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Complete School Management Solution
          </h3>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to run your educational institution efficiently and effectively
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
          {schoolManagementFeatures.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
