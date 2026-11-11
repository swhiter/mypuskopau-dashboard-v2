import type { CashAccount, CashKind } from '@/types/Data'

// Label akun & jenis pergerakan kas bendahara.
export const CASH_ACCOUNTS: CashAccount[] = ['MIDTRANS', 'CASH', 'VENDOR', 'KAS_BESAR', 'KAS_KECIL', 'KAS_INVESTOR', 'KAS_PUSKOPAU']

export const ACCOUNT_LABELS: Record<CashAccount, string> = {
  MIDTRANS: 'Saldo Midtrans',
  CASH: 'Saldo Cash',
  VENDOR: 'Kas Vendor',
  KAS_BESAR: 'Kas Besar',
  KAS_KECIL: 'Kas Kecil',
  KAS_INVESTOR: 'Kas Investor',
  KAS_PUSKOPAU: 'Kas Puskopau'
}

export const KIND_LABELS: Record<CashKind, string> = {
  ORDER_QRIS: 'Order QRIS',
  ORDER_CASH: 'Order Cash',
  ORDER_VENDOR: 'Struk Vendor',
  MIDTRANS_FEE: 'Biaya Midtrans',
  PAYROLL: 'Gaji Driver',
  OPENING: 'Saldo Awal',
  TRANSFER: 'Pindah Antar Akun',
  EXPENSE: 'Pengeluaran',
  INCOME: 'Pemasukan'
}

// Tanggal transaksi kas (Pemasukan/Pengeluaran) memakai kalender WIB.
const WIB_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

export const todayWib = (now: Date = new Date()): string => WIB_DATE.format(now)

// Rentang input tanggal: dari awal kas (startDate dari ringkasan kas) sampai hari ini.
export const cashDateRange = (startDate: string, now: Date = new Date()): { min: string; max: string } => ({
  min: startDate,
  max: todayWib(now)
})

export const accountLabel = (account: string | null | undefined): string =>
  account ? ACCOUNT_LABELS[account as CashAccount] ?? account : '-'

// Nominal kas yang diketik bendahara -> angka, maksimal 2 desimal (sen).
// Format Indonesia "27.834.210,33" atau "27834210.33"; null bila tidak valid.
export const parseRupiahInput = (value: unknown): number | null => {
  let text = String(value ?? '').replace(/rp|\s/gi, '')
  if (text.includes(',')) {
    const [whole, cents, ...rest] = text.split(',')
    if (rest.length || !/^(\d+|\d{1,3}(\.\d{3})+)$/.test(whole)) return null
    text = `${whole.replace(/\./g, '')}.${cents}`
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, '')
  }
  return /^\d+(\.\d{1,2})?$/.test(text) ? Number(text) : null
}
