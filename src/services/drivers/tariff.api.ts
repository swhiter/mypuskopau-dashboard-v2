import type { Tariff } from '@/types/Data'
import type { GeneralResponse } from '@/types/Main'
import httpClient from '../httpClient'

class TariffService {
  async getTariffById(id: number): Promise<GeneralResponse<Tariff>> {
    return await httpClient.get<GeneralResponse<Tariff>>('/tariff/' + id)
  }
  async updateTariff(data: Tariff): Promise<GeneralResponse<Tariff>> {
    return await httpClient.put<GeneralResponse<Tariff>>('/tariff/' + data.id, data)
  }
}

const tariffService = new TariffService()
export default tariffService
