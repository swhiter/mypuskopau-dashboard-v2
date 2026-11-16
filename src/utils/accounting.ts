// Akuntansi (GL): Daftar Akun, unit usaha, pilihan akun untuk pemasukan/pengeluaran.
// Aturan sama dengan backend (accounting.rules.ts, coa.seed.ts).

export type CoaType = 'ASET' | 'KEWAJIBAN' | 'EKUITAS' | 'PENDAPATAN' | 'BEBAN'
export type BusinessUnit = 'INVESTOR' | 'PUSKOPAU'

export interface CoaAccount {
  code: string
  name: string
  type: CoaType
  normal: 'D' | 'K'
  parent: string | null
  isHeader: boolean
  isActive: boolean
  cashAccount: string | null
  isSystem: boolean
}

export const UNITS: BusinessUnit[] = ['INVESTOR', 'PUSKOPAU']
export const UNIT_LABELS: Record<BusinessUnit, string> = {
  INVESTOR: 'Avanza Investor',
  PUSKOPAU: 'Avanza Puskopau'
}
export const COA_TYPES: CoaType[] = ['ASET', 'KEWAJIBAN', 'EKUITAS', 'PENDAPATAN', 'BEBAN']
export const COA_TYPE_LABELS: Record<CoaType, string> = {
  ASET: 'Aset',
  KEWAJIBAN: 'Kewajiban',
  EKUITAS: 'Ekuitas',
  PENDAPATAN: 'Pendapatan',
  BEBAN: 'Beban'
}

// Rek 67 milik Puskopau; akun kas lain dipakai bersama -> Investor
export const defaultUnitFor = (cashAccount: string | null | undefined): BusinessUnit =>
  cashAccount === 'KAS_PUSKOPAU' ? 'PUSKOPAU' : 'INVESTOR'

// Pengeluaran Kas Kecil otomatis mengurangi Dana Kas Kecil; transfer tanpa akun.
export const needsClassification = (type: string, fromAccount: string | null | undefined): boolean =>
  type === 'INCOME' || (type === 'EXPENSE' && fromAccount !== 'KAS_KECIL')

// Akun detail aktif yang bukan akun kas; jenis yang paling umum ditaruh di atas.
export const accountOptions = (accounts: CoaAccount[], type: 'EXPENSE' | 'INCOME'): CoaAccount[] => {
  const order: CoaType[] =
    type === 'EXPENSE'
      ? ['BEBAN', 'ASET', 'KEWAJIBAN', 'EKUITAS', 'PENDAPATAN']
      : ['PENDAPATAN', 'ASET', 'KEWAJIBAN', 'EKUITAS', 'BEBAN']
  return accounts
    .filter((account) => !account.isHeader && account.isActive && !account.cashAccount)
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || a.code.localeCompare(b.code))
}

// Saldo bertanda dari backend (+ debit) ditampilkan di sisi saldo normal akun.
export const displayBalance = (signed: number, normal: 'D' | 'K'): number => (normal === 'D' ? signed : -signed)

export const coaLabel = (code: string | null | undefined, accounts: CoaAccount[]): string => {
  if (!code) return '-'
  const account = accounts.find((item) => item.code === code)
  return account ? `${account.code} ${account.name}` : code
}

export const accountDepth = (account: CoaAccount, accounts: CoaAccount[]): number => {
  let depth = 0
  let parent = account.parent
  while (parent && depth < 10) {
    depth += 1
    parent = accounts.find((item) => item.code === parent)?.parent ?? null
  }
  return depth
}
