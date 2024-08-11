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
  buttonLoading.value = true
  tariff.value!.distance = tariffSetting.value.distance
  tariff.value!.price = tariffSetting.value.price
  tariff.value!.minimumPrice = tariffSetting.value.minimumPrice
  try {
    await tariffService.updateTariff(tariff.value as Tariff)
    buttonLoading.value = false
    toaster.success({ text: 'Sukses' })
  } catch (error) {
    buttonLoading.value = false
    console.error(error)
  }
}

const getTariff = async (): Promise<void> => {
  cardLoading.value = true
  try {
    const response = await tariffService.getTariffById(1)
    tariff.value = response.data
    tariffSetting.value.distance = tariff.value.distance
    tariffSetting.value.price = tariff.value.price
    tariffSetting.value.minimumPrice = (typeof tariff.value.minimumPrice == 'string') ? parseInt(tariff.value.minimumPrice) : tariff.value.minimumPrice
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