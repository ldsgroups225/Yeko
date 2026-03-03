import type { Locales } from '@/i18n/i18n-types'

import { IconLanguage } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useTranslations } from '@/i18n'
import { useI18nContext } from '@/i18n/i18n-react'

/**
 * Language switcher component
 * Allows users to switch between French and English
 */
export function LanguageSwitcher() {
  const t = useTranslations()
  const { locale, setLocale } = useI18nContext()

  const changeLanguage = (lng: Locales) => {
    void setLocale(lng)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <Button
            variant="ghost"
            size="icon"
            title={t.language.switchLanguage()}
          >
            <IconLanguage className="h-5 w-5" />
            <span className="sr-only">{t.language.switchLanguage()}</span>
          </Button>
        )}
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => changeLanguage('fr')}
          className={locale === 'fr' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇫🇷</span>
          {t.language.french()}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => changeLanguage('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇬🇧</span>
          {t.language.english()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
