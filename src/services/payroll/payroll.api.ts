import type {
  PayrollDetail,
  PayrollPeriod,
  PayrollRow,
  PayrollSummary,
  PendingDetail,
  PendingDriver
} from '@/types/Data'
import type { GeneralResponse, PaginatedResponse } from '@/types/Main'
import httpClient from '../httpClient'

export interface PayrollAdjustmentPayload {
  deductionAmount: number
  deductionNote: string
  bonusAmount: number
  bonusNote: string
}

export interface PayrollListParams {
  periodId?: number | ''
  search?: string
  page: number
  limit: number
}

class PayrollService {
  async getSummary(): Promise<GeneralResponse<PayrollSummary>> {
    return await httpClient.get<GeneralResponse<PayrollSummary>>('/payroll/summary')
  }

  async getPending(search?: string): Promise<GeneralResponse<PendingDriver[]>> {
    return await httpClient.get<GeneralResponse<PendingDriver[]>>('/payroll/pending', {
      params: { search }
    })
  }

  async getPendingDetail(driverId: number): Promise<GeneralResponse<PendingDetail>> {
    return await httpClient.get<GeneralResponse<PendingDetail>>(`/payroll/pending/${driverId}`)
  }

  async processPayroll(
    data: PayrollAdjustmentPayload & { driverId: number; orderIds: number[] }
  ): Promise<GeneralResponse<{ id: number; netAmount: number; orderCount: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number; netAmount: number; orderCount: number }>>(
      '/payroll',
      data
    )
  }

  async updatePayroll(
    id: number,
    data: PayrollAdjustmentPayload
  ): Promise<GeneralResponse<{ id: number; netAmount: number }>> {
    return await httpClient.put<GeneralResponse<{ id: number; netAmount: number }>>(`/payroll/${id}`, data)
  }

  async getPayrolls(params: PayrollListParams): Promise<PaginatedResponse<PayrollRow>> {
    return await httpClient.get<PaginatedResponse<PayrollRow>>('/payroll', { params })
  }

  async getPayroll(id: number): Promise<GeneralResponse<PayrollDetail>> {
    return await httpClient.get<GeneralResponse<PayrollDetail>>(`/payroll/${id}`)
  }

  async getPeriods(): Promise<GeneralResponse<PayrollPeriod[]>> {
    return await httpClient.get<GeneralResponse<PayrollPeriod[]>>('/payroll/periods')
  }

  async closePeriod(): Promise<
    GeneralResponse<{ closedPeriodId: number | null; openPeriodId: number }>
  > {
    return await httpClient.post<GeneralResponse<{ closedPeriodId: number | null; openPeriodId: number }>>(
      '/payroll/periods/close',
      {}
    )
  }
}

const payrollService = new PayrollService()
export default payrollService
