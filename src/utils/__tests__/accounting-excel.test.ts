import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { buildReportWorkbook, reportFileName } from '../accounting-excel'
import type { FinancialReport, Journal, Ledger } from '@/services/accounting/accounting.api'

const report: FinancialReport = {
  month: '2026-10',
  from: '2026-10-01',
  to: '2026-10-31',
  yearFrom: '2026-01-01',
  unit: 'PUSKOPAU',
  trialBalance: {
    rows: [
      { code: '1-111', name: 'Bank Mandiri Rek 67', type: 'ASET', opening: 450964029.19, debit: 90726944.04, credit: 20067944.41, closing: 521623028.82 },
      { code: '4-101', name: 'Pendapatan Operasional Taksi', type: 'PENDAPATAN', opening: -790368004.8, debit: 0, credit: 75519000, closing: -865887004.8 }
    ],
    totals: { debit: 90726944.04, credit: 95586944.41, balanced: false, closingBalanced: false }
  },
  income: {
    sections: [
      { key: 'REVENUE', title: 'Pendapatan Usaha', rows: [{ code: '4-101', name: 'Pendapatan Operasional Taksi', month: 75519000, ytd: 865887004.8 }], month: 75519000, ytd: 865887004.8 },
      { key: 'EXPENSE', title: 'Beban Administrasi dan Umum', rows: [{ code: '6-108', name: 'Beban Pemeliharaan', month: 20000000, ytd: 40425000 }], month: 45481204.08, ytd: 559606040.83 },
      { key: 'OTHER_INCOME', title: 'Pendapatan Lain-lain', rows: [], month: 222222.04, ytd: 2091717.4 },
      { key: 'OTHER_EXPENSE', title: 'Beban Lain-lain', rows: [], month: 67944.41, ytd: 661742.47 }
    ],
    profit: { month: 30192073.55, ytd: 307710938.9 }
  },
  balance: {
    assets: { groups: [{ code: '1-10', name: 'Kas & Bank', rows: [{ code: '1-111', name: 'Bank Mandiri Rek 67', amount: 521623028.82 }], total: 521623028.82 }], total: 2876074247.89 },
    liabilities: { groups: [{ code: '2-30', name: 'Hutang Jangka Panjang', rows: [{ code: '2-401', name: 'Hutang Investor', amount: 1253322431.48 }], total: 1253322431.48 }], total: 1253322431.48 },
    equity: { rows: [{ code: '3-101', name: 'Modal Disetor', amount: 115000000 }, { code: null, name: 'Laba (Rugi) Tahun Berjalan', amount: 307710938.9 }], total: 1622751816.41 },
    totalLiabilitiesEquity: 2876074247.89,
    balanced: true
  },
  cashFlow: {
    accounts: [{ code: '1-111', name: 'Bank Mandiri Rek 67', opening: 450964029.19, closing: 521623028.82 }],
    opening: 450964029.19,
    inflows: [{ category: '1-290', name: 'Rekening Antar Unit', amount: 90504722 }],
    outflows: [{ category: '6-108', name: 'Beban Pemeliharaan', amount: 20000000 }],
    totalIn: 90726944.04,
    totalOut: 20067944.41,
    closing: 521623028.82
  },
  bankCheck: []
}

const ledgers: Ledger[] = [
  {
    account: { code: '1-111', name: 'Bank Mandiri Rek 67', normal: 'D' },
    from: '2026-10-01',
    to: '2026-10-31',
    unit: 'PUSKOPAU',
    opening: 450964029.19,
    rows: [{ entry_date: '2026-10-05', source: 'JOURNAL', source_id: 12, memo: 'Monthly Card Charge', debit: 0, credit: 10500, lines: 1, balance: 450953529.19 }],
    closing: 450953529.19
  }
]

const journals: Journal[] = [
  {
    id: 25,
    journalDate: '2026-10-31',
    type: 'RIWAYAT',
    description: 'Penyusutan aset tetap Oktober 2026',
    status: 'ACTIVE',
    voidReason: null,
    createdBy: 'IMPORT-EXCEL',
    createdAt: '2026-11-17T12:00:00Z',
    lines: [
      { lineNo: 1, coaCode: '6-110', coaName: 'Beban Penyusutan Kendaraan', unit: 'PUSKOPAU', debit: 19865312.5, credit: 0, memo: null },
      { lineNo: 2, coaCode: '1-512', coaName: 'Akum. Penyusutan Kendaraan', unit: 'PUSKOPAU', debit: 0, credit: 19865312.5, memo: null }
    ]
  }
]

