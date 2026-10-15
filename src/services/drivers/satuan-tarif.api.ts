import type { SatuanTarif } from '@/types/Data'
import type { GeneralResponse } from '@/types/Main'
import httpClient from '../httpClient'

class SatuanTarifService {
  async getSatuanTarif(): Promise<GeneralResponse<SatuanTarif[]>> {
    return await httpClient.get<GeneralResponse<SatuanTarif[]>>('/satuan-tarif')
  }

  // Satuan yang sedang dikonfigurasi di halaman Manajemen Tarif / Tarif Argo
  async setActiveConfig(id: number): Promise<GeneralResponse<SatuanTarif>> {
    return await httpClient.post<GeneralResponse<SatuanTarif>>(
      `/satuan-tarif/${id}/active-config`,
      {}
    )
  }

  // Satuan yang dipakai untuk perhitungan harga (divalidasi kelengkapan tarif oleh backend)
  async implement(id: number): Promise<GeneralResponse<SatuanTarif>> {
    return await httpClient.post<GeneralResponse<SatuanTarif>>(`/satuan-tarif/${id}/implement`, {})
  }
}

const satuanTarifService = new SatuanTarifService()
export default satuanTarifService
