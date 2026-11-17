// Ekspor Excel laporan GL bulanan (per unit atau gabungan) dengan format rapi:
// kop, periode, angka rupiah, subtotal tebal, penanda balance, tanda tangan.
// Isi mengikuti sheet Excel bendahara (Neraca Saldo, Laba Rugi bulan & s/d, Neraca,
// Arus Kas, Rekening bank, Jurnal Umum, Buku Besar).
import ExcelJS from 'exceljs'
import type { FinancialReport, Journal, Ledger, LedgerRow } from '@/services/accounting/accounting.api'
import type { BusinessUnit } from './accounting'
import { JOURNAL_TYPE_LABELS, bankSheetsFor, monthLabel, unitTitle, type Signers } from './accounting-report'

export interface ReportWorkbookInput {
  report: FinancialReport
  ledgers: Ledger[]
  journals: Journal[]
  signers: Signers
  printedAt: string // YYYY-MM-DD
}

const RP = '#,##0.00;(#,##0.00);"-"'
const HEAD_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } }
const GROUP_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
const THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  bottom: { style: 'thin' },
  left: { style: 'thin' },
  right: { style: 'thin' }
}

const NORMAL_DEBIT = ['ASET', 'BEBAN']
const shown = (signed: number, type: string): number => (NORMAL_DEBIT.includes(type) ? signed : -signed)

const dmy = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}
const longDate = (value: string): string => {
  const [year, month, day] = value.split('-')
  return `${Number(day)} ${monthLabel(`${year}-${month}`)}`
}

export const reportFileName = (unit: BusinessUnit | null | '', month: string): string =>
  `GL ${unitTitle(unit)} ${monthLabel(month)}.xlsx`

class SheetWriter {
  row = 1
  constructor(
    public sheet: ExcelJS.Worksheet,
    public lastCol: number
  ) {}

  letterhead(title: string, unit: BusinessUnit | null, period: string): void {
    const lines = [
      'PUSAT KOPERASI ANGKATAN UDARA',
      'HALIM PERDANA KUSUMA',
      `${title} UNIT TAKSI ${unitTitle(unit).toUpperCase()}`,
      `PERIODE : ${period.toUpperCase()}`,
      '(Dalam Rupiah)'
    ]
    lines.forEach((text, index) => {
      this.sheet.mergeCells(this.row, 1, this.row, this.lastCol)
      const cell = this.sheet.getCell(this.row, 1)
      cell.value = text
      cell.alignment = { horizontal: 'center' }
      cell.font = { bold: index < 4, size: index === 2 ? 13 : 11, italic: index === 4 }
      this.row += 1
    })
    this.row += 1
  }

  header(titles: string[]): void {
    const row = this.sheet.getRow(this.row)
    titles.forEach((title, index) => {
      const cell = row.getCell(index + 1)
      cell.value = title
      cell.font = { bold: true }
      cell.fill = HEAD_FILL
      cell.border = THIN
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    })
    this.row += 1
  }

  /** Tulis satu baris; angka diberi format rupiah. */
  line(values: (string | number | null)[], opts: { bold?: boolean; fill?: ExcelJS.Fill; border?: boolean; indent?: number } = {}) {
    const row = this.sheet.getRow(this.row)
    values.forEach((value, index) => {
      if (value === null || value === undefined) return
      const cell = row.getCell(index + 1)
      cell.value = value
      if (typeof value === 'number') {
        cell.numFmt = RP
        cell.alignment = { horizontal: 'right' }
      } else if (opts.indent && index === 1) {
        cell.alignment = { indent: opts.indent }
      }
      if (opts.bold) cell.font = { bold: true }
    })
    if (opts.fill || opts.border) {
      for (let col = 1; col <= this.lastCol; col += 1) {
        const cell = row.getCell(col)
        if (opts.fill) cell.fill = opts.fill
        if (opts.border) cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } }
      }
    }
    this.row += 1
    return row
  }

  blank(count = 1): void {
    this.row += count
  }

  signatures(signers: Signers, printedAt: string): void {
    this.row += 2
    const right = Math.max(this.lastCol - 1, 3)
    this.sheet.getCell(this.row, right).value = `Jakarta, ${longDate(printedAt)}`
    this.row += 1
    this.sheet.getCell(this.row, 2).value = 'Bendahara Unit Taksi Puskopau'
    this.sheet.getCell(this.row, right).value = 'Kaunit Taksi Puskopau'
    this.row += 4
    for (const [col, name] of [
      [2, signers.bendahara],
      [right, signers.kaunit]
    ] as [number, string][]) {
      const cell = this.sheet.getCell(this.row, col)
      cell.value = name || '(..............................)'
      cell.font = { bold: true, underline: true }
    }
    this.row += 1
  }
}

