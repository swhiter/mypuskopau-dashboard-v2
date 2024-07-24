export interface UserInfo {
  name: string
  nik: string
  photo: File | string
}

export interface VehicleInfo {
  vehicleCode: string
  licensePlate: string
}

export interface UserAccessInfo {
  id: number
  userId: string
  password: string
  role: string
}

export interface TariffSetting {
  distance: number
  price: number
}
