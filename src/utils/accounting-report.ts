// Laporan Akuntansi bulanan: pilihan bulan, judul unit, cek balance jurnal manual.
// Aturan sama dengan backend (accounting.rules.ts, journal.rules.ts).
import type { BusinessUnit } from './accounting'

export const REPORT_START = '2026-09-01'
export const OPENING_DATE = '2026-08-31'
// Jurnal otomatis (order, kas, gaji, hutang driver) mulai tanggal ini.
export const GL_AUTO_START = '2026-11-01'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export const monthLabel = (month: string): string => {
  const [year, mon] = month.split('-').map(Number)
  return `${MONTHS[mon - 1]} ${year}`
}

/** Bulan yang bisa dilaporkan: September 2026 s/d bulan ini (terbaru di atas). */
export const monthOptions = (today: string): string[] => {
  const result: string[] = []
  let [year, mon] = REPORT_START.slice(0, 7).split('-').map(Number)
  const end = today.slice(0, 7)
  while (`${year}-${String(mon).padStart(2, '0')}` <= end) {
    result.push(`${year}-${String(mon).padStart(2, '0')}`)
    mon += 1
    if (mon > 12) {
      mon = 1
      year += 1
    }
  }
  return result.reverse()
}

export const unitTitle = (unit: BusinessUnit | null | ''): string =>
  unit === 'PUSKOPAU' ? 'Avanza Puskopau' : unit === 'INVESTOR' ? 'Avanza Investor' : 'Gabungan Puskopau & Investor'

// Rekening bank per unit (sheet seperti rekening koran).
export const BANK_SHEETS: { code: string; title: string; unit: BusinessUnit }[] = [
  { code: '1-111', title: 'Rek 67', unit: 'PUSKOPAU' },
  { code: '1-112', title: 'Rek 87', unit: 'INVESTOR' }
]
export const bankSheetsFor = (unit: BusinessUnit | null | '') =>
  BANK_SHEETS.filter((bank) => !unit || bank.unit === unit)

export const JOURNAL_TYPE_LABELS: Record<string, string> = {
  SALDO_AWAL: 'Saldo Awal',
  RIWAYAT: 'Riwayat (Excel)',
  PENYESUAIAN: 'Penyesuaian',
  KOREKSI: 'Koreksi'
}
// Jenis yang dibuat bendahara dari form; saldo awal & riwayat diimpor sekali.
export const FORM_JOURNAL_TYPES = ['PENYESUAIAN', 'KOREKSI'] as const

const cents = (value: number): number => Math.round((Number(value) || 0) * 100)

/** Selisih debit − kredit per unit (0 = balance). */
export const journalUnitDiffs = (
  lines: { unit: string; debit: number | string; credit: number | string }[]
): Record<string, number> => {
  const totals: Record<string, number> = {}
  for (const line of lines) {
    if (!line.unit) continue
    totals[line.unit] = (totals[line.unit] ?? 0) + cents(Number(line.debit)) - cents(Number(line.credit))
  }
  return Object.fromEntries(Object.entries(totals).map(([unit, value]) => [unit, value / 100]))
}

/** Siap disimpan: ≥ 2 baris lengkap, tiap baris hanya debit atau kredit, balance per unit. */
export const journalReady = (
  lines: { coaCode: string; unit: string; debit: number | string; credit: number | string }[]
): boolean => {
  if (lines.length < 2) return false
  const complete = lines.every((line) => {
    const debit = cents(Number(line.debit))
    const credit = cents(Number(line.credit))
    return line.coaCode && line.unit && debit >= 0 && credit >= 0 && (debit > 0) !== (credit > 0)
  })
  return complete && Object.values(journalUnitDiffs(lines)).every((value) => value === 0)
}

export const SIGNERS_KEY = 'accounting.signers'
export interface Signers {
  bendahara: string
  kaunit: string
}
