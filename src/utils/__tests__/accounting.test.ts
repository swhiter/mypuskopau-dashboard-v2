import { describe, expect, it } from 'vitest'
import {
  UNITS,
  UNIT_LABELS,
  accountDepth,
  accountOptions,
  coaLabel,
  defaultUnitFor,
  displayBalance,
  needsClassification,
  type CoaAccount
} from '../accounting'

const acc = (code: string, type: string, extra: Partial<CoaAccount> = {}): CoaAccount => ({
  code,
  name: `Akun ${code}`,
  type: type as CoaAccount['type'],
  normal: type === 'ASET' || type === 'BEBAN' ? 'D' : 'K',
  parent: null,
  isHeader: false,
  isActive: true,
  cashAccount: null,
  isSystem: false,
  ...extra
})

const accounts = [
  acc('1', 'ASET', { isHeader: true }),
  acc('1-112', 'ASET', { cashAccount: 'KAS_INVESTOR', parent: '1' }),
  acc('1-202', 'ASET', { parent: '1' }),
  acc('2-401', 'KEWAJIBAN'),
  acc('4-201', 'PENDAPATAN'),
  acc('6-105', 'BEBAN'),
  acc('6-150', 'BEBAN', { isActive: false })
]

describe('accounting utils', () => {
  it('names the two business units', () => {
    expect(UNITS).toEqual(['INVESTOR', 'PUSKOPAU'])
    expect(UNIT_LABELS.PUSKOPAU).toBe('Avanza Puskopau')
    expect(defaultUnitFor('KAS_PUSKOPAU')).toBe('PUSKOPAU')
    expect(defaultUnitFor('KAS_BESAR')).toBe('INVESTOR')
  })

  it('needs an account for income and non kas-kecil expenses only', () => {
    expect(needsClassification('INCOME', null)).toBe(true)
    expect(needsClassification('EXPENSE', 'KAS_INVESTOR')).toBe(true)
    expect(needsClassification('EXPENSE', 'KAS_KECIL')).toBe(false)
    expect(needsClassification('TRANSFER', 'KAS_BESAR')).toBe(false)
  })

  it('offers active non-cash detail accounts, the natural type first', () => {
    expect(accountOptions(accounts, 'EXPENSE').map((item) => item.code)).toEqual(['6-105', '1-202', '2-401', '4-201'])
    expect(accountOptions(accounts, 'INCOME').map((item) => item.code)).toEqual(['4-201', '1-202', '2-401', '6-105'])
  })

  it('shows balances on their normal side', () => {
    expect(displayBalance(1500, 'D')).toBe(1500)
    expect(displayBalance(-1500, 'K')).toBe(1500)
    expect(displayBalance(200, 'K')).toBe(-200)
  })

  it('labels and indents accounts', () => {
    expect(coaLabel('6-105', accounts)).toBe('6-105 Akun 6-105')
    expect(coaLabel(null, accounts)).toBe('-')
    expect(coaLabel('9-9', accounts)).toBe('9-9')
    expect(accountDepth(accounts[0], accounts)).toBe(0)
    expect(accountDepth(accounts[1], accounts)).toBe(1)
  })
})
