// Hutang driver (menu Hutang Driver): form, validasi, dan hitungan cicilan di
// proses gaji. Aturan sama dengan backend (driver-debt.rules.ts, payroll.mapper.ts).

export const DEBT_KINDS = ['CLAIM_LAKA', 'KASBON', 'LAINNYA'] as const
export type DebtKind = (typeof DEBT_KINDS)[number]
export type DebtStatus = 'ACTIVE' | 'PAID' | 'VOID'

export interface DebtForm {
  driverId: number | string
  kind: DebtKind | string
  description: string
  totalAmount: number | string
  installmentAmount: number | string
}

export interface DebtPayload {
  driverId: number
  kind: string
  description: string
  totalAmount: number
  installmentAmount: number
}

const num = (value: unknown): number => Number(value) || 0
const isBlank = (value: unknown): boolean => String(value ?? '').trim() === ''
const isPositiveRupiah = (value: unknown): boolean => {
  const parsed = Number(String(value ?? '').trim())
  return !isBlank(value) && Number.isSafeInteger(parsed) && parsed > 0
}

export const emptyDebtForm = (): DebtForm => ({
  driverId: '',
  kind: 'CLAIM_LAKA',
  description: '',
  totalAmount: '',
  installmentAmount: ''
})

export const buildDebtPayload = (form: DebtForm): DebtPayload => ({
  driverId: num(form.driverId),
  kind: String(form.kind),
  description: form.description.trim(),
  totalAmount: num(form.totalAmount),
  installmentAmount: num(form.installmentAmount)
})

// Key pesan i18n bila tidak valid, null bila valid.
export const validateDebtForm = (form: DebtForm): string | null => {
  if (isBlank(form.driverId)) return 'message.debtDriverRequired'
  if (isBlank(form.description)) return 'message.debtDescriptionRequired'
  if (!isPositiveRupiah(form.totalAmount) || !isPositiveRupiah(form.installmentAmount)) {
    return 'message.debtAmountInvalid'
  }
  if (num(form.installmentAmount) > num(form.totalAmount)) return 'message.debtInstallmentTooHigh'
  return null
}

// Gaji bersih = gaji dasar - potongan + bonus - cicilan hutang
export const payrollNet = (base: unknown, deduction: unknown, bonus: unknown, debt: unknown): number =>
  num(base) - num(deduction) + num(bonus) - num(debt)

// Cicilan maksimal: sisa hutang, dan gaji yang tersisa setelah potongan & bonus
export const maxDebtDeduction = (base: unknown, deduction: unknown, bonus: unknown, remaining: unknown): number =>
  Math.max(0, Math.min(num(remaining), num(base) - num(deduction) + num(bonus)))
