// Menu Unduh Struk: struk PDF per transaksi (dibuat ulang backend dari data order).

export interface ReceiptRow {
  transactionNumber: string
  createdAt: string
  customerName: string | null
  driverName: string | null
  carName: string | null
  paymentMethod: string | null
  orderType: string | null
  total: number
  status: number
  statusOrder: string
  downloadable: boolean
}

export interface ReceiptFilters {
  transactionNumber: string
  from: string
  to: string
  driver: string
}

export const receiptFileName = (transactionNumber: string): string => `struk-${transactionNumber}.pdf`

export const receiptStatusLabel = (row: Pick<ReceiptRow, 'status' | 'statusOrder' | 'downloadable'>): string => {
  if (row.downloadable) return 'Lunas'
  if (row.statusOrder === 'CANCELLED') return 'Batal'
  if (row.statusOrder !== 'FINISHED') return 'Belum selesai'
  return 'Belum lunas'
}

// Nomor transaksi diisi -> cari nomor itu saja; selain itu rentang tanggal + nama driver.
export const receiptSearchParams = (filters: ReceiptFilters): Record<string, string> => {
  const transactionNumber = filters.transactionNumber.trim()
  if (transactionNumber) return { transactionNumber }
  const params: Record<string, string> = { from: filters.from, to: filters.to }
  const driver = filters.driver.trim()
  if (driver) params.driver = driver
  return params
}