const newSheet = (wb: ExcelJS.Workbook, name: string, widths: number[]) => {
  const sheet = wb.addWorksheet(name, {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  })
  sheet.columns = widths.map((width) => ({ width }))
  return new SheetWriter(sheet, widths.length)
}

function trialBalanceSheet(wb: ExcelJS.Workbook, input: ReportWorkbookInput, period: string) {
  const { report } = input
  const w = newSheet(wb, 'Neraca Saldo', [10, 42, 18, 18, 18, 18])
  w.letterhead('NERACA SALDO', report.unit, period)
  w.header(['Kode', 'Nama Akun', 'Saldo Awal', 'Debit', 'Kredit', 'Saldo Akhir'])
  w.sheet.views = [{ state: 'frozen', ySplit: w.row - 1 }]
  const groups: [string, string][] = [
    ['ASET', 'ASET'],
    ['KEWAJIBAN', 'KEWAJIBAN'],
    ['EKUITAS', 'EKUITAS'],
    ['PENDAPATAN', 'PENDAPATAN'],
    ['BEBAN', 'BEBAN']
  ]
  for (const [type, title] of groups) {
    const rows = report.trialBalance.rows.filter((row) => row.type === type)
    if (!rows.length) continue
    w.line([title], { bold: true, fill: GROUP_FILL })
    for (const row of rows) {
      w.line([row.code, row.name, shown(row.opening, type), row.debit, row.credit, shown(row.closing, type)])
    }
  }
  w.line(['', 'JUMLAH MUTASI', null, report.trialBalance.totals.debit, report.trialBalance.totals.credit, null], {
    bold: true,
    border: true
  })
  w.line(['', report.trialBalance.totals.balanced ? 'BALANCE ✓' : 'TIDAK BALANCE'], { bold: true })
  w.signatures(input.signers, input.printedAt)
}

function incomeSheet(wb: ExcelJS.Workbook, input: ReportWorkbookInput, period: string) {
  const { report } = input
  const w = newSheet(wb, 'Laba Rugi', [10, 40, 4, 20, 20])
  w.letterhead('LAPORAN LABA RUGI', report.unit, period)
  w.header(['Kode', 'Keterangan', '', monthLabel(report.month).toUpperCase(), `S/D ${monthLabel(report.month).toUpperCase()}`])
  for (const section of report.income.sections) {
    w.line(['', section.title.toUpperCase()], { bold: true, fill: GROUP_FILL })
    for (const row of section.rows) {
      w.line([row.code, row.name, null, row.month, row.ytd], { indent: 1 })
    }
    w.line(['', `Jumlah ${section.title}`, null, section.month, section.ytd], { bold: true })
    w.blank()
  }
  const by = (key: string) => report.income.sections.find((section) => section.key === key)!
  const operating = {
    month: by('REVENUE').month - by('EXPENSE').month,
    ytd: by('REVENUE').ytd - by('EXPENSE').ytd
  }
  w.line(['', 'LABA (RUGI) USAHA', null, Math.round(operating.month * 100) / 100, Math.round(operating.ytd * 100) / 100], {
    bold: true
  })
  w.line(['', 'LABA (RUGI) BERSIH', null, report.income.profit.month, report.income.profit.ytd], { bold: true, border: true })
  w.signatures(input.signers, input.printedAt)
}

