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
  buttonLoading.value = true

  try {
    if (tariff.value) {
      tariff.value.distance = tariffSetting.value.distance
      tariff.value.minimumPrice = tariffSetting.value.minimumPrice
      tariff.value.pricePerMenit = tariffSetting.value.pricePerMenit
      await tariffService.updateArgoTariff(tariff.value)
    } else {
      // Satuan yang dikonfigurasi belum punya tarif minimum argo -> buat baru
      const response = await tariffService.createArgoTariff({
        distance: Number(tariffSetting.value.distance),
        price: Number(tariffSetting.value.price),
        minimumPrice: Number(tariffSetting.value.minimumPrice),
        pricePerMenit: Number(tariffSetting.value.pricePerMenit)
      })
      tariff.value = response.data
    }
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
    // Tarif minimum argo milik satuan yang sedang dikonfigurasi (bisa belum ada)
    const response = await tariffService.getArgoTariffs()
    tariff.value = response.data[0] ?? null
    if (tariff.value) {
      tariffSetting.value.distance = tariff.value.distance
      tariffSetting.value.minimumPrice = tariff.value.minimumPrice
      tariffSetting.value.pricePerMenit = tariff.value.pricePerMenit
    }
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
