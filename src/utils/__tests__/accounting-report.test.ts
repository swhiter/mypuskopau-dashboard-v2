import { describe, expect, it } from 'vitest'
import {
  bankSheetsFor,
  journalReady,
  journalUnitDiffs,
  monthLabel,
  monthOptions,
  unitTitle
} from '../accounting-report'

describe('accounting report helpers', () => {
  it('offers months from September 2026 up to this month, newest first', () => {
    expect(monthOptions('2026-11-17')).toEqual(['2026-11', '2026-10', '2026-09'])
    expect(monthOptions('2027-01-02')[0]).toBe('2027-01')
    expect(monthOptions('2027-01-02')).toHaveLength(5)
  })

  it('labels months and units in Indonesian', () => {
    expect(monthLabel('2026-10')).toBe('Oktober 2026')
    expect(unitTitle('PUSKOPAU')).toBe('Avanza Puskopau')
    expect(unitTitle('INVESTOR')).toBe('Avanza Investor')
    expect(unitTitle('')).toBe('Gabungan Puskopau & Investor')
  })

  it('picks the bank sheet of the unit', () => {
    expect(bankSheetsFor('PUSKOPAU').map((bank) => bank.title)).toEqual(['Rek 67'])
    expect(bankSheetsFor('INVESTOR').map((bank) => bank.title)).toEqual(['Rek 87'])
    expect(bankSheetsFor('').map((bank) => bank.title)).toEqual(['Rek 67', 'Rek 87'])
  })

  it('checks a manual journal balances per unit', () => {
    const lines = [
      { coaCode: '6-110', unit: 'PUSKOPAU', debit: '19865312.5', credit: '' },
      { coaCode: '1-512', unit: 'PUSKOPAU', debit: '', credit: 19865312.5 }
    ]
    expect(journalUnitDiffs(lines as any)).toEqual({ PUSKOPAU: 0 })
    expect(journalReady(lines as any)).toBe(true)

    const crossUnit = [
      { coaCode: '6-110', unit: 'PUSKOPAU', debit: 100, credit: 0 },
      { coaCode: '1-512', unit: 'INVESTOR', debit: 0, credit: 100 }
    ]
    expect(journalUnitDiffs(crossUnit)).toEqual({ PUSKOPAU: 100, INVESTOR: -100 })
    expect(journalReady(crossUnit)).toBe(false)
    expect(journalReady([lines[0] as any])).toBe(false)
    expect(journalReady([{ ...lines[0], credit: 1 }, lines[1]] as any)).toBe(false)
    expect(journalReady([{ ...lines[0], coaCode: '' }, lines[1]] as any)).toBe(false)
  })
})
