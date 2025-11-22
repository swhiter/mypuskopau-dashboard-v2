import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'
import type { Transaction } from '@/types/Data'
export interface CreateOrderPayload {
  customerEmail: string
  customerName: string
  customerPhone: string
  driverID: number | string
  carType: number
  orderDetail: {
    pickupAddress: string
    destinationAddress: string
    distance: number
    latitudeDestination: string
    latitudeStart: string | number
    longitudeDestination: string
    longitudeStart: string | number
    paymentMethod: string
    vaAccount: string
    price: number
    chargePassenger: number
    discount: number
  }
  staffId: number | string
}
export interface CreateOrderResponseData {
  data: any
}
class OrderService {
  async getOrders(data: Partial<PaginationRequest>): Promise<PaginatedResponse<Transaction>> {
    return await httpClient.get<PaginatedResponse<Transaction>>('/order', { params: data })
  }
  async getOrderByTrxId(trxId: string): Promise<GeneralResponse<Transaction>> {
    return await httpClient.get<GeneralResponse<Transaction>>('/order/' + trxId)
  }
   async createOrder(
    payload: CreateOrderPayload
  ): Promise<GeneralResponse<any>> {
    return await httpClient.post<GeneralResponse<any>>('/order/', payload)
  }
}

const orderService = new OrderService()
export default orderService
