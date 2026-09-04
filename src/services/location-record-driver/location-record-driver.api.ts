import type { UnfinishedTrip } from '@/types/Data'
import type { PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'

class LocationRecordDriverService {
  async getUnfinishedTrips(data: Partial<PaginationRequest>): Promise<PaginatedResponse<UnfinishedTrip>> {
    return await httpClient.get<PaginatedResponse<UnfinishedTrip>>('/location-record-driver/unfinished', {
      params: data
    })
  }
}

const locationRecordDriverService = new LocationRecordDriverService()
export default locationRecordDriverService
