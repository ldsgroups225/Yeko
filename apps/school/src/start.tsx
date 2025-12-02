import { createStart } from '@tanstack/react-start'
import './i18n/config'

export const startInstance = createStart(() => {
  return {
    defaultSsr: true,
  }
})
