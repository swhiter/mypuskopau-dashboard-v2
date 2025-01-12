import type { Discount } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'
import type { AxiosRequestConfig } from 'axios'

class DiscountsService {
 
  async getDiscounts(data: PaginationRequest): Promise<PaginatedResponse<Discount>> {
    return await httpClient.get<PaginatedResponse<Discount>>('/diskon', { params: data })
  }
  async getDiscountById(id: number): Promise<GeneralResponse<Discount>> {
    return await httpClient.get<GeneralResponse<Discount>>('/diskon/' + id)
  }

  async createDiscount(data: any): Promise<GeneralResponse<Discount>> {
    return await httpClient.post<GeneralResponse<Discount>>('/diskon', data)
  }
  async updateDiscount(data: any, id: number): Promise<GeneralResponse<Discount>> {
    return await httpClient.put<GeneralResponse<Discount>>(`/diskon/${id}`, data)
  }
  async deleteDiscount(id: number): Promise<GeneralResponse<Discount>> {
    return await httpClient.delete<GeneralResponse<Discount>>(`/diskon/${id}`)
  }
}

const discountsService = new DiscountsService()
export default discountsService
