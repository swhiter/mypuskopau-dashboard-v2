import type { GeneralResponse } from '@/types/Main'
import httpClient from '../httpClient'

export interface RitaseRow {
  date: string
  unitOps: number
  ritase: number
  potongan: number
  pendapatanBersih: number
  pendapatanKotor: number
  rataRata: number
  keterangan: string
}

export interface RitaseTotal {
  unitOps: number
  ritase: number
  potongan: number
  pendapatanBersih: number
  pendapatanKotor: number
  rataRata: number
}

export interface RitaseReport {
  startDate: string
  endDate: string
  carCategory: string | null
  rows: RitaseRow[]
  total: RitaseTotal
}

export interface RitaseParams {
  startDate: string
  endDate: string
  carCategory?: string
}

class RitaseReportService {
  async getRitase(params: RitaseParams): Promise<GeneralResponse<RitaseReport>> {
    return await httpClient.get<GeneralResponse<RitaseReport>>('/report/ritase', { params })
  }
}

const ritaseReportService = new RitaseReportService()
export default ritaseReportService
