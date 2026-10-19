import type { Car } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'
import type { AxiosRequestConfig } from 'axios'
import { resizeImagesInForm } from '@/utils/image-resize'

class CarsService {
  private config: AxiosRequestConfig

  constructor() {
    this.config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  }

  async getCars(data: PaginationRequest): Promise<PaginatedResponse<Car>> {
    return await httpClient.get<PaginatedResponse<Car>>('/profitSharing', { params: data })
  }
  async getCarById(id: number): Promise<GeneralResponse<Car>> {
    return await httpClient.get<GeneralResponse<Car>>('/profitSharing/' + id)
  }
  async createCar(data: FormData): Promise<GeneralResponse<Car>> {
    return await httpClient.post<GeneralResponse<Car>>('/profitSharing', await resizeImagesInForm(data), this.config)
  }
  async updateCar(data: FormData, id: number): Promise<GeneralResponse<Car>> {
    return await httpClient.put<GeneralResponse<Car>>(`/profitSharing/${id}`, await resizeImagesInForm(data), this.config)
  }
  async deleteCar(id: number): Promise<GeneralResponse<Car>> {
    return await httpClient.delete<GeneralResponse<Car>>(`/profitSharing/${id}`)
  }
}

const carsService = new CarsService()
export default carsService
