import router from '@/router'
import authenticationService from '@/services/authentications/authentications.api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useModalStore } from './modal'
import { getCurrentUser } from '@/utils/common'

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
    const user = getCurrentUser()
    const currentTime = Date.now()
    if (user.exp && user.exp! > currentTime) {
      await authenticationService.logout()
    }
    modal.closeModal()
    clearCredentials()
    router.push('/login')
  }

  return { token, setCredentials, clearCredentials, logout }
})
