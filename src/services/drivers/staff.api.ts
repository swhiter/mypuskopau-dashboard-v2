import type { Staff } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import type { AxiosRequestConfig } from 'axios'
import httpClient from '../httpClient'

class StaffService {
  private config: AxiosRequestConfig

  constructor() {
    this.config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  }

  async getStaff(data: PaginationRequest): Promise<PaginatedResponse<Staff>> {
    return await httpClient.get<PaginatedResponse<Staff>>('/staff', { params: data })
  }
  async getStaffById(id: number): Promise<GeneralResponse<Staff>> {
    return await httpClient.get<GeneralResponse<Staff>>('/staff/' + id)
  }
  async createStaff(data: FormData): Promise<GeneralResponse<Staff>> {
    return await httpClient.post<GeneralResponse<Staff>>('/staff', data, this.config)
  }
  async updateStaff(data: FormData, id: number): Promise<GeneralResponse<Staff>> {
    return await httpClient.put<GeneralResponse<Staff>>('/staff/' + id, data, this.config)
  }
  async deleteStaff(id: number): Promise<GeneralResponse<Staff>> {
    return await httpClient.delete<GeneralResponse<Staff>>('/staff/' + id)
  }
}

const staffService = new StaffService()
export default staffService