const build = () =>
  buildReportWorkbook({
    report,
    ledgers,
    journals,
    signers: { bendahara: 'Nama Bendahara', kaunit: 'Nama Kaunit' },
    printedAt: '2026-11-17'
  })

const findText = (sheet: ExcelJS.Worksheet, text: string): ExcelJS.Cell | null => {
  let found: ExcelJS.Cell | null = null
  sheet.eachRow((row) =>
    row.eachCell((cell) => {
      if (!found && String(cell.value ?? '').includes(text)) found = cell
    })
  )
  return found
}

describe('accounting Excel report', () => {
  it('has one sheet per report plus the bank, journal and ledger sheets of the unit', () => {
    const wb = build()
    expect(wb.worksheets.map((sheet) => sheet.name)).toEqual([
      'Neraca Saldo',
      'Laba Rugi',
      'Neraca',
      'Arus Kas',
      'Rek 67',
      'Jurnal Umum',
      'Buku Besar'
    ])
  })

  it('puts the letterhead, unit and period on every report sheet', () => {
    const wb = build()
    for (const name of ['Neraca Saldo', 'Laba Rugi', 'Neraca', 'Arus Kas']) {
      const sheet = wb.getWorksheet(name)!
      expect(sheet.getCell('A1').value).toBe('PUSAT KOPERASI ANGKATAN UDARA')
      expect(String(sheet.getCell('A3').value)).toContain('AVANZA PUSKOPAU')
      expect(String(sheet.getCell('A4').value)).toContain('OKTOBER 2026')
      expect(findText(sheet, 'Nama Bendahara')).not.toBeNull()
      expect(findText(sheet, 'Nama Kaunit')).not.toBeNull()
    }
  })

  it('shows month and year-to-date profit with rupiah number format', () => {
    const sheet = build().getWorksheet('Laba Rugi')!
    const label = findText(sheet, 'LABA (RUGI) BERSIH')!
    const row = sheet.getRow(Number(label.row))
    const values = (row.values as unknown[]).filter((value) => typeof value === 'number')
    expect(values).toEqual([30192073.55, 307710938.9])
    const numberCell = row.getCell(4)
    expect(numberCell.numFmt).toContain('#,##0.00')
    expect(numberCell.font?.bold).toBe(true)
  })

  it('marks a balanced balance sheet and keeps receivables in assets', () => {
    const sheet = build().getWorksheet('Neraca')!
    expect(findText(sheet, 'BALANCE')).not.toBeNull()
    expect(findText(sheet, 'TOTAL ASET')).not.toBeNull()
    expect(findText(sheet, 'Laba (Rugi) Tahun Berjalan')).not.toBeNull()
  })

  it('lists bank lines like a bank statement and journals with their lines', () => {
    const wb = build()
    expect(findText(wb.getWorksheet('Rek 67')!, 'Monthly Card Charge')).not.toBeNull()
    expect(findText(wb.getWorksheet('Rek 67')!, 'Saldo Awal')).not.toBeNull()
    const journal = wb.getWorksheet('Jurnal Umum')!
    expect(findText(journal, 'Penyusutan aset tetap Oktober 2026')).not.toBeNull()
    expect(findText(journal, '1-512 Akum. Penyusutan Kendaraan')).not.toBeNull()
    expect(findText(wb.getWorksheet('Buku Besar')!, '1-111 Bank Mandiri Rek 67')).not.toBeNull()
  })

  it('writes a valid xlsx file', async () => {
    const buffer = await build().xlsx.writeBuffer()
    const back = new ExcelJS.Workbook()
    await back.xlsx.load(buffer as ArrayBuffer)
    expect(back.worksheets).toHaveLength(7)
  })

  it('names the file after unit and month', () => {
    expect(reportFileName('PUSKOPAU', '2026-10')).toBe('GL Avanza Puskopau Oktober 2026.xlsx')
    expect(reportFileName('', '2026-10')).toBe('GL Gabungan Puskopau & Investor Oktober 2026.xlsx')
  })
})
