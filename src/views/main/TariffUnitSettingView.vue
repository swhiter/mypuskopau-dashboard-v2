<template>
  <PageContainer :title="$t('title.tariffUnitSetting')">
    <!-- SATUAN YANG DIKONFIGURASI -->
    <PageCard :loading="loading">
      <PageInnerCard :title="$t('title.tariffUnitConfig')">
        <p class="unit-hint">{{ $t('message.tariffUnitConfigHint') }}</p>
        <div class="unit-options">
          <MainButton
            v-for="unit in tariffUnit.units"
            :key="unit.id"
            :label="unitLabel(unit)"
            :outline="!unit.isActiveConfig"
            :white="!unit.isActiveConfig"
            :disabled="unit.isActiveConfig || processing"
            @click="onSetConfig(unit)"
          />
        </div>
        <p class="unit-current">
          {{ $t('names.currentTariffUnitConfig') }}:
          <strong>{{ tariffUnit.configUnit ? unitLabel(tariffUnit.configUnit) : '-' }}</strong>
        </p>
      </PageInnerCard>
    </PageCard>

    <!-- SATUAN YANG DITERAPKAN UNTUK HARGA -->
    <PageCard :loading="loading">
      <PageInnerCard :title="$t('title.tariffUnitPrice')">
        <p class="unit-hint">{{ $t('message.tariffUnitPriceHint') }}</p>
        <div class="unit-options">
          <MainButton
            v-for="unit in tariffUnit.units"
            :key="unit.id"
            :label="unit.isActivePrice ? `${unitLabel(unit)} (${$t('names.applied')})` : `${$t('names.apply')} ${unitLabel(unit)}`"
            :outline="!unit.isActivePrice"
            :white="!unit.isActivePrice"
            :disabled="unit.isActivePrice || processing"
            @click="onImplement(unit)"
          />
        </div>
        <p class="unit-current">
          {{ $t('names.currentTariffUnitPrice') }}:
          <strong>{{ tariffUnit.priceUnit ? unitLabel(tariffUnit.priceUnit) : '-' }}</strong>
        </p>
      </PageInnerCard>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import MainButton from '@/components/atoms/MainButton.vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import PageInnerCard from '@/components/atoms/PageInnerCard.vue'
import { useModalStore } from '@/stores/modal'
import { useTariffUnitStore } from '@/stores/tariffUnit'
import { useToasterStore } from '@/stores/toaster'
import type { SatuanTarif } from '@/types/Data'
import { handleErrorResponse } from '@/utils/common'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const modal = useModalStore()
const toaster = useToasterStore()
const tariffUnit = useTariffUnitStore()

const loading = ref(false)
const processing = ref(false)

const unitLabel = (unit: SatuanTarif): string => `${unit.description} (${unit.satuan})`

const run = async (action: () => Promise<void>, successText: string): Promise<void> => {
  processing.value = true
  try {
    await action()
    toaster.success({ text: successText })
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    processing.value = false
  }
}

const onSetConfig = (unit: SatuanTarif): void => {
  modal.openConfirmationModal(t('message.tariffUnitConfigConfirm', { unit: unitLabel(unit) }))
  modal.onOk(() => {
    run(() => tariffUnit.setActiveConfig(unit.id), t('alert.successSave'))
  })
}

const onImplement = (unit: SatuanTarif): void => {
  modal.openConfirmationModal(t('message.tariffUnitPriceConfirm', { unit: unitLabel(unit) }))
  modal.onOk(() => {
    run(() => tariffUnit.implement(unit.id), t('alert.successSave'))
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await tariffUnit.fetchUnits()
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.unit-hint {
  @apply text-sm text-accentGray
}

.unit-options {
  @apply flex flex-wrap gap-3
}

.unit-current {
  @apply text-sm
}
</style>
