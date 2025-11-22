import type {
  Tariff,
  TariffByDistance,
  ArgoTariff,
  ArgoTariffByDistance
} from '@/types/Data'
import type {
  GeneralResponse,
  PaginatedResponse,
  PaginationRequest
} from '@/types/Main'
import httpClient from '../httpClient'

class TariffService {
  // =======================
  // TARIF MINIMUM (UMUM)
  // =======================
  async getTariffById(id: number): Promise<GeneralResponse<Tariff>> {
    return await httpClient.get<GeneralResponse<Tariff>>('/tariff/' + id)
  }

  async updateTariff(data: Tariff): Promise<GeneralResponse<Tariff>> {
    return await httpClient.put<GeneralResponse<Tariff>>('/tariff/' + data.id, data)
  }

  // =======================
  // RENTANG BANDARA
  // =======================
  async getTariffByRange(
    data: PaginationRequest
  ): Promise<PaginatedResponse<TariffByDistance>> {
    return await httpClient.get<PaginatedResponse<TariffByDistance>>('/tariff/range/get', {
      params: data
    })
  }
  async createTariffByRange(data: any): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.post<GeneralResponse<TariffByDistance>>('/tariff/range/insert', data)
  }
  async updateTariffByRange(
    data: any,
    id: number
  ): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.put<GeneralResponse<TariffByDistance>>(
      `/tariff/range/update/${id}`,
      data
    )
  }
  async deleteTariffByRange(id: number): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.delete<GeneralResponse<TariffByDistance>>(`/tariff/range/update/${id}`)
  }

  // =======================
  // RENTANG NON BANDARA
  // =======================
  async getTariffByRangeNon(
    data: PaginationRequest
  ): Promise<PaginatedResponse<TariffByDistance>> {
    return await httpClient.get<PaginatedResponse<TariffByDistance>>('/tariff/range/getnon', {
      params: data
    })
  }
  async createTariffByRangeNon(data: any): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.post<GeneralResponse<TariffByDistance>>('/tariff/range/insertnon', data)
  }
  async updateTariffByRangeNon(
    data: any,
    id: number
  ): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.put<GeneralResponse<TariffByDistance>>(
      `/tariff/range/updatenon/${id}`,
      data
    )
  }
  async deleteTariffByRangeNon(id: number): Promise<GeneralResponse<TariffByDistance>> {
    return await httpClient.delete<GeneralResponse<TariffByDistance>>(
      `/tariff/range/deletenon/${id}`
    )
  }

  // =======================
  // TARIF ARGO - MINIMUM
  // =======================
  async getArgoTariff(id: number): Promise<GeneralResponse<ArgoTariff>> {
    return await httpClient.get<GeneralResponse<ArgoTariff>>('/tariff-argo/' + id)
  }

  async updateArgoTariff(data: ArgoTariff): Promise<GeneralResponse<ArgoTariff>> {
    return await httpClient.put<GeneralResponse<ArgoTariff>>('/tariff-argo/' + data.id, data)
  }

  // =======================
  // TARIF ARGO - RENTANG
  // =======================
  async getArgoTariffByRange(
    data: PaginationRequest
  ): Promise<PaginatedResponse<ArgoTariffByDistance>> {
    return await httpClient.get<PaginatedResponse<ArgoTariffByDistance>>(
      '/tariff-argo/range/get',
      { params: data }
    )
  }

  async createArgoTariffByRange(
    data: any
  ): Promise<GeneralResponse<ArgoTariffByDistance>> {
    return await httpClient.post<GeneralResponse<ArgoTariffByDistance>>(
      '/tariff-argo/range/insert',
      data
    )
  }

  async updateArgoTariffByRange(
    data: any,
    id: number
  ): Promise<GeneralResponse<ArgoTariffByDistance>> {
    return await httpClient.put<GeneralResponse<ArgoTariffByDistance>>(
      `/tariff-argo/range/update/${id}`,
      data
    )
  }

  async deleteArgoTariffByRange(
    id: number
  ): Promise<GeneralResponse<ArgoTariffByDistance>> {
    return await httpClient.delete<GeneralResponse<ArgoTariffByDistance>>(
      `/tariff-argo/range/delete/${id}`
    )
  }
}

const tariffService = new TariffService()
export default tariffService
