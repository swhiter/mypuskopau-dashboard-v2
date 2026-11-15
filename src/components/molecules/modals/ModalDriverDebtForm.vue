<template>
  <ModalBaseWithHeader :title="title" has-save-button :is-add="!debt" :loading="loading" :button-loading="saving"
    form="driver-debt-form" :submitted="submitted">
    <Form id="driver-debt-form" class="flex flex-col space-y-3 text-sm" @submit="onSubmit">
      <template v-if="!debt">
        <div class="field">
          <label for="debtDriver">{{ t('names.driverName') }}</label>
          <input v-model="driverSearch" type="search" class="select" :placeholder="t('label.searchDriver')"
            :aria-label="t('label.searchDriver')" />
          <select id="debtDriver" v-model="form.driverId" class="select">
            <option value="" disabled>{{ t('label.choose') }}</option>
            <option v-for="driver in filteredDrivers" :key="driver.id" :value="String(driver.id)">
              {{ driver.name }} · {{ driver.userId }}{{ driver.vehicleCode ? ` · ${driver.vehicleCode}` : '' }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="debtKind">{{ t('names.debtKind') }}</label>
          <select id="debtKind" v-model="form.kind" class="select">
            <option v-for="kind in DEBT_KINDS" :key="kind" :value="kind">{{ t(`label.debtKind.${kind}`) }}</option>
          </select>
        </div>
      </template>
      <p v-else class="font-semibold">
        {{ debt.driverName }} ({{ debt.vehicleCode }}) · {{ t(`label.debtKind.${debt.kind}`) }}
      </p>

      <InputForm name="description" v-model="form.description" :label="t('names.debtDescription')" is-separate-row
        bordered :rules="{ required: true }" />
      <InputForm name="totalAmount" v-model="form.totalAmount" :label="t('names.debtTotal')" type="number" prefix="Rp"
        is-separate-row bordered :disabled="hasPayments" :rules="{ required: true, integer: true, min_value: 1 }" />
      <p v-if="hasPayments" class="hint">{{ t('message.debtTotalLocked') }}</p>
      <p v-else-if="!debt" class="hint">{{ t('message.debtOpeningHint') }}</p>
      <InputForm name="installmentAmount" v-model="form.installmentAmount" :label="t('names.installmentPerDay')"
        type="number" prefix="Rp" is-separate-row bordered :rules="{ required: true, integer: true, min_value: 1 }" />
      <p class="hint">{{ t('message.debtInstallmentInfo') }}</p>
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Form } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import InputForm from '@/components/atoms/InputForm.vue'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import { DEBT_KINDS, buildDebtPayload, emptyDebtForm, validateDebtForm, type DebtForm } from '@/utils/driver-debt'
import driverDebtService from '@/services/driver-debt/driver-debt.api'
import driverService from '@/services/drivers/drivers.api'
import type { Driver, DriverDebt } from '@/types/Data'

const { t } = useI18n()
const toast = useToasterStore()

// Tanpa debt = tambah hutang; dengan debt = ubah keterangan/cicilan (total bila belum ada pembayaran).
interface Props {
  title: string
  debt?: DriverDebt
}
const props = defineProps<Props>()

const form = ref<DebtForm>(
  props.debt
    ? {
        driverId: String(props.debt.driverId),
        kind: props.debt.kind,
        description: props.debt.description,
        totalAmount: props.debt.totalAmount,
        installmentAmount: props.debt.installmentAmount
      }
    : emptyDebtForm()
)
const hasPayments = computed(() => !!props.debt && props.debt.paid > 0)
const drivers = ref<Driver[]>([])
const driverSearch = ref('')
const loading = ref(false)
const saving = ref(false)
const submitted = ref(false)

const filteredDrivers = computed(() => {
  const keyword = driverSearch.value.trim().toLowerCase()
  const list = keyword
    ? drivers.value.filter((driver) =>
        `${driver.name} ${driver.userId} ${driver.vehicleCode ?? ''}`.toLowerCase().includes(keyword)
      )
    : drivers.value
  const selected = drivers.value.find((driver) => String(driver.id) === String(form.value.driverId))
  return selected && !list.includes(selected) ? [selected, ...list] : list
})

const onSubmit = async (): Promise<void> => {
  const invalid = validateDebtForm(form.value)
  if (invalid) {
    toast.error({ text: t(invalid) })
    return
  }
  saving.value = true
  try {
    const payload = buildDebtPayload(form.value)
    if (props.debt) {
      await driverDebtService.updateDebt(props.debt.id, {
        description: payload.description,
        installmentAmount: payload.installmentAmount,
        ...(hasPayments.value ? {} : { totalAmount: payload.totalAmount })
      })
    } else {
      await driverDebtService.createDebt(payload)
    }
    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (props.debt) return
  loading.value = true
  try {
    drivers.value = (await driverService.getDrivers({ page: 1, limit: 1000 })).data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.field {
  @apply flex flex-col gap-1
}

.select {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.hint {
  @apply text-xs text-accentGray
}
</style>
