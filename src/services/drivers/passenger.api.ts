import type { Passenger } from '@/types/Data'
import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import httpClient from '../httpClient'
import type { AxiosRequestConfig } from 'axios'

class PassengersService {
 
  async getPassengers(data: PaginationRequest): Promise<PaginatedResponse<Passenger>> {
    return await httpClient.get<PaginatedResponse<Passenger>>('/passenger', { params: data })
  }
  async getPassengerById(id: number): Promise<GeneralResponse<Passenger>> {
    return await httpClient.get<GeneralResponse<Passenger>>('/passenger/' + id)
  }

  async createPassenger(data: any): Promise<GeneralResponse<Passenger>> {
    return await httpClient.post<GeneralResponse<Passenger>>('/passenger', data)
  }
  async updatePassenger(data: any, id: number): Promise<GeneralResponse<Passenger>> {
    return await httpClient.put<GeneralResponse<Passenger>>(`/passenger/${id}`, data)
  }
  async deletePassenger(id: number): Promise<GeneralResponse<Passenger>> {
    return await httpClient.delete<GeneralResponse<Passenger>>(`/passenger/${id}`)
  }
}

const passengersService = new PassengersService()
export default passengersService
