import { defineStore } from 'pinia'
import { extend } from '@vue/shared'
import ModalConfirm from '@/components/molecules/modals/ModalConfirm.vue'

const basicState = { component: null, props: {} }

const component = extend({})
type VueComponent = InstanceType<typeof component>

interface ModalProps {
  component: null | VueComponent
  props?: object
}

interface ModalState {
  modalState: ModalProps
  onOkCallback: (() => void) | null
  onCancelCallback: (() => void) | null
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    modalState: basicState,
    onOkCallback: null,
    onCancelCallback: null
  }),
  actions: {
    openModal(payload: ModalProps) {
      const { props, component } = payload

      // Prevent Scrolling
      const body = document.body
      if (body) body.style.overflow = 'hidden'

      this.modalState = { component, props: props || {} }
    },
    closeModal() {
      this.modalState = basicState

      // Revent Scrolling Prevention
      const body = document.body
      if (body) body.style.overflow = 'auto'
    },
    openConfirmationModal(message: string) {
      this.openModal({ component: ModalConfirm, props: { message: message } })
    },
    onOk(callback?: () => void) {
      if (callback) {
        this.onOkCallback = callback
      }
      return this
    },
    onCancel(callback?: () => void) {
      if (callback) {
        this.onCancelCallback = callback
      }
      return this
    },
    okClicked() {
      if (this.onOkCallback) {
        this.onOkCallback()
      }
      this.closeModal()
      return this
    },
    cancelClicked() {
      if (this.onCancelCallback) {
        this.onCancelCallback()
      }
      this.closeModal()
      return this
    }
  },
  getters: {}
})
