import { defineStore } from 'pinia'
import { extend } from '@vue/shared'
import { ref } from 'vue'

const component = extend({})
type VueComponent = InstanceType<typeof component>

export interface ModalProps {
  component: VueComponent | null
  props?: object
}

const basicState: ModalProps = { component: null, props: {} }

export const useModalStore = defineStore('modal', () => {
  const modalState = ref<ModalProps>(basicState)

  function openModal(payload: ModalProps) {
    const { component, props } = payload
    modalState.value = { component, props: props || {} }
  }

  function closeModal() {
    modalState.value = basicState
  }

  return { modalState, openModal, closeModal }
})
