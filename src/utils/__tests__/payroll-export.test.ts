import { describe, expect, it } from 'vitest'
import { buildPayrollSheetRows, PAYROLL_EXPORT_HEADER, PAYROLL_EXPORT_WIDTHS } from '../payroll-export'
import type { PayrollRow } from '@/types/Data'

const row = (over: Partial<PayrollRow>): PayrollRow => ({
  id: 1,
  periodId: 3,
  periodStatus: 'OPEN',
  driverId: 9,
  workDate: '2026-10-26',
  driverName: 'AHMAD YANI',
  vehicleCode: 'PK-01',
  orderCount: 2,
  baseAmount: 100000,
  deductionAmount: 5000,
  deductionNote: 'kasbon',
  bonusAmount: 0,
  bonusNote: null,
  netAmount: 95000,
  processedBy: 'admin',
  processedAt: '2026-10-26T15:00:00.000Z',
  updatedBy: null,
  updatedAt: '2026-10-26T15:00:00.000Z',
  ...over
})

describe('buildPayrollSheetRows', () => {
  it('writes title, header, one line per payroll and a total line', () => {
    const sheet = buildPayrollSheetRows(
      [row({}), row({ id: 2, driverName: 'B', periodStatus: 'CLOSED', baseAmount: 50000, deductionAmount: 0, bonusAmount: 10000, netAmount: 60000, orderCount: 1 })],
      'Riwayat Penggajian'
    )

    expect(sheet[0]).toEqual(['Riwayat Penggajian'])
    expect(sheet[2]).toEqual(PAYROLL_EXPORT_HEADER)
    expect(sheet[3]).toEqual([
      1, '26/10/2026, 22.00', '26/10/2026', 'AHMAD YANI', 'PK-01', 2, 100000, 5000, 'kasbon', 0, '', 95000, 'admin', '', 'Berjalan'
    ])
    expect(sheet[4][14]).toBe('Ditutup')
    expect(sheet[5]).toEqual(['TOTAL', '', '', '', '', 3, 150000, 5000, '', 10000, '', 155000, '', '', ''])
  })

  it('keeps every line as wide as the header', () => {
    const sheet = buildPayrollSheetRows([row({})], 'x')
    expect(PAYROLL_EXPORT_WIDTHS).toHaveLength(PAYROLL_EXPORT_HEADER.length)
    sheet.slice(2).forEach((line) => expect(line).toHaveLength(PAYROLL_EXPORT_HEADER.length))
  })
})
