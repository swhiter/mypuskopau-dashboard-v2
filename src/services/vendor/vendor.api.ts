import type { Vendor } from '@/types/Data'
import type { GeneralResponse } from '@/types/Main'
import httpClient from '../httpClient'

class VendorService {
  async getVendors(activeOnly = false): Promise<GeneralResponse<Vendor[]>> {
    return await httpClient.get<GeneralResponse<Vendor[]>>('/vendor', {
      params: { activeOnly }
    })
  }

  async createVendor(data: { name: string }): Promise<GeneralResponse<Vendor>> {
    return await httpClient.post<GeneralResponse<Vendor>>('/vendor', data)
  }

  async updateVendor(
    id: number,
    data: Partial<Pick<Vendor, 'name' | 'isActive'>>
  ): Promise<GeneralResponse<Vendor>> {
    return await httpClient.put<GeneralResponse<Vendor>>('/vendor/' + id, data)
  }

  async deleteVendor(id: number): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.delete<GeneralResponse<{ id: number }>>('/vendor/' + id)
  }
}

const vendorService = new VendorService()
export default vendorService
