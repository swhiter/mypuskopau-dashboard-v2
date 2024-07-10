import type UserCredential from '@/types/Credential'
import httpClient from '../httpClient'

class AuthenticationService {
  async login(data: any): Promise<UserCredential> {
    return await httpClient.post<UserCredential>('/auth/login', data)
  }
}

const authenticationService = new AuthenticationService()
export default authenticationService
