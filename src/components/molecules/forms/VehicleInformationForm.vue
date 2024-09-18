<template>
  <PageInnerCard :title="$t('title.vehicleInformation')">
    <div class="flex w-full space-x-4">
      <div class="w-1/2">
        <InputForm name="code" :label="$t('names.code')" v-model="form.vehicleCode" is-separate-row bordered
          :rules="{ required: true }" :placeholder="$t('placeholder.inputCode')" :reset="reset" />
      </div>
      <div class="w-1/2">
        <InputForm name="licensePlate" :label="$t('names.licensePlate')" v-model="form.licensePlate" is-separate-row
          bordered :rules="{ required: true }" :placeholder="$t('placeholder.inputLicensePlate')" :reset="reset" />
      </div>
    </div>
  </PageInnerCard>
</template>

<script setup lang="ts">
import InputForm from '@/components/atoms/InputForm.vue';
import PageInnerCard from '@/components/atoms/PageInnerCard.vue';
import type { VehicleInfo } from '@/types/Forms';
import { toRefs, watch } from 'vue';

interface Props {
  form: VehicleInfo
  reset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reset: false
})

const emits = defineEmits<{
  update: [form: VehicleInfo]
}>()

const { form } = toRefs(props)

watch(form, (newValue) => {
  emits('update', newValue)
})
</script>