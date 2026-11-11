import { describe, expect, it } from 'vitest'
import { ACCOUNT_LABELS, CASH_ACCOUNTS, KIND_LABELS, accountLabel, cashDateRange, todayWib } from '../cash-labels'

describe('cash labels', () => {
  it('labels income', () => {
    expect(KIND_LABELS.INCOME).toBe('Pemasukan')
  })

  it('uses the WIB calendar day for today', () => {
    expect(todayWib(new Date('2026-11-10T18:30:00Z'))).toBe('2026-11-11')
    expect(todayWib(new Date('2026-11-10T03:00:00Z'))).toBe('2026-11-10')
  })

  it('limits the transaction date from cash start to today', () => {
    expect(cashDateRange('2026-10-22', new Date('2026-11-10T03:00:00Z'))).toEqual({ min: '2026-10-22', max: '2026-11-10' })
  })

  it('has Kas Vendor between Saldo Cash and Kas Besar', () => {
    expect(CASH_ACCOUNTS.slice(0, 5)).toEqual(['MIDTRANS', 'CASH', 'VENDOR', 'KAS_BESAR', 'KAS_KECIL'])
    expect(accountLabel('VENDOR')).toBe('Kas Vendor')
    expect(KIND_LABELS.ORDER_VENDOR).toBe('Struk Vendor')
  })

  it('has Kas Investor & Kas Puskopau after Kas Kecil', () => {
    expect(CASH_ACCOUNTS.slice(4)).toEqual(['KAS_KECIL', 'KAS_INVESTOR', 'KAS_PUSKOPAU'])
    expect(accountLabel('KAS_INVESTOR')).toBe('Kas Investor')
    expect(accountLabel('KAS_PUSKOPAU')).toBe('Kas Puskopau')
  })

  it('labels every account', () => {
    for (const account of CASH_ACCOUNTS) expect(ACCOUNT_LABELS[account]).toBeTruthy()
  })
})
