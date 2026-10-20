export interface TripRatingInfo {
  transactionNumber: string
  driverName: string
  vehicleCode: string
  licensePlate: string
  photo: string | null
  alreadyRated: boolean
}

export interface ArgoReview {
  id: number
  transactionNumber: string
  driverId: number | null
  driverName: string
  vehicleCode: string
  licensePlate: string
  pelangganId: number | null
  rating: number
  review: string | null
  createdAt: string
}

export interface UnfinishedTrip {
  transactionNumber: string
  driverId: number
  driverName: string
  vehicleCode: string
  licensePlate: string
  driverPhone: string
  latitude: number
  longitude: number
  price: number
  distance: number
  duration: number
  startedAt: string
  lastRecordedAt: string
}

export interface TargetDriver {
  id?: number
  target: number
  month: number
  year: number
}

export interface DriverStatistics {
  totalRitase: number
  totalIncome: number
  totalOmzet?: number
  totalDistance: number
  target: number
  achievement: number
  achievementPercentage: number
  lifetimeRitase: number
  lifetimeIncome?: number
  avgRating: number
  totalReview: number
}

export interface Driver {
  id?: number
  userId: string
  name: string
  nik: string
  photo: string
  vehicleCode: string
  licensePlate: string
  lastLongitude: number | string
  lastLatitude: number | string
  totalIncome: number | string
  totalIncomeDay: number | string
  status: number
  no_hp?: string
  statusLocation?: number
  isSuspend?: number
  isLangganan?: number
  statistics?: DriverStatistics
}

export interface Staff {
  id?: number
  userId: string
  name: string
  nik: string
  photo: string
}

export interface Tariff {
  id: number
  distance: number
  price: number
  minimumPrice: number | string
}

export interface Transaction {
  id: number
  transactionNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: number
  orderDetail: OrderDetail
  driver: Driver
  staff: Staff
  createdAt: string
  updatedAt: string
}

interface OrderDetail {
  id: number
  latitudeStart: string
  latitudeDestination: string
  longitudeStart: string
  longitudeDestination: string
  destinationAddress: string
  distance: string
  price: string
  parkingPrice: string
  midtransId: string
  paymentMethod: string
  vaAccount: string
  carName: string
  driverIncome: string
  managementIncome: string
  createdAt: string
  updatedAt: string
}

export interface ExtendedDriver extends Driver {
  actions: number
}

export interface ExtendedStaff extends Staff {
  actions: number
}

export interface TableItemTransaction {
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  customerPhone: string
  destinationAddress: string
  distance: number
  price: number
  paymentMethod: string
  driverName: string
  licensePlate: string
  staffName: string
  carName: string
  driverIncome: number | string
  managementIncome: number | string
  actions: string
}

export interface TariffByDistance {
  id: number
  intervalMin: number
  intervalMax: number
  price: number
  priceMulti: number
}

export interface ExtendedTariffByDistance extends TariffByDistance {
  distance: {
    intervalMin: number
    intervalMax: number
  }
  actions: number
}

export interface Car {
  id: number
  carName: string
  driverPercentage: number
  managementPercentage: number
  photo: string
  description: string
}

export interface ExtendedCar extends Car {
  actions: number
}

export interface Passenger {
  id: number
  maxPassenger: string
  price: number
}

export interface ExtendedPassenger extends Discount {
  actions: number
}

export interface Discount {
  id: number
  discount: number
  status: number | string
}

export interface ExtendedDiscount extends Discount {
  actions: number
}

// Vendor untuk input struk vendor (m_vendor)
export interface Vendor {
  id: number
  name: string
  isActive: boolean
}

export type ExtendedVendor = Vendor & { actions: number }

// Struk vendor (t_order + t_order_detail dengan payment_method cash_vendor)
export interface VendorOrder {
  id: number
  transactionNumber: string
  tripDate: string
  vendorId: number
  vendorName: string
  vendorReference: string
  driverId: number
  driverName: string
  carType: number
  carName: string
  customerName: string
  customerPhone: string
  pickupAddress: string
  destinationAddress: string
  distance: number
  price: number
  hasPhoto: boolean
}

export type ExtendedVendorOrder = VendorOrder & { actions: number }

export interface VendorOrderForm {
  vendorId: string
  vendorReference: string
  tripDate: string
  driverId: string
  carType: string
  customerName: string
  customerPhone: string
  pickupAddress: string
  destinationAddress: string
  distance: number
  price: number
}

