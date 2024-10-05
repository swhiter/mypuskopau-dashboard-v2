import type { Tariff, TariffByDistance } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'

class TariffService {
  async getTariffById(id: number): Promise<GeneralResponse<Tariff>> {
    return await httpClient.get<GeneralResponse<Tariff>>('/tariff/' + id)
  }
  async updateTariff(data: Tariff): Promise<GeneralResponse<Tariff>> {
    return await httpClient.put<GeneralResponse<Tariff>>('/tariff/' + data.id, data)
  }
  async getTariffByRange(data: PaginationRequest): Promise<PaginatedResponse<TariffByDistance>> {
    return await httpClient.get<PaginatedResponse<TariffByDistance>>('/tariff/range/get', {
      params: data
    })
  }
  async createTariffByRange(data: any): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.post<GeneralResponse<TariffByDistance>>('/tariff/range/insert', data)
  }
  async updateTariffByRange(data: any, id: number): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.put<GeneralResponse<TariffByDistance>>(
      `/tariff/range/update/${id}`,
      data
    )
  }
  async deleteTariffByRange(id: number): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.delete<GeneralResponse<TariffByDistance>>(`/tariff/range/update/${id}`)
  }
}

const tariffService = new TariffService()
export default tariffService
