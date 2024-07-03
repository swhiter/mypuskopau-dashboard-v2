import { defineStore } from 'pinia'

interface AuthState {
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null
  }),
  actions: {
    setCredentials(token: string): void {
      this.token = token
    },
    clearCredentials(): void {
      this.token = null
    }
  }
})
