import type { GeneralResponse } from '@/types/Main'
import httpClient from '../httpClient'
import type { DashboardSummary } from '@/types/Dashboard'

class DashboardService {
  async getDashboardData(data: any): Promise<GeneralResponse<DashboardSummary>> {
    return await httpClient.get<GeneralResponse<DashboardSummary>>('/dashboard', { params: data })
  }
}

const dashboardService = new DashboardService()
export default dashboardService
