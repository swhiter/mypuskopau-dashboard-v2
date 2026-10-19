<template>
  <ModalBaseWithHeader :title="title" has-save-button :is-add="!payrollId" :loading="modalLoading"
    :button-loading="buttonLoading" form="payroll-form" :submitted="submitted">
    <Form id="payroll-form" class="flex flex-col space-y-4" @submit="onSubmit">
      <div class="text-sm">
        <span class="font-semibold">{{ driverLabel }}</span>
      </div>

      <div v-if="orders.length" class="order-table">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th>{{ t('names.date') }}</th>
              <th>{{ t('names.transactionNumber') }}</th>
              <th>{{ t('names.paymentMethod') }}</th>
              <th class="text-right">{{ t('names.price') }}</th>
              <th class="text-right">{{ t('names.driverSalary') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.orderId">
              <td>{{ formatWib(order.createdAt) }}</td>
              <td>{{ order.transactionNumber }}</td>
              <td>{{ order.paymentMethod }}</td>
              <td class="text-right">{{ formatRupiah(order.price) }}</td>
              <td class="text-right">{{ formatRupiah(order.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <InputForm name="deductionAmount" v-model="form.deductionAmount" :label="t('names.deduction')" type="number"
          prefix="Rp" is-separate-row bordered :rules="{ required: true, integer: true, min_value: 0 }" />
        <InputForm name="deductionNote" v-model="form.deductionNote" :label="t('names.deductionNote')" is-separate-row
          bordered />
        <InputForm name="bonusAmount" v-model="form.bonusAmount" :label="t('names.bonus')" type="number" prefix="Rp"
          is-separate-row bordered :rules="{ required: true, integer: true, min_value: 0 }" />
        <InputForm name="bonusNote" v-model="form.bonusNote" :label="t('names.bonusNote')" is-separate-row bordered />
      </div>

      <div class="totals">
        <div class="flex justify-between"><span>{{ t('names.baseSalary') }}</span><span>{{ formatRupiah(baseAmount) }}</span></div>
        <div class="flex justify-between"><span>{{ t('names.deduction') }}</span><span>- {{ formatRupiah(Number(form.deductionAmount) || 0) }}</span></div>
        <div class="flex justify-between"><span>{{ t('names.bonus') }}</span><span>+ {{ formatRupiah(Number(form.bonusAmount) || 0) }}</span></div>
        <div class="flex justify-between font-semibold text-base" :class="{ negative: netAmount < 0 }">
          <span>{{ t('names.netSalary') }}</span><span>{{ formatRupiah(netAmount) }}</span>
        </div>
      </div>
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
import { formatRupiah, formatWib, formatWorkDate } from '@/utils/payroll-format'
import payrollService from '@/services/payroll/payroll.api'
import type { UnpaidOrder } from '@/types/Data'

const { t } = useI18n()
const toast = useToasterStore()

// Mode proses: driverId + workDate (pratinjau order belum digaji pada hari
// kerja itu). Mode edit: payrollId.
interface Props {
  title: string
  driverId?: number
  workDate?: string
  payrollId?: number
}

const props = defineProps<Props>()

const form = ref({
  deductionAmount: 0 as number | string,
  deductionNote: '',
  bonusAmount: 0 as number | string,
  bonusNote: ''
})
const orders = ref<UnpaidOrder[]>([])
const baseAmount = ref(0)
const driverLabel = ref('')

const modalLoading = ref(false)
const buttonLoading = ref(false)
const submitted = ref(false)

const netAmount = computed(
  () => baseAmount.value - (Number(form.value.deductionAmount) || 0) + (Number(form.value.bonusAmount) || 0)
)

const payload = () => ({
  deductionAmount: Number(form.value.deductionAmount) || 0,
  deductionNote: form.value.deductionNote,
  bonusAmount: Number(form.value.bonusAmount) || 0,
  bonusNote: form.value.bonusNote
})

// Store modal hanya menampung satu modal: konfirmasi memakai dialog bawaan browser.
const onSubmit = (): void => {
  // Catatan wajib bila nominal potongan/bonus > 0 (sama dengan validasi backend)
  const missingNote =
    (Number(form.value.deductionAmount) > 0 && !form.value.deductionNote.trim()) ||
    (Number(form.value.bonusAmount) > 0 && !form.value.bonusNote.trim())
  if (missingNote) {
    toast.error({ text: t('message.noteRequired') })
    return
  }
  const message = t('message.confirmPayroll', { name: driverLabel.value, net: formatRupiah(netAmount.value) })
  if (window.confirm(message)) {
    save()
  }
}

const save = async (): Promise<void> => {
  buttonLoading.value = true
  try {
    if (props.payrollId) {
      await payrollService.updatePayroll(props.payrollId, payload())
    } else {
      await payrollService.processPayroll({
        driverId: props.driverId!,
        workDate: props.workDate!,
        orderIds: orders.value.map((order) => order.orderId),
        ...payload()
      })
    }
    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
}

onMounted(async () => {
  modalLoading.value = true
  try {
    if (props.payrollId) {
      const { data } = await payrollService.getPayroll(props.payrollId)
      driverLabel.value = `${data.driverName} (${data.vehicleCode})`
      if (data.workDate) driverLabel.value += ` · ${formatWorkDate(data.workDate)}`
      baseAmount.value = data.baseAmount
      form.value = {
        deductionAmount: data.deductionAmount,
        deductionNote: data.deductionNote ?? '',
        bonusAmount: data.bonusAmount,
        bonusNote: data.bonusNote ?? ''
      }
    } else if (props.driverId && props.workDate) {
      const { data } = await payrollService.getPendingDetail(props.driverId, props.workDate)
      driverLabel.value = `${data.driver.name} (${data.driver.vehicleCode}) · ${formatWorkDate(data.workDate)}`
      orders.value = data.orders
      baseAmount.value = data.baseAmount
    }
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    modalLoading.value = false
  }
})
</script>

<style scoped>
.order-table {
  @apply max-h-64 overflow-y-auto border border-buttonGray rounded-lg
}

.order-table th,
.order-table td {
  @apply px-3 py-1 text-left
}

.order-table thead {
  @apply bg-gray-100 sticky top-0
}

.totals {
  @apply flex flex-col space-y-1 text-sm border-t border-buttonGray pt-3
}

.negative {
  @apply text-red-600
}
</style>
