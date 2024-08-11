import { all } from '@vee-validate/rules'
import { localize, setLocale } from '@vee-validate/i18n'
import { configure, defineRule } from 'vee-validate'
import en from '@/locales/en.json'
import id from '@/locales/id.json'
import i18nSetup from '@/locales/i18n'

Object.entries(all).forEach(([name, rule]) => {
  defineRule(name, rule)
})

configure({
  generateMessage: localize({ en, id })
})

setLocale(i18nSetup.global.locale.value)
