import { all } from '@vee-validate/rules'
import { localize, setLocale } from '@vee-validate/i18n'
import { configure, defineRule } from 'vee-validate'
import en from '@/locales/en.json'
import id from '@/locales/id.json'
import { parseRupiahInput } from '@/utils/cash-labels'
import i18nSetup from '@/locales/i18n'

Object.entries(all).forEach(([name, rule]) => {
  defineRule(name, rule)
})

// Nominal rupiah (boleh 2 desimal) minimal params[0]
defineRule('rupiah', (value: unknown, params: unknown[] = []) => {
  if (value === null || value === undefined || value === '') return true
  const parsed = parseRupiahInput(value)
  return parsed !== null && parsed >= Number(params[0] ?? 0)
})

configure({
  generateMessage: localize({ en, id })
})

setLocale(i18nSetup.global.locale.value)
