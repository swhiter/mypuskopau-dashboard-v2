import type { Driver } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse } from '@/types/Main'
import httpClient from '../httpClient'

class DriverService {
  async getDrivers(data: any): Promise<PaginatedResponse<Driver>> {
    return await httpClient.get<PaginatedResponse<Driver>>('/driver', { params: data })
  }
  async getDriverById(id: number): Promise<GeneralResponse<Driver>> {
    return await httpClient.get<GeneralResponse<Driver>>('/driver/' + id)
  }
  async createDriver(data: Driver): Promise<GeneralResponse<Driver>> {
    return await httpClient.post<GeneralResponse<Driver>>('/driver', data)
  }
  async updateDriver(data: Driver): Promise<GeneralResponse<Driver>> {
    return await httpClient.put<GeneralResponse<Driver>>('/driver/' + data.id, data)
  }
  async deleteDriver(id: number): Promise<GeneralResponse<Driver>> {
    return await httpClient.delete<GeneralResponse<Driver>>('/driver/' + id)
  }
}

const driverService = new DriverService()
export default driverService
