import i18nSetup from '@/locales/i18n'
import { setLocale } from '@vee-validate/i18n'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  const lang = ref<string | null>(null)

  function switchLanguage(language: string): void {
    lang.value = language
    i18nSetup.global.locale.value = lang.value as 'id' | 'en'
    setLocale(lang.value)
  }

  return { lang, switchLanguage }
})