function balanceSheet(wb: ExcelJS.Workbook, input: ReportWorkbookInput, period: string) {
  const { report } = input
  const { balance } = report
  const w = newSheet(wb, 'Neraca', [10, 46, 4, 22])
  w.letterhead('NERACA', report.unit, `PER ${report.to.slice(8)} ${period}`)
  w.header(['Kode', 'Keterangan', '', 'Jumlah'])
  const groups = (title: string, part: { groups: typeof balance.assets.groups; total: number }, totalTitle: string) => {
    w.line(['', title], { bold: true, fill: GROUP_FILL })
    for (const group of part.groups) {
      w.line(['', group.name], { bold: true })
      for (const row of group.rows) w.line([row.code, row.name, null, row.amount], { indent: 1 })
      w.line(['', `Jumlah ${group.name}`, null, group.total], { bold: true })
    }
    w.line(['', totalTitle, null, part.total], { bold: true, border: true })
    w.blank()
  }
  groups('ASET', balance.assets, 'TOTAL ASET')
  groups('KEWAJIBAN', balance.liabilities, 'TOTAL KEWAJIBAN')
  w.line(['', 'EKUITAS'], { bold: true, fill: GROUP_FILL })
  for (const row of balance.equity.rows) w.line([row.code ?? '', row.name, null, row.amount], { indent: 1 })
  w.line(['', 'TOTAL EKUITAS', null, balance.equity.total], { bold: true })
  w.blank()
  w.line(['', 'TOTAL KEWAJIBAN DAN EKUITAS', null, balance.totalLiabilitiesEquity], { bold: true, border: true })
  const diff = Math.round((balance.assets.total - balance.totalLiabilitiesEquity) * 100) / 100
  w.line(['', balance.balanced ? 'BALANCE ✓' : `TIDAK BALANCE (selisih ${diff})`], { bold: true })
  w.signatures(input.signers, input.printedAt)
}

function cashFlowSheet(wb: ExcelJS.Workbook, input: ReportWorkbookInput, period: string) {
  const { report } = input
  const flow = report.cashFlow
  const w = newSheet(wb, 'Arus Kas', [10, 46, 4, 22])
  w.letterhead('LAPORAN ARUS KAS', report.unit, period)
  w.header(['Kode', 'Keterangan', '', 'Jumlah'])
  w.line(['', 'SALDO AWAL KAS DAN BANK'], { bold: true, fill: GROUP_FILL })
  for (const account of flow.accounts) w.line([account.code, account.name, null, account.opening], { indent: 1 })
  w.line(['', 'Jumlah saldo awal', null, flow.opening], { bold: true })
  w.blank()
  w.line(['', 'PENERIMAAN'], { bold: true, fill: GROUP_FILL })
  for (const item of flow.inflows) w.line([item.category.includes('-') ? item.category : '', item.name, null, item.amount], { indent: 1 })
  w.line(['', 'Jumlah penerimaan', null, flow.totalIn], { bold: true })
  w.blank()
  w.line(['', 'PENGELUARAN'], { bold: true, fill: GROUP_FILL })
  for (const item of flow.outflows) w.line([item.category.includes('-') ? item.category : '', item.name, null, item.amount], { indent: 1 })
  w.line(['', 'Jumlah pengeluaran', null, flow.totalOut], { bold: true })
  w.blank()
  w.line(['', 'KENAIKAN (PENURUNAN) KAS', null, Math.round((flow.totalIn - flow.totalOut) * 100) / 100], { bold: true })
  w.blank()
  w.line(['', 'SALDO AKHIR KAS DAN BANK'], { bold: true, fill: GROUP_FILL })
  for (const account of flow.accounts) w.line([account.code, account.name, null, account.closing], { indent: 1 })
  w.line(['', 'TOTAL SALDO KAS DAN BANK', null, flow.closing], { bold: true, border: true })
  w.signatures(input.signers, input.printedAt)
}

const ledgerMemo = (row: LedgerRow): string => {
  if (row.source === 'ORDER') return `Order taksi lunas (${row.lines} baris)`
  if (row.source === 'PAYROLL') return 'Penggajian driver'
  return row.memo ?? '-'
}

