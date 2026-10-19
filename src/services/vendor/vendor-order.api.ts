import type { VendorOrder } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse } from '@/types/Main'
import type { AxiosRequestConfig } from 'axios'
import httpClient from '../httpClient'
import { RECEIPT_MAX_DIMENSION, resizeImagesInForm } from '@/utils/image-resize'

export interface VendorOrderListParams {
  page: number
  limit: number
  search?: string
  vendorId?: number | ''
  startDate?: string
  endDate?: string
}

type SavedVendorOrder = { id: number; transactionNumber: string }

const multipart: AxiosRequestConfig = {
  headers: { 'Content-Type': 'multipart/form-data' }
}

class VendorOrderService {
  async getVendorOrders(params: VendorOrderListParams): Promise<PaginatedResponse<VendorOrder>> {
    return await httpClient.get<PaginatedResponse<VendorOrder>>('/vendor-order', { params })
  }

  async getVendorOrder(id: number): Promise<GeneralResponse<VendorOrder>> {
    return await httpClient.get<GeneralResponse<VendorOrder>>('/vendor-order/' + id)
  }

  async createVendorOrder(
    data: FormData
  ): Promise<GeneralResponse<SavedVendorOrder>> {
    return await httpClient.post<GeneralResponse<SavedVendorOrder>>('/vendor-order', await resizeImagesInForm(data, RECEIPT_MAX_DIMENSION), multipart)
  }

  async updateVendorOrder(
    id: number,
    data: FormData
  ): Promise<GeneralResponse<SavedVendorOrder>> {
    return await httpClient.put<GeneralResponse<SavedVendorOrder>>('/vendor-order/' + id, await resizeImagesInForm(data, RECEIPT_MAX_DIMENSION), multipart)
  }

  async deleteVendorOrder(id: number): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.delete<GeneralResponse<{ id: number }>>('/vendor-order/' + id)
  }

  // Foto struk ber-guard token: diambil sebagai blob, bukan lewat <img src> langsung
  async getVendorOrderPhoto(id: number): Promise<Blob> {
    return await httpClient.get<Blob>(`/vendor-order/${id}/photo`, { responseType: 'blob' })
  }
}

const vendorOrderService = new VendorOrderService()
export default vendorOrderService
