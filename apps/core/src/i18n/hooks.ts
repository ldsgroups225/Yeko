import { useI18nContext } from './i18n-react'

export const useTranslations = () => {
  const { LL } = useI18nContext()
  return LL
}
