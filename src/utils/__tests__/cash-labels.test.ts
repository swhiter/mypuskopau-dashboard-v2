import { describe, expect, it } from 'vitest'
import { ACCOUNT_LABELS, CASH_ACCOUNTS, KIND_LABELS, accountLabel } from '../cash-labels'

describe('cash labels', () => {
  it('has Kas Vendor between Saldo Cash and Kas Besar', () => {
    expect(CASH_ACCOUNTS).toEqual(['MIDTRANS', 'CASH', 'VENDOR', 'KAS_BESAR', 'KAS_KECIL'])
    expect(accountLabel('VENDOR')).toBe('Kas Vendor')
    expect(KIND_LABELS.ORDER_VENDOR).toBe('Struk Vendor')
  })

  it('labels every account', () => {
    for (const account of CASH_ACCOUNTS) expect(ACCOUNT_LABELS[account]).toBeTruthy()
  })
})
