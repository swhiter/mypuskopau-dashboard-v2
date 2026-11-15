import type { CreateOrderPayload } from '@/services/order/order.api'

// Buat Struk Manual: order cash yang dibuat admin. Harga di bawah tarif
// minimum ditolak di form supaya createOrder tidak mengubah harga.
export const MINIMUM_PRICE = 75000

// Jenis order: SEWA = sewa taksi per jam, dibagi 40/60 tanpa potongan driver
// dan tanpa jatah kas kecil (aturan di backend). Durasi wajib 0–24 jam.
export type ManualOrderType = 'REGULER' | 'SEWA'
export const MAX_RENTAL_HOURS = 24
const DRIVER_SHARE_RATE = 0.4

export interface ManualOrderForm {
  customerName: string
  customerPhone: string
  customerEmail: string
  pickupAddress: string
  destinationAddress: string
  distance: number | string
  // koordinat opsional: penjemputan order manual bisa dari mana saja
  latitudeStart: number | string
  longitudeStart: number | string
  latitudeDestination: number | string
  longitudeDestination: number | string
  driverUserId: string
  carId: number | string
  staffId: number | string
  price: number | string
  chargePassenger: number | string
  discount: number | string
  orderType: ManualOrderType
  rentalHours: number | string
}

const num = (value: unknown): number => Number(value) || 0
const isBlank = (value: unknown): boolean => String(value ?? '').trim() === ''

export const emptyManualOrderForm = (): ManualOrderForm => ({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  pickupAddress: '',
  destinationAddress: '',
  distance: '',
  latitudeStart: '',
  longitudeStart: '',
  latitudeDestination: '',
  longitudeDestination: '',
  driverUserId: '',
  carId: '',
  staffId: '',
  price: '',
  chargePassenger: '',
  discount: '',
  orderType: 'REGULER',
  rentalHours: ''
})

export const buildManualOrderPayload = (form: ManualOrderForm): CreateOrderPayload => ({
  customerName: form.customerName.trim(),
  customerPhone: form.customerPhone.trim(),
  customerEmail: form.customerEmail.trim(),
  driverId: form.driverUserId,
  carType: num(form.carId),
  ...(isBlank(form.staffId) ? {} : { staffId: num(form.staffId) }),
  orderDetail: {
    pickupAddress: form.pickupAddress.trim(),
    destinationAddress: form.destinationAddress.trim(),
    distance: num(form.distance),
    // kolom asal wajib angka di database: 0 bila tidak diketahui
    latitudeStart: num(form.latitudeStart),
    longitudeStart: num(form.longitudeStart),
    latitudeDestination: isBlank(form.latitudeDestination) ? '-' : String(form.latitudeDestination).trim(),
    longitudeDestination: isBlank(form.longitudeDestination) ? '-' : String(form.longitudeDestination).trim(),
    paymentMethod: 'cash',
    vaAccount: '-',
    price: num(form.price),
    chargePassenger: num(form.chargePassenger),
    discount: num(form.discount),
    orderType: form.orderType,
    ...(form.orderType === 'SEWA' ? { rentalHours: Number(form.rentalHours) } : {})
  }
})

const isValidRentalHours = (value: unknown): boolean => {
  const text = String(value ?? '').trim()
  const hours = Number(text)
  return /^\d+(\.\d{1,2})?$/.test(text) && hours > 0 && hours <= MAX_RENTAL_HOURS
}

// Mengembalikan key pesan i18n bila tidak valid, null bila valid.
export const validateManualOrder = (form: ManualOrderForm): string | null => {
  if (form.orderType === 'SEWA' && !isValidRentalHours(form.rentalHours)) {
    return 'message.rentalHoursRequired'
  }
  return null
}

export const manualOrderTotals = (form: ManualOrderForm) => {
  const price = Math.max(num(form.price), MINIMUM_PRICE)
  const chargePassenger = num(form.chargePassenger)
  const discount = num(form.discount)
  return {
    price,
    minimumApplied: num(form.price) < MINIMUM_PRICE,
    chargePassenger,
    discount,
    total: price + chargePassenger - discount,
    isRental: form.orderType === 'SEWA',
    // bagian driver Sewa = 40% tarif penuh (tanpa potongan)
    driverShare: form.orderType === 'SEWA' ? Math.round((price - discount) * DRIVER_SHARE_RATE) : null
  }
}
