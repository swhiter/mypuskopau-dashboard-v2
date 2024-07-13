import { defineStore } from 'pinia'

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

export const useToasterStore = defineStore('toaster', {
  state: (): { toasts: IToast[] } => ({
    toasts: []
  }),
  actions: {
    updateState(payload: TToastPayload, status: TToastStatus) {
      const { text, timeout } = payload
      const toast = createToast(text, status)

      this.toasts.push(toast)

      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== toast.id)
      }, timeout ?? defaultTimeout)
    },
    success(payload: TToastPayload) {
      this.updateState(payload, 'success')
    },
    info(payload: TToastPayload) {
      this.updateState(payload, 'info')
    },
    warning(payload: TToastPayload) {
      this.updateState(payload, 'warning')
    },
    error(payload: TToastPayload) {
      this.updateState(payload, 'error')
    }
  }
})
