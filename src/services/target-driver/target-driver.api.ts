import type { TargetDriver } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'

class TargetDriverService {
  async getTargets(data: Partial<PaginationRequest>): Promise<PaginatedResponse<TargetDriver>> {
    return await httpClient.get<PaginatedResponse<TargetDriver>>('/target-driver', { params: data })
  }
  async createTarget(data: Pick<TargetDriver, 'target' | 'month' | 'year'>): Promise<GeneralResponse<TargetDriver>> {
    return await httpClient.post<GeneralResponse<TargetDriver>>('/target-driver', data)
  }
  async updateTarget(id: number, data: Pick<TargetDriver, 'target'>): Promise<GeneralResponse<TargetDriver>> {
    return await httpClient.put<GeneralResponse<TargetDriver>>('/target-driver/' + id, data)
  }
}

const targetDriverService = new TargetDriverService()
export default targetDriverService
