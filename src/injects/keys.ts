import type { TariffByDistance } from '@/types/Data'
import type { InjectionKey, Ref } from 'vue'

interface FormState {
  loading: Ref<boolean>
  submitted: Ref<boolean>
  updateLoadingState: () => void
  updateSubmittedState: () => void
}

interface TariffState {
  data: Ref<TariffByDistance[]>
  updateData: (data: TariffByDistance[]) => void
}

export const formState = Symbol() as InjectionKey<FormState>
export const tariffState = Symbol() as InjectionKey<TariffState>
