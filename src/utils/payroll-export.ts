// Susunan sheet Excel "Riwayat Penggajian" (header, baris per gaji, baris total).
import type { PayrollRow } from '@/types/Data'
import { formatWib, formatWorkDate } from './payroll-format'

export const PAYROLL_EXPORT_HEADER = [
  'No',
  'Diproses',
  'Tanggal Kerja',
  'Nama Driver',
  'Kode Kendaraan',
  'Jumlah Order',
  'Gaji Dasar',
  'Potongan',
  'Keterangan Potongan',
  'Bonus',
  'Keterangan Bonus',
  'Gaji Bersih',
  'Diproses Oleh',
  'Diubah Oleh',
  'Status Periode'
]

export const PAYROLL_EXPORT_WIDTHS = [5, 18, 13, 28, 15, 13, 14, 12, 26, 12, 26, 14, 20, 20, 15]

type Cell = string | number

// Angka rupiah tetap angka (bukan teks) agar bisa dijumlah di Excel
export const buildPayrollSheetRows = (rows: PayrollRow[], title: string): Cell[][] => {
  const body = rows.map((row, index) => [
    index + 1,
    formatWib(row.processedAt),
    formatWorkDate(row.workDate),
    row.driverName,
    row.vehicleCode ?? '',
    Number(row.orderCount),
    Number(row.baseAmount),
    Number(row.deductionAmount),
    row.deductionNote ?? '',
    Number(row.bonusAmount),
    row.bonusNote ?? '',
    Number(row.netAmount),
    row.processedBy ?? '',
    row.updatedBy ?? '',
    row.periodStatus === 'OPEN' ? 'Berjalan' : 'Ditutup'
  ])
  const sum = (key: keyof PayrollRow): number => rows.reduce((total, row) => total + Number(row[key] ?? 0), 0)
  const total = [
    'TOTAL', '', '', '', '',
    sum('orderCount'), sum('baseAmount'), sum('deductionAmount'), '',
    sum('bonusAmount'), '', sum('netAmount'), '', '', ''
  ]
  return [[title], [], PAYROLL_EXPORT_HEADER, ...body, total]
}
