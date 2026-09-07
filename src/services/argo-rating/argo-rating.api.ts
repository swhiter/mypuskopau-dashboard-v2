import type { GeneralResponse, PaginatedResponse, PaginationRequest } from '@/types/Main'
import type { ArgoReview, TripRatingInfo } from '@/types/Data'
import httpClient from '../httpClient'

interface SubmitArgoRatingPayload {
  transactionNumber: string
  rating: number
  review?: string
}

class ArgoRatingService {
  // Publik, dibuka lewat scan QR tanpa login
  async getTripInfo(transactionNumber: string): Promise<GeneralResponse<TripRatingInfo>> {
    return await httpClient.get<GeneralResponse<TripRatingInfo>>(
      `/rating-driver-argo/trip/${transactionNumber}`
    )
  }

  // Publik, dibuka lewat scan QR tanpa login
  async submitRating(data: SubmitArgoRatingPayload): Promise<GeneralResponse<any>> {
    return await httpClient.post<GeneralResponse<any>>('/rating-driver-argo', data)
  }

  // Admin (butuh login)
  async getAllReviews(data: Partial<PaginationRequest>): Promise<PaginatedResponse<ArgoReview>> {
    return await httpClient.get<PaginatedResponse<ArgoReview>>('/rating-driver-argo/reviews', {
      params: data
    })
  }
}

const argoRatingService = new ArgoRatingService()
export default argoRatingService
