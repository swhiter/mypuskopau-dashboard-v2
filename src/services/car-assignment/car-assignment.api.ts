import type { ActiveCarAssignment } from '@/types/Data'
import type { GeneralResponse } from '@/types/Main'
import httpClient from '../httpClient'

class CarAssignmentService {
  async getActive(): Promise<GeneralResponse<ActiveCarAssignment[]>> {
    return await httpClient.get<GeneralResponse<ActiveCarAssignment[]>>('/car-assignment/active')
  }
  async release(id: number): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number }>>(`/car-assignment/${id}/release`, {})
  }
}

const carAssignmentService = new CarAssignmentService()
export default carAssignmentService