function ledgerBlock(w: SheetWriter, ledger: Ledger) {
  w.line(['', 'Saldo Awal', null, null, shown(ledger.opening, ledger.account.normal === 'D' ? 'ASET' : 'KEWAJIBAN')], {
    bold: true
  })
  for (const row of ledger.rows) {
    w.line([dmy(row.entry_date), ledgerMemo(row), row.debit, row.credit, shown(row.balance, ledger.account.normal === 'D' ? 'ASET' : 'KEWAJIBAN')])
  }
  w.line(['', 'Saldo Akhir', null, null, shown(ledger.closing, ledger.account.normal === 'D' ? 'ASET' : 'KEWAJIBAN')], {
    bold: true,
    border: true
  })
}

function bankSheets(wb: ExcelJS.Workbook, input: ReportWorkbookInput, period: string) {
  for (const bank of bankSheetsFor(input.report.unit)) {
    const ledger = input.ledgers.find((item) => item.account.code === bank.code)
    const w = newSheet(wb, bank.title, [12, 48, 18, 18, 20])
    w.letterhead(`MUTASI ${bank.title.toUpperCase()}`, bank.unit, period)
    w.header(['Tanggal', 'Keterangan', 'Debet', 'Kredit', 'Saldo'])
    w.sheet.views = [{ state: 'frozen', ySplit: w.row - 1 }]
    if (ledger) ledgerBlock(w, ledger)
    else w.line(['', 'Tidak ada mutasi'])
  }
}

function journalSheet(wb: ExcelJS.Workbook, input: ReportWorkbookInput, period: string) {
  const w = newSheet(wb, 'Jurnal Umum', [12, 9, 16, 46, 11, 18, 18])
  w.letterhead('JURNAL UMUM', input.report.unit, period)
  w.header(['Tanggal', 'No.', 'Jenis', 'Keterangan / Akun', 'Unit', 'Debit', 'Kredit'])
  w.sheet.views = [{ state: 'frozen', ySplit: w.row - 1 }]
  let debit = 0
  let credit = 0
  const active = input.journals.filter((journal) => journal.status === 'ACTIVE')
  for (const journal of active) {
    w.line([dmy(journal.journalDate), `J-${journal.id}`, JOURNAL_TYPE_LABELS[journal.type] ?? journal.type, journal.description], {
      bold: true,
      fill: GROUP_FILL
    })
    for (const line of journal.lines ?? []) {
      const account = `${line.coaCode} ${line.coaName ?? ''}`.trim()
      w.line(['', '', '', line.memo ? `${account} — ${line.memo}` : account, line.unit, line.debit || null, line.credit || null], {
        indent: 1
      })
      debit += line.debit
      credit += line.credit
    }
  }
  if (!active.length) w.line(['', '', '', 'Tidak ada jurnal manual pada periode ini'])
  w.line(['', '', '', 'JUMLAH', null, Math.round(debit * 100) / 100, Math.round(credit * 100) / 100], { bold: true, border: true })
  w.line(['', '', '', 'Jurnal otomatis (order, kas, penggajian, hutang driver) tercantum di Buku Besar.'])
}

function ledgerSheet(wb: ExcelJS.Workbook, input: ReportWorkbookInput, period: string) {
  const w = newSheet(wb, 'Buku Besar', [12, 48, 18, 18, 20])
  w.letterhead('BUKU BESAR', input.report.unit, period)
  for (const ledger of input.ledgers) {
    w.line([`${ledger.account.code} ${ledger.account.name}`], { bold: true, fill: GROUP_FILL })
    w.header(['Tanggal', 'Keterangan', 'Debit', 'Kredit', 'Saldo'])
    ledgerBlock(w, ledger)
    w.blank()
  }
}

export function buildReportWorkbook(input: ReportWorkbookInput): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'MyPuskopau'
  wb.created = new Date(`${input.printedAt}T00:00:00+07:00`)
  const period = monthLabel(input.report.month)
  trialBalanceSheet(wb, input, period)
  incomeSheet(wb, input, period)
  balanceSheet(wb, input, period)
  cashFlowSheet(wb, input, period)
  bankSheets(wb, input, period)
  journalSheet(wb, input, period)
  ledgerSheet(wb, input, period)
  return wb
}

export async function downloadWorkbook(wb: ExcelJS.Workbook, fileName: string): Promise<void> {
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
