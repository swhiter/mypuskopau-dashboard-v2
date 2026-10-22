import { describe, expect, it } from 'vitest'
import { parseRupiahInput } from '../cash-labels'
import { formatRupiah } from '../payroll-format'

describe('parseRupiahInput', () => {
  it('reads Indonesian and plain formats with up to 2 decimals', () => {
    expect(parseRupiahInput('27.834.210,33')).toBe(27834210.33)
    expect(parseRupiahInput('27834210,33')).toBe(27834210.33)
    expect(parseRupiahInput('27834210.33')).toBe(27834210.33)
    expect(parseRupiahInput('Rp 27.834.210')).toBe(27834210)
    expect(parseRupiahInput('1.000')).toBe(1000)
    expect(parseRupiahInput(203770)).toBe(203770)
    expect(parseRupiahInput('0')).toBe(0)
  })

  it('rejects invalid amounts', () => {
    for (const value of ['', '1,555', '-5', 'abc', '1.2.3,4', '12,']) {
      expect(parseRupiahInput(value)).toBeNull()
    }
  })
})

describe('formatRupiah', () => {
  it('shows cents only when present', () => {
    expect(formatRupiah(27834210.33)).toBe('Rp 27.834.210,33')
    expect(formatRupiah(27834210)).toBe('Rp 27.834.210')
    expect(formatRupiah(1510353 + 27834210.33)).toBe('Rp 29.344.563,33')
  })
})
