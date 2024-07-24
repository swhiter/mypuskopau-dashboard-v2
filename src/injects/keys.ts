import type { InjectionKey, Ref } from 'vue'

interface FormState {
  loading: Ref<boolean>
  submitted: Ref<boolean>
  updateLoadingState: () => void
  updateSubmittedState: () => void
}

export const formState = Symbol() as InjectionKey<FormState>
