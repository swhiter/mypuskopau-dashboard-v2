<!-- Buat Struk Manual: order cash yang dibuat admin -->
<template>
  <PageContainer :title="$t('title.adminCreateOrder')">
    <!-- Hasil terakhir -->
    <div v-if="lastCreated" class="success-card" role="status">
      <span class="material-symbols-outlined success-icon" aria-hidden="true">check_circle</span>
      <div class="flex-1">
        <p class="font-semibold">{{ $t('message.manualOrderCreated') }}</p>
        <p class="text-sm">
          {{ $t('names.transactionNumber') }}: <strong>{{ lastCreated.transactionNumber }}</strong>
          · {{ lastCreated.customerName }} · {{ formatRupiah(lastCreated.total) }}
        </p>
      </div>
      <MainButton :label="$t('label.openReceipt')" :loading="openingReceipt" @click="openReceipt" />
      <button type="button" class="close-button" :aria-label="$t('label.close')" @click="lastCreated = null">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>

    <Form id="manual-order-form" class="layout" @submit="onSubmit" :key="formKey">
      <div class="flex flex-col gap-4 min-w-0">
        <!-- Pelanggan -->
        <section class="card">
          <header class="card-header">
            <span class="material-symbols-outlined card-icon" aria-hidden="true">person</span>
            <h2>{{ $t('title.customerData') }}</h2>
          </header>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <InputForm name="customerName" :label="$t('names.customerName')" v-model="form.customerName"
              is-separate-row bordered :rules="{ required: true }" />
            <InputForm name="customerPhone" :label="$t('names.customerPhone')" v-model="form.customerPhone"
              is-separate-row bordered :rules="{ required: true }" type="tel" />
            <InputForm name="customerEmail" :label="`${$t('names.customerEmail')} (${$t('label.optional')})`"
              v-model="form.customerEmail" is-separate-row bordered :rules="{ email: true }" type="email" />
          </div>
        </section>

        <!-- Perjalanan -->
        <section class="card">
          <header class="card-header">
            <span class="material-symbols-outlined card-icon" aria-hidden="true">route</span>
            <h2>{{ $t('title.tripData') }}</h2>
          </header>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <InputForm name="pickupAddress" :label="$t('names.pickupAddress')" v-model="form.pickupAddress"
              is-separate-row bordered :rules="{ required: true }" />
            <InputForm name="destinationAddress" :label="$t('names.destinationAddress')"
              v-model="form.destinationAddress" is-separate-row bordered :rules="{ required: true }" />
            <InputForm name="distance" :label="$t('names.tripDistance')" v-model="form.distance" is-separate-row
              bordered :rules="{ required: true, min_value: 0 }" type="number" suffix="km" />
          </div>
          <button type="button" class="toggle" :aria-expanded="showCoordinates"
            @click="showCoordinates = !showCoordinates">
            <span class="material-symbols-outlined" aria-hidden="true">{{ showCoordinates ? 'expand_less' : 'expand_more' }}</span>
            {{ $t('label.optionalCoordinates') }}
          </button>
          <div v-show="showCoordinates" class="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
            <InputForm name="latitudeStart" :label="$t('names.latitudeStart')" v-model="form.latitudeStart"
              is-separate-row bordered type="number" />
            <InputForm name="longitudeStart" :label="$t('names.longitudeStart')" v-model="form.longitudeStart"
              is-separate-row bordered type="number" />
            <InputForm name="latitudeDestination" :label="$t('names.latitudeDestination')"
              v-model="form.latitudeDestination" is-separate-row bordered type="number" />
            <InputForm name="longitudeDestination" :label="$t('names.longitudeDestination')"
              v-model="form.longitudeDestination" is-separate-row bordered type="number" />
          </div>
        </section>

        <!-- Driver & Mobil -->
        <section class="card">
          <header class="card-header">
            <span class="material-symbols-outlined card-icon" aria-hidden="true">local_taxi</span>
            <h2>{{ $t('title.driverAndCar') }}</h2>
          </header>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <div class="field">
              <label for="driverUserId">{{ $t('names.driverName') }}</label>
              <input v-model="driverSearch" type="search" class="select" :placeholder="$t('label.searchDriver')"
                :aria-label="$t('label.searchDriver')" />
              <Field as="select" id="driverUserId" name="driverUserId" v-model="form.driverUserId" class="select"
                :rules="{ required: true }">
                <option value="" disabled>{{ $t('label.choose') }}</option>
                <option v-for="driver in filteredDrivers" :key="driver.id" :value="driver.userId">
                  {{ driver.name }} · {{ driver.userId }}
                </option>
              </Field>
              <ErrorMessage name="driverUserId" class="error" />
            </div>
            <div class="field">
              <label for="carId">{{ $t('names.carNumber') }}</label>
              <Field as="select" id="carId" name="carId" v-model="form.carId" class="select" :rules="{ required: true }">
                <option value="" disabled>{{ $t('label.choose') }}</option>
                <optgroup v-for="group in carGroups" :key="group.label" :label="group.label">
                  <option v-for="car in group.cars" :key="car.id" :value="String(car.id)">{{ car.carName }}</option>
                </optgroup>
              </Field>
              <ErrorMessage name="carId" class="error" />
              <span v-if="selectedCar" class="hint">{{ $t('names.carCategory') }}: {{ selectedCar.description }}</span>
            </div>
            <div class="field">
              <label for="staffId">{{ $t('names.staffName') }} ({{ $t('label.optional') }})</label>
              <select id="staffId" v-model="form.staffId" class="select">
                <option value="">-</option>
                <option v-for="staff in staffs" :key="staff.id" :value="String(staff.id)">{{ staff.name }}</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <!-- Ringkasan pembayaran -->
      <aside class="summary">
        <header class="card-header">
          <span class="material-symbols-outlined card-icon" aria-hidden="true">payments</span>
          <h2>{{ $t('title.paymentSummary') }}</h2>
        </header>
        <span class="badge">{{ $t('label.paymentCash') }}</span>
        <!-- harga di bawah tarif minimum ditolak di sini agar backend tidak mengubah harga diam-diam -->
        <InputForm name="price" :label="$t('names.price')" v-model="form.price" is-separate-row bordered prefix="Rp"
          :rules="{ required: true, integer: true, min_value: MINIMUM_PRICE }" type="number" />
        <p class="hint">{{ $t('message.minimumFareInfo', { amount: formatRupiah(MINIMUM_PRICE) }) }}</p>
        <InputForm name="chargePassenger" :label="`${$t('names.chargePassenger')} (${$t('label.optional')})`"
          v-model="form.chargePassenger" is-separate-row bordered prefix="Rp" :rules="{ integer: true, min_value: 0 }"
          type="number" />
        <InputForm name="discount" :label="`${$t('names.discount')} (${$t('label.optional')})`" v-model="form.discount"
          is-separate-row bordered prefix="Rp" :rules="{ integer: true, min_value: 0 }" type="number" />

        <dl class="totals">
          <div><dt>{{ $t('names.price') }}</dt><dd>{{ formatRupiah(totals.price) }}</dd></div>
          <div><dt>{{ $t('names.chargePassenger') }}</dt><dd>+ {{ formatRupiah(totals.chargePassenger) }}</dd></div>
          <div><dt>{{ $t('names.discount') }}</dt><dd>− {{ formatRupiah(totals.discount) }}</dd></div>
          <div class="grand"><dt>{{ $t('names.totalPaid') }}</dt><dd>{{ formatRupiah(totals.total) }}</dd></div>
        </dl>
        <p class="hint">{{ $t('message.manualOrderInfo') }}</p>

        <MainButton type="submit" form="manual-order-form" :label="$t('label.saveOrder')" wide :loading="saving"
          :disabled="saving || loadingOptions" class="w-full" />
      </aside>
    </Form>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ErrorMessage, Field, Form } from 'vee-validate'
