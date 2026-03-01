import type { Locales } from '@/i18n/i18n-types'
import { buttonVariants } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useI18nContext } from '@/i18n/i18n-react'

const languages: { code: Locales, name: string, flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18nContext()

  const currentLanguage
    = languages.find(lang => lang.code === locale) ?? languages[0]

  const changeLanguage = (langCode: Locales) => {
    setLocale(langCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <button
            type="button"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            <span className="
              hidden
              sm:inline
            "
            >
              {currentLanguage?.flag}
              {' '}
              {currentLanguage?.name}
            </span>
            <span className="sm:hidden">{currentLanguage?.flag}</span>
          </button>
        )}
      />
      <DropdownMenuContent align="end">
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={locale === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
