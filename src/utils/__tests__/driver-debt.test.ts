import { describe, expect, it } from 'vitest'
import {
  DEBT_KINDS,
  buildDebtPayload,
  emptyDebtForm,
  maxDebtDeduction,
  payrollNet,
  validateDebtForm
} from '../driver-debt'

describe('driver debt form', () => {
  const form = { ...emptyDebtForm(), driverId: '336', kind: 'CLAIM_LAKA', description: ' Sisa klaim laka ', totalAmount: '130000', installmentAmount: '30000' }

  it('offers the three debt kinds', () => {
    expect(DEBT_KINDS).toEqual(['CLAIM_LAKA', 'KASBON', 'LAINNYA'])
    expect(emptyDebtForm().kind).toBe('CLAIM_LAKA')
  })

  it('builds the API payload with numbers and a trimmed description', () => {
    expect(buildDebtPayload(form)).toEqual({
      driverId: 336,
      kind: 'CLAIM_LAKA',
      description: 'Sisa klaim laka',
      totalAmount: 130000,
      installmentAmount: 30000
    })
  })

  it('validates required fields and installment within the total', () => {
    expect(validateDebtForm(form)).toBeNull()
    expect(validateDebtForm({ ...form, driverId: '' })).toBe('message.debtDriverRequired')
    expect(validateDebtForm({ ...form, description: ' ' })).toBe('message.debtDescriptionRequired')
    expect(validateDebtForm({ ...form, totalAmount: '0' })).toBe('message.debtAmountInvalid')
    expect(validateDebtForm({ ...form, installmentAmount: '0' })).toBe('message.debtAmountInvalid')
    expect(validateDebtForm({ ...form, installmentAmount: '1.5' })).toBe('message.debtAmountInvalid')
    expect(validateDebtForm({ ...form, installmentAmount: '200000' })).toBe('message.debtInstallmentTooHigh')
  })
})

describe('payroll with debt installment', () => {
  it('net pay = base - deduction + bonus - installment', () => {
    expect(payrollNet(200000, 6500, 10000, 30000)).toBe(173500)
    expect(payrollNet(200000, '', '', '')).toBe(200000)
  })

  it('caps the installment by the remaining debt and the pay left', () => {
    expect(maxDebtDeduction(200000, 6500, 0, 130000)).toBe(130000)
    expect(maxDebtDeduction(100000, 6500, 0, 130000)).toBe(93500)
    expect(maxDebtDeduction(10000, 50000, 0, 130000)).toBe(0)
  })
})