import PageContainer from '@/components/atoms/PageContainer.vue'
import InputForm from '@/components/atoms/InputForm.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah } from '@/utils/payroll-format'
import {
  MINIMUM_PRICE,
  buildManualOrderPayload,
  emptyManualOrderForm,
  manualOrderTotals,
  type ManualOrderForm
} from '@/utils/manual-order'
import orderService from '@/services/order/order.api'
import driverService from '@/services/drivers/drivers.api'
import carsService from '@/services/drivers/cars.api'
import staffService from '@/services/drivers/staff.api'
import httpClient from '@/services/httpClient'
import type { Car, Driver, Staff } from '@/types/Data'

const { t } = useI18n()
const toast = useToasterStore()

const form = ref<ManualOrderForm>(emptyManualOrderForm())
const formKey = ref(0)
const showCoordinates = ref(false)
const drivers = ref<Driver[]>([])
const cars = ref<Car[]>([])
const staffs = ref<Staff[]>([])
const driverSearch = ref('')
const loadingOptions = ref(false)
const saving = ref(false)
const openingReceipt = ref(false)
const lastCreated = ref<{ transactionNumber: string; customerName: string; total: number } | null>(null)

const totals = computed(() => manualOrderTotals(form.value))

const filteredDrivers = computed(() => {
  const keyword = driverSearch.value.trim().toLowerCase()
  const list = keyword
    ? drivers.value.filter((driver) =>
        `${driver.name} ${driver.userId} ${driver.vehicleCode ?? ''}`.toLowerCase().includes(keyword)
      )
    : drivers.value
  // driver terpilih tetap tampil walau tidak cocok dengan pencarian
  const selected = drivers.value.find((driver) => driver.userId === form.value.driverUserId)
  return selected && !list.includes(selected) ? [selected, ...list] : list
})

