<template>
  <Form id="tariff-form" class="flex flex-col space-y-4" @submit="onSubmit()">
    <TariffForm :form="tariffSetting" @update="tariffSetting = $event" />
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate';
import TariffForm from '../molecules/forms/TariffForm.vue';
import type { TariffSetting } from '@/types/Forms';
import { onMounted, ref, watch, type Ref } from 'vue';
import tariffService from '@/services/drivers/tariff.api';
import type { Tariff } from '@/types/Data';
import { useToasterStore } from '@/stores/toaster';
import { handleErrorResponse } from '@/utils/common';
import { useModalStore } from '@/stores/modal';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const modal = useModalStore()
const toaster = useToasterStore()

const emits = defineEmits<{
  cardLoading: [cardLoading: boolean],
  buttonLoading: [buttonLoading: boolean]
}>()

const tariffSetting: Ref<TariffSetting> = ref({
  distance: 0,
  price: 0,
  minimumPrice: 0
})

const cardLoading: Ref<boolean> = ref(false)
const buttonLoading: Ref<boolean> = ref(false)
const tariff: Ref<Tariff | null> = ref(null)

const onSubmit = async (): Promise<void> => {
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
      tariff.value.price = tariffSetting.value.price
      tariff.value.minimumPrice = tariffSetting.value.minimumPrice
      await tariffService.updateTariff(tariff.value)
    } else {
      // Satuan yang dikonfigurasi belum punya tarif minimum -> buat baru
      const response = await tariffService.createTariff({
        distance: Number(tariffSetting.value.distance),
        price: Number(tariffSetting.value.price),
        minimumPrice: Number(tariffSetting.value.minimumPrice),
        pricePerMenit: 0
      })
      tariff.value = response.data
    }
    buttonLoading.value = false
    toaster.success({ text: 'Sukses' })
  } catch (error) {
    buttonLoading.value = false
    handleErrorResponse(error)
  }
}

const getTariff = async (): Promise<void> => {
  cardLoading.value = true
  try {
    // Tarif minimum milik satuan yang sedang dikonfigurasi (bisa belum ada)
    const response = await tariffService.getTariffs()
    tariff.value = response.data[0] ?? null
    if (tariff.value) {
      tariffSetting.value.distance = tariff.value.distance
      tariffSetting.value.price = tariff.value.price
      tariffSetting.value.minimumPrice = (typeof tariff.value.minimumPrice == 'string') ? parseInt(tariff.value.minimumPrice) : tariff.value.minimumPrice
    }
    cardLoading.value = false
  } catch (error) {
    cardLoading.value = false
    handleErrorResponse(error)
  }
}

// Watcher untuk loading
watch(cardLoading, (newValue) => {
  emits('cardLoading', newValue)
})
watch(buttonLoading, (newValue) => {
  emits('buttonLoading', newValue)
})

onMounted(() => {
  getTariff()
})
</script>