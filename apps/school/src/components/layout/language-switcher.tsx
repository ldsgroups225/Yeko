import type { Locales } from '@/i18n/i18n-types'

import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    setLocale(lng)
  }

  const currentLanguage = locale

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={t.language.switchLanguage()}>
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t.language.switchLanguage()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage('fr')}
          className={currentLanguage === 'fr' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇫🇷</span>
          {t.language.french()}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={currentLanguage === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇬🇧</span>
          {t.language.english()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
