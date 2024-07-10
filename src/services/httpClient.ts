import { useAuthStore } from '@/stores/auth'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

class HttpClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_ENDPOINT,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.client.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        if (authStore.token) {
          config.headers!.Authorization = `Bearer ${authStore.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  private handleResponse<T>(response: AxiosResponse): T {
    return response.data
  }

  private handleError(error: any): never {
    throw new Error(error.response?.data?.message || 'An unknown error occured')
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config)
      return this.handleResponse(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config)
      return this.handleResponse(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config)
      return this.handleResponse(response)
    } catch (error) {
      this.handleError(error)
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config)
      return this.handleResponse(response)
    } catch (error) {
      this.handleError(error)
    }
  }
}

const httpClient = new HttpClient()
export default httpClient
