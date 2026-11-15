import type { DriverDebt, DriverDebtDetail } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse } from '@/types/Main'
import type { DebtPayload } from '@/utils/driver-debt'
import httpClient from '../httpClient'

export interface DriverDebtListParams {
  status?: string
  search?: string
  driverId?: number
  page: number
  limit: number
}

export interface DebtCashPaymentPayload {
  amount: number
  account: string
  movementDate?: string
}

class DriverDebtService {
  async getDebts(params: DriverDebtListParams): Promise<PaginatedResponse<DriverDebt>> {
    return await httpClient.get<PaginatedResponse<DriverDebt>>('/driver-debt', { params })
  }

  async getDebt(id: number): Promise<GeneralResponse<DriverDebtDetail>> {
    return await httpClient.get<GeneralResponse<DriverDebtDetail>>(`/driver-debt/${id}`)
  }

  async createDebt(data: DebtPayload): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number }>>('/driver-debt', data)
  }

  // total hanya dikirim bila belum ada pembayaran
  async updateDebt(
    id: number,
    data: { description: string; installmentAmount: number; totalAmount?: number }
  ): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.put<GeneralResponse<{ id: number }>>(`/driver-debt/${id}`, data)
  }

  async voidDebt(id: number, reason: string): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number }>>(`/driver-debt/${id}/void`, { reason })
  }

  async payCash(
    id: number,
    data: DebtCashPaymentPayload
  ): Promise<GeneralResponse<{ id: number; cashMovementId: number; remaining: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number; cashMovementId: number; remaining: number }>>(
      `/driver-debt/${id}/cash-payment`,
      data
    )
  }

  async voidPayment(paymentId: number, reason: string): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number }>>(`/driver-debt/payments/${paymentId}/void`, {
      reason
    })
  }
}

const driverDebtService = new DriverDebtService()
export default driverDebtService
