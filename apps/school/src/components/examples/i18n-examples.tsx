import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { useTranslations } from '@/i18n'
import { useI18nContext } from '@/i18n/i18n-react'

type RouteId = LinkProps['to']

/**
 * Example 1: Basic translation usage
 */
export function BasicTranslationExample() {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      <h1>{t.app.name()}</h1>
      <p>{t.app.tagline()}</p>

      <div className="flex gap-2">
        <Button>{t.common.save()}</Button>
        <Button variant="outline">{t.common.cancel()}</Button>
        <Button variant="destructive">{t.common.delete()}</Button>
      </div>
    </div>
  )
}

/**
 * Example 2: Navigation with translations
 */
export function NavigationExample() {
  const t = useTranslations()

  const navItems: { key: RouteId, icon: string }[] = [
    { key: '/dashboard', icon: '📊' },
    { key: '/users', icon: '👥' },
    { key: '/students', icon: '🎓' },
    { key: '/teachers', icon: '👨‍🏫' },
    { key: '/accounting', icon: '💰' },
  ]

  const navTranslations = {
    dashboard: t.nav.dashboard,
    users: t.nav.users,
    students: t.nav.students,
    teachers: t.nav.teachers,
    finance: t.nav.finance,
  }

  return (
    <nav className="space-y-2">
      {navItems.map(item => (
        <Link
          key={item.key}
          to={item.key}
          className="
            hover:bg-accent
            flex items-center gap-2 rounded-sm px-4 py-2
          "
        >
          <span>{item.icon}</span>
          <span>
            {navTranslations[item.key as keyof typeof navTranslations]()}
          </span>
        </Link>
      ))}
    </nav>
  )
}

/**
 * Example 3: Form with translated labels and validation
 */
export function FormExample() {
  const t = useTranslations()

  return (
    <form className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t.users.name()}
        </label>
        <input
          type="text"
          className="w-full rounded-sm border px-3 py-2"
          placeholder={t.users.name()}
        />
        <p className="text-destructive mt-1 text-sm">
          {t.validation.required()}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t.users.email()}
        </label>
        <input
          type="email"
          className="w-full rounded-sm border px-3 py-2"
          placeholder={t.users.email()}
        />
        <p className="text-destructive mt-1 text-sm">
          {t.validation.email()}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t.users.phone()}
        </label>
        <input
          type="tel"
          className="w-full rounded-sm border px-3 py-2"
          placeholder={t.users.phone()}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">{t.common.save()}</Button>
        <Button type="button" variant="outline">{t.common.cancel()}</Button>
      </div>
    </form>
  )
}

/**
 * Example 4: Dashboard with translated metrics
 */
export function DashboardExample() {
  const t = useTranslations()

  const metrics = [
    { key: 'totalStudents', value: 320, icon: '🎓' },
    { key: 'totalTeachers', value: 45, icon: '👨‍🏫' },
    { key: 'totalClasses', value: 18, icon: '🏫' },
  ]

  const metricTranslations = {
    totalStudents: t.dashboard.admin.totalStudents,
    totalTeachers: t.dashboard.admin.totalTeachers,
    totalClasses: t.dashboard.admin.totalClasses,
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">
        {t.dashboard.overview()}
      </h2>

      <div className="
        grid grid-cols-1 gap-4
        md:grid-cols-3
      "
      >
        {metrics.map(metric => (
          <div key={metric.key} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{metric.icon}</span>
              <h3 className="font-semibold">
                {metricTranslations[metric.key as keyof typeof metricTranslations]()}
              </h3>
            </div>
            <p className="text-3xl font-bold">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-lg font-semibold">
          {t.dashboard.quickActions()}
        </h3>
        <div className="flex gap-2">
          <Button>{t.dashboard.addUser()}</Button>
          <Button>{t.dashboard.enrollStudent()}</Button>
          <Button>{t.dashboard.createClass()}</Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Example 5: Status badges with translations
 */
export function StatusBadgesExample() {
  const t = useTranslations()

  const statuses = ['active', 'inactive', 'pending', 'validated', 'rejected']

  const statusTranslations = {
    active: t.common.active,
    inactive: t.common.inactive,
    pending: t.common.pending,
    validated: t.common.validated,
    rejected: t.common.rejected,
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t.common.status()}</h3>
      <div className="flex flex-wrap gap-2">
        {statuses.map(status => (
          <span
            key={status}
            className="bg-accent rounded-full px-3 py-1 text-sm font-medium"
          >
            {statusTranslations[status as keyof typeof statusTranslations]()}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Example 6: Error messages with translations
 */
export function ErrorMessagesExample() {
  const t = useTranslations()

  const errors = [
    'generic',
    'notFound',
    'unauthorized',
    'forbidden',
    'serverError',
    'networkError',
  ]

  const errorTranslations = {
    generic: t.errors.generic,
    notFound: t.errors.notFound,
    unauthorized: t.errors.unauthorized,
    forbidden: t.errors.forbidden,
    serverError: t.errors.serverError,
    networkError: t.errors.networkError,
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{t.common.error()}</h3>
      {errors.map(error => (
        <div
          key={error}
          className="border-destructive bg-destructive/10 rounded-sm border p-3"
        >
          <p className="text-destructive text-sm">
            {errorTranslations[error as keyof typeof errorTranslations]()}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * Example 7: Interpolation with variables
 */
export function InterpolationExample() {
  const t = useTranslations()

  return (
    <div className="space-y-2">
      <p>{t.validation.minLength({ min: 8 })}</p>
      <p>{t.validation.maxLength({ max: 255 })}</p>
    </div>
  )
}

/**
 * Example 8: Role-based dashboard titles
 */
export function RoleDashboardExample() {
  const t = useTranslations()

  const roles = [
    'school_director',
    'academic_coordinator',
    'discipline_officer',
    'accountant',
    'cashier',
    'registrar',
  ]

  const roleDescriptionTranslations = {
    school_director: t.roles.descriptions.school_director,
    academic_coordinator: t.roles.descriptions.academic_coordinator,
    discipline_officer: t.roles.descriptions.discipline_officer,
    accountant: t.roles.descriptions.accountant,
    cashier: t.roles.descriptions.cashier,
    registrar: t.roles.descriptions.registrar,
  }

  const dashboardTitleTranslations = {
    school_director: t.dashboard.admin.title,
    academic_coordinator: t.dashboard.coordinator.title,
    discipline_officer: t.dashboard.description, // No specific title
    accountant: t.dashboard.accountant.title,
    cashier: t.dashboard.cashier.title,
    registrar: t.dashboard.registrar.title,
  }

  return (
    <div className="space-y-4">
      {roles.map(role => (
        <div key={role} className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">
            {roleDescriptionTranslations[
              role as keyof typeof roleDescriptionTranslations
            ]()}
          </h3>
          <p className="text-muted-foreground text-sm">
            {dashboardTitleTranslations[
              role as keyof typeof dashboardTitleTranslations
            ]()}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * Example 9: Language-aware date formatting
 */
export function DateFormattingExample() {
  const t = useTranslations()
  const { locale } = useI18nContext()

  const date = new Date()
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)

  return (
    <div>
      <p className="text-muted-foreground text-sm">{t.common.date()}</p>
      <p className="font-semibold">{formattedDate}</p>
    </div>
  )
}

/**
 * Example 10: Conditional rendering based on language
 */
export function LanguageConditionalExample() {
  const { locale } = useI18nContext()

  return (
    <div>
      {locale === 'fr'
        ? (
            <p>Contenu spécifique au français</p>
          )
        : (
            <p>English-specific content</p>
          )}
    </div>
  )
}
