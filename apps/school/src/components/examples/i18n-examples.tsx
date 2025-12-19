/**
 * i18n Usage Examples
 *
 * This file demonstrates how to use translations in Yeko School.
 * These examples can be used as reference when implementing features.
 */

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

/**
 * Example 1: Basic translation usage
 */
export function BasicTranslationExample() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h1>{t('app.name')}</h1>
      <p>{t('app.tagline')}</p>

      <div className="flex gap-2">
        <Button>{t('common.save')}</Button>
        <Button variant="outline">{t('common.cancel')}</Button>
        <Button variant="destructive">{t('common.delete')}</Button>
      </div>
    </div>
  )
}

/**
 * Example 2: Navigation with translations
 */
export function NavigationExample() {
  const { t } = useTranslation()

  const navItems = [
    { key: 'dashboard', icon: '📊' },
    { key: 'users', icon: '👥' },
    { key: 'students', icon: '🎓' },
    { key: 'teachers', icon: '👨‍🏫' },
    { key: 'finance', icon: '💰' },
  ]

  return (
    <nav className="space-y-2">
      {navItems.map(item => (
        <a
          key={item.key}
          href={`/${item.key}`}
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-accent"
        >
          <span>{item.icon}</span>
          <span>{t(`nav.${item.key}`)}</span>
        </a>
      ))}
    </nav>
  )
}

/**
 * Example 3: Form with translated labels and validation
 */
export function FormExample() {
  const { t } = useTranslation()

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('users.name')}
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder={t('users.name')}
        />
        <p className="text-sm text-destructive mt-1">
          {t('validation.required')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t('users.email')}
        </label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder={t('users.email')}
        />
        <p className="text-sm text-destructive mt-1">
          {t('validation.email')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t('users.phone')}
        </label>
        <input
          type="tel"
          className="w-full border rounded px-3 py-2"
          placeholder={t('users.phone')}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">{t('common.save')}</Button>
        <Button type="button" variant="outline">{t('common.cancel')}</Button>
      </div>
    </form>
  )
}

/**
 * Example 4: Dashboard with translated metrics
 */
export function DashboardExample() {
  const { t } = useTranslation()

  const metrics = [
    { key: 'students', value: 320, icon: '🎓' },
    { key: 'teachers', value: 45, icon: '👨‍🏫' },
    { key: 'classes', value: 18, icon: '🏫' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {t('dashboard.overview')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <div key={metric.key} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <h3 className="font-semibold">
                {t(`dashboard.admin.${metric.key}`)}
              </h3>
            </div>
            <p className="text-3xl font-bold">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">
          {t('dashboard.quickActions')}
        </h3>
        <div className="flex gap-2">
          <Button>{t('dashboard.admin.addUser')}</Button>
          <Button>{t('dashboard.admin.enrollStudent')}</Button>
          <Button>{t('dashboard.admin.createClass')}</Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Example 5: Status badges with translations
 */
export function StatusBadgesExample() {
  const { t } = useTranslation()

  const statuses = ['active', 'inactive', 'pending', 'validated', 'rejected']

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t('common.status')}</h3>
      <div className="flex flex-wrap gap-2">
        {statuses.map(status => (
          <span
            key={status}
            className="px-3 py-1 rounded-full text-sm font-medium bg-accent"
          >
            {t(`common.${status}`)}
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
  const { t } = useTranslation()

  const errors = [
    'generic',
    'notFound',
    'unauthorized',
    'forbidden',
    'serverError',
    'networkError',
  ]

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{t('common.error')}</h3>
      {errors.map(error => (
        <div
          key={error}
          className="p-3 border border-destructive rounded bg-destructive/10"
        >
          <p className="text-sm text-destructive">
            {t(`errors.${error}`)}
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
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <p>{t('validation.minLength', { min: 8 })}</p>
      <p>{t('validation.maxLength', { max: 255 })}</p>
    </div>
  )
}

/**
 * Example 8: Role-based dashboard titles
 */
export function RoleDashboardExample() {
  const { t } = useTranslation()

  const roles = [
    'school_administrator',
    'academic_coordinator',
    'discipline_officer',
    'accountant',
    'cashier',
    'registrar',
  ]

  return (
    <div className="space-y-4">
      {roles.map(role => (
        <div key={role} className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">{t(`roles.${role}`)}</h3>
          <p className="text-sm text-muted-foreground">
            {t(`dashboard.${role.replace('school_', '')}.title`)}
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
  const { t, i18n } = useTranslation()

  const date = new Date()
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)

  return (
    <div>
      <p className="text-sm text-muted-foreground">{t('common.date')}</p>
      <p className="font-semibold">{formattedDate}</p>
    </div>
  )
}

/**
 * Example 10: Conditional rendering based on language
 */
export function LanguageConditionalExample() {
  const { i18n } = useTranslation()

  return (
    <div>
      {i18n.language === 'fr'
        ? (
          <p>Contenu spécifique au français</p>
        )
        : (
          <p>English-specific content</p>
        )}
    </div>
  )
}
