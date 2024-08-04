export interface Driver {
  id?: number
  userId: string
  name: string
  nik: string
  photo: string
  vehicleCode: string
  licensePlate: string
  lastLongitude: number
  lastLatitude: number
  totalIncome: number
  status: number
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
  latitudeDestinaton: string
  longitudeStart: string
  longitudeDestination: string
  destinationAddress: string
  distance: string
  price: string
  parkingPrice: string
  midtransId: string
  paymentMethod: string
  vaAccount: string
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
  driverName: string
  licensePlate: string
  actions: number
}
