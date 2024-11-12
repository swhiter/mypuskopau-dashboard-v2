<template>
  <PageInnerCard :title="$t('title.tariffSetting')">
    <InputForm name="minimumPrice" :label="`${$t('names.minimumPrice')} (Rp)`" v-model="form.minimumPrice"
      is-separate-row bordered :rules="{ required: true }" prefix="Rp" type="number" />
    <InputForm name="distance" :label="`${$t('names.distance')} (km)`" v-model="form.distance" is-separate-row bordered
      :rules="{ required: true, 'not_in_tbd': true }" suffix="km" type="number" />
    <!-- <InputForm name="argo" :label="`${$t('names.argo')} (Rp)`" v-model="form.price" is-separate-row bordered
      :rules="{ required: true }" prefix="Rp" type="number" /> -->
  </PageInnerCard>
</template>

<script setup lang="ts">
import InputForm from '@/components/atoms/InputForm.vue';
import PageInnerCard from '@/components/atoms/PageInnerCard.vue';
import { tariffState } from '@/injects/keys';
import type { TariffByDistance } from '@/types/Data';
import type { TariffSetting } from '@/types/Forms';
import { defineRule } from 'vee-validate';
import { inject, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

interface Props {
  form: TariffSetting
}

const props = defineProps<Props>()

const emits = defineEmits<{
  update: [form: TariffSetting]
}>()

const { form } = toRefs(props)

watch(form, (newValue, oldValue) => {
  if (newValue.distance !== oldValue.distance || newValue.price !== oldValue.price) {
    emits('update', newValue)
  }
}, { deep: true })

const parentTariffByDistance = inject(tariffState)

defineRule('not_in_tbd', (value: number) => {
  if (parentTariffByDistance?.data.value && parentTariffByDistance.data.value.length != 0) {
    const nearestMin = parentTariffByDistance.data.value.reduce((prev: TariffByDistance, curr: TariffByDistance) => {
      return (Math.abs(curr.intervalMin - value) < Math.abs(prev.intervalMin - value) ? curr : prev)
    })
    const nearestMax = parentTariffByDistance.data.value.reduce((prev: TariffByDistance, curr: TariffByDistance) => {
      return (Math.abs(curr.intervalMax - value) < Math.abs(prev.intervalMax - value) ? curr : prev)
    })
    if (
      (nearestMin.intervalMin <= value && value <= nearestMin.intervalMax) ||
      (nearestMax.intervalMin <= value && value <= nearestMax.intervalMax)
    ) {
      return t('message.overlap_min_distance')
    }
    return true
  }
  return true
})
</script>