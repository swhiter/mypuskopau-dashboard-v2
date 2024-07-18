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

  return { token, setCredentials, clearCredentials }
})
