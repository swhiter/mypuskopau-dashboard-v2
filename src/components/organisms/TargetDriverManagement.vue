<template>
  <div class="relative space-y-4">
    <h5 class="title">Target Pendapatan Driver Bulanan</h5>
    <p class="subtitle">
      Nilai ini menjadi acuan pencapaian target bulanan yang tampil di profil setiap driver.
    </p>

    <div class="target-row">
      <div class="target-field">
        <span class="field-label">Periode</span>
        <span class="field-value">{{ monthLabel }} {{ year }}</span>
      </div>

      <div class="target-field">
        <span class="field-label">Target Pendapatan (Rp)</span>
        <input type="number" min="1" class="target-input" v-model.number="targetValue" />
      </div>

      <MainButton type="button" :label="existingTargetId ? 'Perbarui Target' : 'Simpan Target'" :loading="saving"
        :disabled="!targetValue || targetValue <= 0" @click="onSave" />
    </div>

    <ComponentLoading v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import MainButton from '@/components/atoms/MainButton.vue';
import ComponentLoading from '@/components/atoms/ComponentLoading.vue';
import targetDriverService from '@/services/target-driver/target-driver.api';
import { handleErrorResponse } from '@/utils/common';
import { useToasterStore } from '@/stores/toaster';

const toast = useToasterStore()

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const now = new Date()
const month = now.getMonth() + 1
const year = now.getFullYear()
const monthLabel = computed(() => monthNames[month - 1])

const existingTargetId: Ref<number | null> = ref(null)
const targetValue: Ref<number> = ref(0)
const loading: Ref<boolean> = ref(false)
const saving: Ref<boolean> = ref(false)

const fetchCurrentTarget = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await targetDriverService.getTargets({ page: 1, limit: 1, search: '' })
    const latest = response.data?.[0]
    if (latest && latest.month === month && latest.year === year) {
      existingTargetId.value = latest.id ?? null
      targetValue.value = latest.target
    } else {
      existingTargetId.value = null
      targetValue.value = 0
    }
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const onSave = async (): Promise<void> => {
  if (!targetValue.value || targetValue.value <= 0) return
  saving.value = true
  try {
    if (existingTargetId.value) {
      await targetDriverService.updateTarget(existingTargetId.value, { target: targetValue.value })
    } else {
      await targetDriverService.createTarget({ target: targetValue.value, month, year })
    }
    toast.success({ text: 'Target bulan ini berhasil disimpan' })
    await fetchCurrentTarget()
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCurrentTarget()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}

.subtitle {
  @apply text-sm text-gray-500
}

.target-row {
  @apply flex flex-wrap items-end gap-4
}

.target-field {
  @apply flex flex-col
}

.field-label {
  @apply text-xs font-semibold text-gray-500 mb-1
}

.field-value {
  @apply text-base font-bold text-gray-800 py-2
}

.target-input {
  @apply border border-gray-300 rounded px-3 py-2 w-48
}
</style>
