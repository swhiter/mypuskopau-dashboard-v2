import { describe, expect, it } from 'vitest'
import { ACCOUNT_LABELS, CASH_ACCOUNTS, KIND_LABELS, accountLabel } from '../cash-labels'

describe('cash labels', () => {
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
