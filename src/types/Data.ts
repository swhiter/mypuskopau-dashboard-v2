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

export interface ExtendedDriver extends Driver {
  actions: number
}

export interface ExtendedStaff extends Staff {
  actions: number
}
