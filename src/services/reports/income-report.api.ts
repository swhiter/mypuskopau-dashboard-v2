// src/services/reports/income-report.api.ts
import httpClient from '../httpClient'
import type { PaginatedResponse, PaginationRequest } from '@/types/Main'

// --- TYPE RESPONSE SESUAI API ---

export interface RekapanOrderDetail {
  id: number
  pickupAddress: string
  destinationAddress: string
  longitudeDestination: string
  latitudeDestination: string
  longitudeStart: string
  latitudeStart: string
  price: string
  distance: string
  parkingPrice: string
  paymentMethod: string
  vaAccount: string
  midtransId: string
  carName: string
  driverIncome: string
  managementIncome: string
  profitSharingId: number
  chargePassenger: string
  discount: number
  createdAt: string
  updatedAt: string
  totalPendapatan: number
  komisi40: number
  komisi60: number
  potonganMidtrans: number
  pendapatanDriver: number
}

export interface RekapanDriverInfo {
  id: number
  userId: string
  name: string
  nik: string
  photo: string
  vehicleCode: string
  licensePlate: string
  lastLongitude: string
  lastLatitude: string
  status: number
  totalIncome: string
  totalIncomeDay: string
  createdAt: string
  updatedAt: string
  statusLocation: number
  isSuspend: number
  isLangganan: number
  no_hp: string
}

export interface RekapanStaffInfo {
  id: number
  userId: string
  name: string
  nik: string
  photo: string
  createdAt: string
  updatedAt: string
}

export interface RekapanPendapatanRow {
  id: number
  transactionNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  driverId: number
  staffId: number
  pelangganId: number | null
  orderDetailId: number
  status: number
  statusOrder: string
  createdBy: string
  createdAt: string
  updatedAt: string
  flagingLocation: number
  urlMidtrans: string
  orderDetail: RekapanOrderDetail
  driver: RekapanDriverInfo
  staff: RekapanStaffInfo
  pelanggan: any
}

// --- Pendapatan Driver ---

export interface PendapatanDriverRow {
  orderId: number
  driverId: number
  driverName: string
  tanggal: string
  tarif: number
  surcharge: number
  komisi40: number
  komisi60: number
  pendapatanDriver: number
  potonganMidtrans: number
  carName: string
  paymentMethod: string
  PotCuciAPK: number
  chargePassenger: number
}

export interface IncomeFilterRequest extends PaginationRequest {
  startDate: string   // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
}

// --- SERVICE CLASS ---

class IncomeReportService {
  async getRekapan(
    params: IncomeFilterRequest
  ): Promise<PaginatedResponse<RekapanPendapatanRow>> {
    return await httpClient.get<PaginatedResponse<RekapanPendapatanRow>>(
      '/order/rekapan',
      { params }
    )
  }

  async getPendapatanDriver(
    params: IncomeFilterRequest
  ): Promise<PaginatedResponse<PendapatanDriverRow>> {
    return await httpClient.get<PaginatedResponse<PendapatanDriverRow>>(
      '/order/pendapatan-driver',
      { params }
    )
  }
}

const incomeReportService = new IncomeReportService()
export default incomeReportService
