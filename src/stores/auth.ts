import router from '@/router'
import authenticationService from '@/services/authentications/authentications.api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useModalStore } from './modal'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const modal = useModalStore()

  function setCredentials(newToken: string): void {
    token.value = newToken
  }

  function clearCredentials(): void {
    token.value = null
  }

  async function logout(): Promise<void> {
    await authenticationService.logout()
    clearCredentials()
    modal.closeModal()
    router.push('/login')
  }

  return { token, setCredentials, clearCredentials, logout }
})