// Kas bendahara
export type CashAccount = 'MIDTRANS' | 'CASH' | 'KAS_BESAR' | 'KAS_KECIL'
export type CashKind =
  | 'ORDER_QRIS'
  | 'ORDER_CASH'
  | 'MIDTRANS_FEE'
  | 'PAYROLL'
  | 'OPENING'
  | 'TRANSFER'
  | 'EXPENSE'

export interface CashAccountSummary {
  account: CashAccount
  balance: number
  todayIn: number
  todayOut: number
  hasOpening: boolean
}

// Jatah kas kecil (20% pendapatan manajemen) vs dana yang sudah dipindahkan ke Kas Kecil
export interface PettyCashSource {
  account: 'MIDTRANS' | 'CASH'
  allocated: number
  transferred: number
  outstanding: number
}

export interface PettyCashSummary {
  allocated: number
  transferred: number
  outstanding: number
  bySource: PettyCashSource[]
}

export interface CashSummary {
  startDate: string
  accounts: CashAccountSummary[]
  totalBalance: number
  pettyCash: PettyCashSummary
  unknownMethod: { orderCount: number; total: number }
}

export interface CashMovementRow {
  at: string
  day: string
  kind: CashKind
  from_account: CashAccount | null
  to_account: CashAccount | null
  amount: number
  count: number
  source: 'AUTO' | 'MANUAL'
  id: number | null
  description: string | null
  status: 'ACTIVE' | 'VOID'
  void_reason: string | null
  created_by: string | null
  voided_by: string | null
}

// Penggajian driver
export interface PayrollSummary {
  period: { id: number; openedAt: string }
  payrollCount: number
  totalBase: number
  totalDeduction: number
  totalBonus: number
  totalNet: number
  pendingDriverCount: number
  pendingTotal: number
}

export interface PendingDriver {
  driverId: number
  workDate: string
  driverName: string
  vehicleCode: string
  orderCount: number
  baseAmount: number
  firstOrderAt: string
  lastOrderAt: string
}

export interface UnpaidOrder {
  orderId: number
  driverId: number
  transactionNumber: string
  createdAt: string
  paymentMethod: string
  price: number
  amount: number
}

export interface PendingDetail {
  driver: { id: number; name: string; vehicleCode: string }
  workDate: string
  orders: UnpaidOrder[]
  baseAmount: number
}

export interface PayrollRow {
  id: number
  periodId: number
  periodStatus: 'OPEN' | 'CLOSED'
  driverId: number
  workDate: string | null
  driverName: string
  vehicleCode: string
  orderCount: number
  baseAmount: number
  deductionAmount: number
  deductionNote: string | null
  bonusAmount: number
  bonusNote: string | null
  netAmount: number
  processedBy: string
  processedAt: string
  updatedBy: string | null
  updatedAt: string
}

export interface PayrollDetail extends PayrollRow {
  orders: { orderId: number; transactionNumber: string; createdAt: string; paymentMethod: string; amount: number }[]
}

export interface PayrollPeriod {
  id: number
  status: 'OPEN' | 'CLOSED'
  openedAt: string
  closedAt: string | null
  closedBy: string | null
  payrollCount: number
  totalBase: number
  totalDeduction: number
  totalBonus: number
  totalNet: number
}

// Satuan jarak tarif (m_satuan_tarif)
export interface SatuanTarif {
  id: number
  satuan: string
  description: string
  isActivePrice: boolean
  isActiveConfig: boolean
}

// Minimum Argo
export interface ArgoTariff {
  id: number
  distance: number        // <--- jarak minimum argo
  price: number
  minimumPrice: number
  pricePerMenit: number
}

// Rentang Argo (mirip TariffByDistance + priceMulti)
export interface ArgoTariffByDistance {
  id: number
  intervalMin: number
  intervalMax: number
  price: number
}

export interface ExtendedArgoTariffByDistance extends ArgoTariffByDistance {
  distance: { intervalMin: number; intervalMax: number }
  actions: number
}

export interface CreateOrderPayload {
  customerEmail: string
  customerName: string
  customerPhone: string
  driverID: number | string
  carType: 'puskopau' | 'investor' | string
  orderDetail: {
    destinationAddress: string
    distance: number
    latitudeDestination: string | number
    latitudeStart: string | number
    longitudeDestination: string | number
    longitudeStart: string | number
    paymentMethod: string
    vaAccount: string
    price: number
    chargePassenger: number
    discount: number
  }
  staffId: number | string
}

export interface ActiveCarAssignment {
  id: number
  profitSharingId: number
  carName: string
  driverId: number
  driverName: string
  licensePlate: string
  assignedAt: string
  sessionExpiredAt: string | null
}
