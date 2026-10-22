// Format tampilan penggajian: selalu WIB (bukan zona waktu browser) & rupiah.
const WIB: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}

export const formatWib = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleString('id-ID', WIB) : '-'

// Tanggal kerja 'YYYY-MM-DD' (hari kerja dengan cut-off 03:00 WIB) -> 'DD/MM/YYYY'
export const formatWorkDate = (value: string | null | undefined): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '-'
}

export const formatRupiah = (value: number | null | undefined): string => {
  const amount = Number(value ?? 0)
  const text = 'Rp ' + Math.abs(amount).toLocaleString('id-ID', { maximumFractionDigits: 2 })
  return amount < 0 ? `-${text}` : text
}
