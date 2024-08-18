import type { Driver } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'
import type { AxiosRequestConfig } from 'axios'

class DriverService {
  private config: AxiosRequestConfig

  constructor() {
    this.config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  }

  async getDrivers(data: Partial<PaginationRequest>): Promise<PaginatedResponse<Driver>> {
    return await httpClient.get<PaginatedResponse<Driver>>('/driver', { params: data })
  }
  async getDriverById(id: number): Promise<GeneralResponse<Driver>> {
    return await httpClient.get<GeneralResponse<Driver>>('/driver/' + id)
  }
  async createDriver(data: FormData): Promise<GeneralResponse<Driver>> {
    return await httpClient.post<GeneralResponse<Driver>>('/driver', data, this.config)
  }
  async updateDriver(data: FormData, id: number): Promise<GeneralResponse<Driver>> {
    return await httpClient.put<GeneralResponse<Driver>>('/driver/' + id, data, this.config)
  }
  async deleteDriver(id: number): Promise<GeneralResponse<Driver>> {
    return await httpClient.delete<GeneralResponse<Driver>>('/driver/' + id)
  }
  async resetDailyIncome(userId: string): Promise<GeneralResponse<Driver>> {
    return await httpClient.put<GeneralResponse<Driver>>(`/driver/${userId}/resettotalincomday`, {})
  }
}

const driverService = new DriverService()
export default driverService
