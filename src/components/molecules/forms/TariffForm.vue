<template>
  <PageInnerCard :title="$t('title.tariffSetting')">
    <InputForm name="distance" :label="`${$t('names.distance')} (m)`" v-model="form.distance" is-separate-row bordered
      :rules="{ required: true }" suffix="m" type="number" />
    <InputForm name="argo" :label="`${$t('names.argo')} (Rp)`" v-model="form.price" is-separate-row bordered
      :rules="{ required: true }" prefix="Rp" type="number" />
  </PageInnerCard>
</template>

<script setup lang="ts">
import InputForm from '@/components/atoms/InputForm.vue';
import PageInnerCard from '@/components/atoms/PageInnerCard.vue';
import type { TariffSetting } from '@/types/Forms';
import { toRefs, watch } from 'vue';

interface Props {
  form: TariffSetting
}

const props = defineProps<Props>()

const emits = defineEmits<{
  update: [form: TariffSetting]
}>()

// const tariffSetting = computed(() => {
//   return { ...props.form }
// })

const { form } = toRefs(props)

watch(form, (newValue, oldValue) => {
  if (newValue.distance !== oldValue.distance || newValue.price !== oldValue.price) {
    emits('update', newValue)
  }
}, { deep: true })
</script>