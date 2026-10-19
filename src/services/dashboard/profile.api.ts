import type { GeneralResponse } from '@/types/Main'
import type { AxiosRequestConfig } from 'axios'
import httpClient from '../httpClient'
import { resizeImagesInForm } from '@/utils/image-resize'

class ProfileService {
  private config: AxiosRequestConfig

  constructor() {
    this.config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  }

  async updateProfile(data: FormData, id: number): Promise<GeneralResponse<any>> {
    return await httpClient.put<GeneralResponse<any>>('/admin/' + id, await resizeImagesInForm(data), this.config)
  }
}

const profileService = new ProfileService()
export default profileService
