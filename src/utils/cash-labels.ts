import type { CashAccount, CashKind } from '@/types/Data'

// Label akun & jenis pergerakan kas bendahara.
export const CASH_ACCOUNTS: CashAccount[] = ['MIDTRANS', 'CASH', 'KAS_BESAR', 'KAS_KECIL']

export const ACCOUNT_LABELS: Record<CashAccount, string> = {
  MIDTRANS: 'Saldo Midtrans',
  CASH: 'Saldo Cash',
  KAS_BESAR: 'Kas Besar',
  KAS_KECIL: 'Kas Kecil'
}

export const KIND_LABELS: Record<CashKind, string> = {
  ORDER_QRIS: 'Order QRIS',
  ORDER_CASH: 'Order Cash',
  MIDTRANS_FEE: 'Biaya Midtrans',
  PETTY_ALLOCATION: 'Jatah Kas Kecil',
  PAYROLL: 'Gaji Driver',
  OPENING: 'Saldo Awal',
  TRANSFER: 'Pindah Antar Akun',
  EXPENSE: 'Pengeluaran'
}

export const accountLabel = (account: string | null | undefined): string =>
  account ? ACCOUNT_LABELS[account as CashAccount] ?? account : '-'
