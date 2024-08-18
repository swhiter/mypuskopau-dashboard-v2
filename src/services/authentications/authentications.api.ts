import type UserCredential from '@/types/Credential'
import httpClient from '../httpClient'
import type { GeneralResponse } from '@/types/Main'
import type { UserAccessInfo } from '@/types/Forms'

class AuthenticationService {
  async login(data: any): Promise<GeneralResponse<UserCredential>> {
    return await httpClient.post<GeneralResponse<UserCredential>>('/auth/login', data)
  }
  async generateStaffUsername(data: any): Promise<GeneralResponse<UserAccessInfo>> {
    return await httpClient.post<GeneralResponse<UserAccessInfo>>(
      '/auth/staff/generateuserid',
      data
    )
  }
  async generateDriverUsername(data: any): Promise<GeneralResponse<UserAccessInfo>> {
    return await httpClient.post<GeneralResponse<UserAccessInfo>>(
      '/auth/driver/generateuserid',
      data
    )
  }
  async logout(): Promise<GeneralResponse<any>> {
    return await httpClient.post<GeneralResponse<any>>('/auth/logout', { test: 'logout' })
  }
  async changePassword(data: any, userId: string): Promise<GeneralResponse<unknown>> {
    return await httpClient.put<GeneralResponse<unknown>>(`/auth/${userId}/updatepassword`, data)
  }
}

const authenticationService = new AuthenticationService()
export default authenticationService