// Nomor mobil dikelompokkan per jenis armada
const carGroups = computed(() => {
  const groups = new Map<string, Car[]>()
  for (const car of cars.value) {
    const label = car.description || '-'
    groups.set(label, [...(groups.get(label) ?? []), car])
  }
  return [...groups.entries()].map(([label, list]) => ({
    label,
    cars: list.sort((a, b) => a.carName.localeCompare(b.carName, 'id', { numeric: true }))
  }))
})

const selectedCar = computed(() => cars.value.find((car) => String(car.id) === String(form.value.carId)))

// Store modal hanya menampung satu modal: konfirmasi memakai dialog bawaan browser.
const onSubmit = (): void => {
  const message = t('message.confirmManualOrder', {
    name: form.value.customerName,
    total: formatRupiah(totals.value.total)
  })
  if (window.confirm(message)) {
    save()
  }
}

const save = async (): Promise<void> => {
  saving.value = true
  try {
    const response = await orderService.createOrder(buildManualOrderPayload(form.value))
    lastCreated.value = {
      transactionNumber: response.data?.transactionNumber ?? '-',
      customerName: form.value.customerName,
      total: totals.value.total
    }
    toast.success({ text: t('alert.successSave') })
    form.value = emptyManualOrderForm()
    driverSearch.value = ''
    formKey.value += 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    saving.value = false
  }
}

// Struk PDF diambil lewat /api (ber-token) lalu dibuka di tab baru
const openReceipt = async (): Promise<void> => {
  if (!lastCreated.value) return
  const tab = window.open('', '_blank')
  openingReceipt.value = true
  try {
    const blob = await httpClient.get<Blob>(`/order-invoice/${lastCreated.value.transactionNumber}`, {
      responseType: 'blob'
    })
    const url = URL.createObjectURL(blob)
    if (tab) tab.location.href = url
    else window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    tab?.close()
    handleErrorResponse(error)
  } finally {
    openingReceipt.value = false
  }
}

onMounted(async () => {
  loadingOptions.value = true
  try {
    const [driverRes, carRes, staffRes] = await Promise.all([
      driverService.getDrivers({ page: 1, limit: 1000 }),
      carsService.getCars({ page: 1, limit: 1000, totalPages: 0, totalRows: 0, search: '' }),
      staffService.getStaff({ page: 1, limit: 1000, totalPages: 0, totalRows: 0, search: '' })
    ])
    drivers.value = [...driverRes.data].sort((a, b) => a.name.localeCompare(b.name, 'id'))
    cars.value = carRes.data
    staffs.value = staffRes.data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loadingOptions.value = false
  }
})
</script>

<style scoped>
.layout {
  @apply grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start
}

.card,
.summary {
  @apply flex flex-col gap-3 bg-white rounded-lg border border-buttonGray shadow-lg p-6
}

.summary {
  @apply xl:sticky xl:top-20
}

.card-header {
  @apply flex items-center gap-2
}

.card-header h2 {
  @apply font-semibold text-lg
}

.card-icon {
  @apply text-primaryDarkBlue
}

.field {
  @apply flex flex-col gap-1 text-sm 2xl:text-base
}

.select {
  @apply border border-buttonGray rounded-lg px-3 py-2 w-full bg-white text-sm
}

.error {
  @apply text-xs text-red-500
}

.hint {
  @apply text-xs text-accentGray
}

.hint.warning {
  @apply text-amber-700
}

.toggle {
  @apply flex items-center gap-1 self-start text-sm text-primaryDarkBlue font-medium py-2
}

.badge {
  @apply self-start rounded-full bg-green-100 text-green-800 text-xs font-semibold px-3 py-1
}

.totals {
  @apply flex flex-col gap-1 text-sm border-t border-buttonGray pt-3
}

.totals div {
  @apply flex justify-between
}

.totals .grand {
  @apply text-base font-bold border-t border-buttonGray pt-2 mt-1
}

.success-card {
  @apply flex flex-wrap items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4 mb-4
}

.success-icon {
  @apply text-green-600 text-3xl
}

.close-button {
  @apply text-accentGray hover:text-primaryDarkBlue p-2
}
</style>
