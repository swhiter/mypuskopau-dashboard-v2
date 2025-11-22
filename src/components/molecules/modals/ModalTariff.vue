<template>
  <ModalBaseWithHeader :title="`${title} ${t('title.tariffByDistanceData')}`" has-save-button :is-add="isAdd"
    :loading="modalLoading" :button-loading="buttonLoading" form="tariff-distance-form" :submitted="submitted">
    <Form id="tariff-distance-form" class="grid grid-cols-1 md:grid-cols-2 gap-2" @submit="submit">
      <div class="flex w-full space-x-2">
        <InputForm name="intervalMin" v-model="intervalMin" :label="t('names.intervalMin')" is-separate-row bordered
          suffix="km" :rules="{ 'required': true, 'numeric': true, 'no_overlap': true, 'smaller': true }"
          type="number" />
        <InputForm name="intervalMax" v-model="intervalMax" :label="t('names.intervalMax')" is-separate-row bordered
          suffix="km" :rules="{ 'required': true, 'numeric': true, 'no_overlap': true, 'bigger': true }"
          type="number" />
      </div>
      <InputForm name="price" v-model="price" :label="t('names.price')" is-separate-row bordered prefix="Rp"
        :rules="{ 'required': true, 'numeric': true }" type="number" />
      <InputForm v-if="props.tableType !== 'argo'" name="priceMulti" v-model="priceMulti" :label="t('names.priceMulti')"
        is-separate-row bordered prefix="Rp" :rules="{ 'required': true, 'numeric': true }" type="number" />
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { defineRule, Form } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import ModalBaseWithHeader from './ModalBaseWithHeader.vue';
import { onMounted, ref, type Ref } from 'vue';
import type { TariffByDistance } from '@/types/Data';
import InputForm from '@/components/atoms/InputForm.vue';
import tariffService from '@/services/drivers/tariff.api';
import { handleErrorResponse } from '@/utils/common';
import { useToasterStore } from '@/stores/toaster';

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  title: string
  id?: number
  readonly?: boolean
  isAdd?: boolean
  data: any[]
  tableType?: 'airport' | 'nonAirport' | 'argo'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  isAdd: false,
  tableType: 'airport'
})

const selectedData: Ref<TariffByDistance | null | undefined> = ref(null)
const intervalMin: Ref<number> = ref(0)
const intervalMax: Ref<number> = ref(0)
const price: Ref<number> = ref(0)
const priceMulti: Ref<number> = ref(0)

defineRule('bigger', (value: number) => {
  if (value < intervalMin.value) {
    return t('message.min_value', { field: t('names.intervalMax'), min: intervalMin.value })
  }
  return true
})

defineRule('smaller', (value: number) => {
  if (value > intervalMax.value) {
    return t('message.max_value', { field: t('names.intervalMin'), max: intervalMax.value })
  }
  return true
})

defineRule('no_overlap', (value: number) => {
  const nearestMin = props.data.reduce((prev: TariffByDistance, curr: TariffByDistance) => {
    return (Math.abs(curr.intervalMin - value) < Math.abs(prev.intervalMin - value) ? curr : prev)
  })
  const nearestMax = props.data.reduce((prev: TariffByDistance, curr: TariffByDistance) => {
    return (Math.abs(curr.intervalMax - value) < Math.abs(prev.intervalMax - value) ? curr : prev)
  })
  if (
    (nearestMin.intervalMin <= value && value <= nearestMin.intervalMax) ||
    (nearestMax.intervalMin <= value && value <= nearestMax.intervalMax)
  ) {
    if (props.id) {
      const checkSelfMin = props.id == nearestMin.id
      const checkSelfMax = props.id == nearestMax.id
      if (
        (checkSelfMin && (nearestMin.intervalMin <= value && value <= nearestMin.intervalMax)) ||
        (checkSelfMax && (nearestMax.intervalMin <= value && value <= nearestMax.intervalMax))
      ) {
        return true
      }
    }
    return t('message.overlap')
  }
  return true
})

const modalLoading: Ref<boolean> = ref(false)
const buttonLoading: Ref<boolean> = ref(false)
const submitted: Ref<boolean> = ref(false)

const read = (): void => {
  if (props.id) {
    modalLoading.value = true
    selectedData.value = props.data.find((item) => item.id === props.id)
    if (selectedData.value) {
      intervalMin.value = selectedData.value.intervalMin
      intervalMax.value = selectedData.value.intervalMax
      price.value = selectedData.value.price

      // HANYA JIKA BUKAN ARGO
      if (props.tableType !== 'argo') {
        priceMulti.value = selectedData.value.priceMulti ?? 0
      }
    }
    modalLoading.value = false
  }
}

const submit = async (): Promise<void> => {
  const basePayload = {
    intervalMin: parseFloat(intervalMin.value.toString()),
    intervalMax: parseFloat(intervalMax.value.toString()),
    price: parseFloat(price.value.toString())
  }

  // untuk bandara & non bandara: ada priceMulti
  const payloadWithMulti = {
    ...basePayload,
    priceMulti: parseFloat(priceMulti.value.toString())
  }

  buttonLoading.value = true
  try {
    if (props.id) {
      // UPDATE
      if (props.tableType === 'airport') {
        await tariffService.updateTariffByRange(payloadWithMulti, props.id)
      } else if (props.tableType === 'nonAirport') {
        await tariffService.updateTariffByRangeNon(payloadWithMulti, props.id)
      } else if (props.tableType === 'argo') {
        await tariffService.updateArgoTariffByRange(basePayload, props.id)
      }
    } else {
      // INSERT
      if (props.tableType === 'airport') {
        await tariffService.createTariffByRange(payloadWithMulti)
      } else if (props.tableType === 'nonAirport') {
        await tariffService.createTariffByRangeNon(payloadWithMulti)
      } else if (props.tableType === 'argo') {
        await tariffService.createArgoTariffByRange(basePayload)
      }
    }

    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
}

onMounted(() => {
  read()
})
</script>