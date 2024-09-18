import type { JwtPayload } from 'jwt-decode'

export default interface UserCredential {
  token: string
}

interface UserDetail {
  id: number
  userId: string
  firstName: string
  lastName: string
  nik: string
  photo: string
  createdAt: string
  updatedAt: string
}

export interface ExtJwtPayload extends JwtPayload {
  userDetail: UserDetail
}
