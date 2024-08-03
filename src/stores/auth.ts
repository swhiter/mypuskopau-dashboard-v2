import router from '@/router'
import authenticationService from '@/services/authentications/authentications.api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)

  function setCredentials(newToken: string): void {
    token.value = newToken
  }

  function clearCredentials(): void {
    token.value = null
  }

  async function logout(): Promise<void> {
    await authenticationService.logout()
    clearCredentials()
    router.push('/login')
  }

  return { token, setCredentials, clearCredentials, logout }
})
