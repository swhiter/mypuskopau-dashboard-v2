import { describe, expect, it } from 'vitest'
import { receiptFileName, receiptStatusLabel, receiptSearchParams } from '../receipt-download'

describe('receipt download helpers', () => {
  it('names the file after the transaction number', () => {
    expect(receiptFileName('202610171234')).toBe('struk-202610171234.pdf')
  })

  it('explains why a receipt cannot be downloaded', () => {
    expect(receiptStatusLabel({ status: 2, statusOrder: 'FINISHED', downloadable: true })).toBe('Lunas')
    expect(receiptStatusLabel({ status: 1, statusOrder: 'FINISHED', downloadable: false })).toBe('Belum lunas')
    expect(receiptStatusLabel({ status: 2, statusOrder: 'CANCELLED', downloadable: false })).toBe('Batal')
    expect(receiptStatusLabel({ status: 0, statusOrder: 'ON_PROGRESS', downloadable: false })).toBe('Belum selesai')
  })

  it('searches by transaction number alone, otherwise by dates and driver', () => {
    expect(receiptSearchParams({ transactionNumber: ' 2026 ', from: '2026-11-01', to: '2026-11-02', driver: 'x' })).toEqual({
      transactionNumber: '2026'
    })
    expect(receiptSearchParams({ transactionNumber: '', from: '2026-11-01', to: '2026-11-02', driver: ' Sugeng ' })).toEqual({
      from: '2026-11-01',
      to: '2026-11-02',
      driver: 'Sugeng'
    })
    expect(receiptSearchParams({ transactionNumber: '', from: '2026-11-01', to: '2026-11-01', driver: '' })).toEqual({
      from: '2026-11-01',
      to: '2026-11-01'
    })
  })
})
