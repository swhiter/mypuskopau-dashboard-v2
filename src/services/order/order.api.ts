import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'
import type { Transaction } from '@/types/Data'

class OrderService {
  async getOrders(data: Partial<PaginationRequest>): Promise<PaginatedResponse<Transaction>> {
    return await httpClient.get<PaginatedResponse<Transaction>>('/order', { params: data })
  }
  async getOrderById(id: number): Promise<GeneralResponse<Transaction>> {
    return await httpClient.get<GeneralResponse<Transaction>>('/order/' + id)
  }
}

const orderService = new OrderService()
export default orderService
