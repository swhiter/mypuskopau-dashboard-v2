import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import id from '@/locales/id.json'

const i18nSetup = createI18n({
  locale: import.meta.env.VITE_APP_I18N_LOCALE,
  fallbackLocale: import.meta.env.VITE_APP_I18N_FALLBACK_LOCALE,
  legacy: false,
  messages: {
    en: en,
    id: id
  }
})

export default i18nSetup
