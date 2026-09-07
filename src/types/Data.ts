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
  totalDistance: number
  target: number
  achievement: number
  achievementPercentage: number
  lifetimeRitase: number
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
