import { defineStore } from 'pinia'
import { reactive } from 'vue'

export type TToastStatus = 'success' | 'info' | 'warning' | 'error'
type TToastPayload = { text: string; timeout?: number }

interface IToast {
  text: string
  status: TToastStatus
  id: number
}

const defaultTimeout: number = 2000

const createToast = (text: string, status: TToastStatus): IToast => ({
  text,
  status,
  id: Math.random() * 1000
})

export const useToasterStore = defineStore('toaster', () => {
  const state = reactive({
    toasts: [] as IToast[]
  })

  function updateState(payload: TToastPayload, status: TToastStatus) {
    const { text, timeout } = payload
    const toast = createToast(text, status)

    state.toasts.push(toast)

    setTimeout(() => {
      state.toasts = state.toasts.filter((t) => t.id !== toast.id)
    }, timeout ?? defaultTimeout)
  }

  function success(payload: TToastPayload) {
    updateState(payload, 'success')
  }

  function info(payload: TToastPayload) {
    updateState(payload, 'info')
  }

  function warning(payload: TToastPayload) {
    updateState(payload, 'warning')
  }

  function error(payload: TToastPayload) {
    updateState(payload, 'error')
  }

  return { state, updateState, success, info, warning, error }
})
