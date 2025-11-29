export interface UserInfo {
  name: string
  nik: string
  photo: File | string
  no_hp?: string  
  statusLocation?: number
  isSuspend?: number
  isLangganan?: number
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
  minimumPrice: number
}
export interface ArgoTariffSetting {
  distance: number        // <--- jarak minimum argo
  price: number
  minimumPrice: number
  pricePerMenit: number
}