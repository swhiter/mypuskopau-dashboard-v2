import type { CashAccount, CashMovementRow, CashSummary } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse } from '@/types/Main'
import httpClient from '../httpClient'

export interface CashMovementParams {
  account?: CashAccount | ''
  kind?: string
  startDate?: string
  endDate?: string
  page: number
  limit: number
}

export interface CashManualPayload {
  type: 'TRANSFER' | 'EXPENSE'
  fromAccount: CashAccount
  toAccount?: CashAccount | null
  amount: number
  description: string
}

class CashService {
  async getSummary(): Promise<GeneralResponse<CashSummary>> {
    return await httpClient.get<GeneralResponse<CashSummary>>('/cash/summary')
  }

  async getMovements(params: CashMovementParams): Promise<PaginatedResponse<CashMovementRow>> {
    return await httpClient.get<PaginatedResponse<CashMovementRow>>('/cash/movements', { params })
  }

  async createOpening(data: {
    account: CashAccount
    amount: number
    description: string
  }): Promise<GeneralResponse<unknown>> {
    return await httpClient.post<GeneralResponse<unknown>>('/cash/opening', data)
  }

  async createMovement(data: CashManualPayload): Promise<GeneralResponse<unknown>> {
    return await httpClient.post<GeneralResponse<unknown>>('/cash/movements', data)
  }

  async voidMovement(id: number, reason: string): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number }>>(`/cash/movements/${id}/void`, { reason })
  }
}

const cashService = new CashService()
export default cashService
