<template>
  <Form id="argo-tariff-form" class="flex flex-col space-y-4" @submit="onSubmit">
    <ArgoTariffForm :form="tariffSetting" @update="tariffSetting = $event" />
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { onMounted, ref, type Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalStore } from '@/stores/modal'
import { useToasterStore } from '@/stores/toaster'
import tariffService from '@/services/drivers/tariff.api'
import { handleErrorResponse } from '@/utils/common'
import ArgoTariffForm from '../molecules/forms/ArgoTariffForm.vue'
import type { ArgoTariffSetting } from '@/types/Forms'
import type { ArgoTariff } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()
const toaster = useToasterStore()

const emits = defineEmits<{
  cardLoading: [cardLoading: boolean]
  buttonLoading: [buttonLoading: boolean]
}>()

const tariffSetting: Ref<ArgoTariffSetting> = ref({
  distance: 0,
  price: 0,
  minimumPrice: 0,
  pricePerMenit: 0
})

const cardLoading = ref(false)
const buttonLoading = ref(false)
const tariff = ref<ArgoTariff | null>(null)

const onSubmit = (): void => {
  modal.openConfirmationModal(t('message.save'))
  modal.onOk(() => {
    save()
  })
}

const save = async (): Promise<void> => {
  if (!tariff.value) return
  buttonLoading.value = true

  tariff.value.distance = tariffSetting.value.distance
  tariff.value.minimumPrice = tariffSetting.value.minimumPrice
  tariff.value.pricePerMenit = tariffSetting.value.pricePerMenit

  try {
    await tariffService.updateArgoTariff(tariff.value)
    toaster.success({ text: t('alert.successSave') })
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
}

const getTariff = async (): Promise<void> => {
  cardLoading.value = true
  try {
    const response = await tariffService.getArgoTariff(1)
    tariff.value = response.data
    tariffSetting.value.distance = response.data.distance
    tariffSetting.value.minimumPrice = response.data.minimumPrice
    tariffSetting.value.pricePerMenit = response.data.pricePerMenit
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    cardLoading.value = false
  }
}

watch(cardLoading, (val) => emits('cardLoading', val))
watch(buttonLoading, (val) => emits('buttonLoading', val))

onMounted(() => {
  getTariff()
})
</script>
