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

export const formatRupiah = (value: number | null | undefined): string => {
  const amount = Number(value ?? 0)
  const text = 'Rp ' + Math.abs(amount).toLocaleString('id-ID')
  return amount < 0 ? `-${text}` : text
}
