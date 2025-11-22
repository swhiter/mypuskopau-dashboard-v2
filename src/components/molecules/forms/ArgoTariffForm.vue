<template>
  <PageInnerCard :title="$t('title.argoTariffSetting')">
    <InputForm
      name="distance"
      :label="`${$t('names.distance')} (km)`"
      v-model="form.distance"
      is-separate-row
      bordered
      :rules="{ required: true }"
      suffix="km"
      type="number"
    />

    <InputForm
      name="minimumPrice"
      :label="`${$t('names.minimumPrice')} (Rp)`"
      v-model="form.minimumPrice"
      is-separate-row
      bordered
      :rules="{ required: true }"
      prefix="Rp"
      type="number"
    />

    <InputForm
      name="pricePerMenit"
      :label="`${$t('names.pricePerMinute')} (Rp/menit)`"
      v-model="form.pricePerMenit"
      is-separate-row
      bordered
      :rules="{ required: true }"
      prefix="Rp"
      type="number"
    />
  </PageInnerCard>
</template>

<script setup lang="ts">
import InputForm from '@/components/atoms/InputForm.vue'
import PageInnerCard from '@/components/atoms/PageInnerCard.vue'
import type { ArgoTariffSetting } from '@/types/Forms'
import { toRefs, watch } from 'vue'

interface Props {
  form: ArgoTariffSetting
}

const props = defineProps<Props>()
const emits = defineEmits<{
  update: [form: ArgoTariffSetting]
}>()

const { form } = toRefs(props)

watch(
  form,
  (newValue) => {
    emits('update', newValue)
  },
  { deep: true }
  
)

</script>
