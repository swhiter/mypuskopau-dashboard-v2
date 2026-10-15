<template>
  <ModalBaseWithHeader :title="`${title} ${t('title.vendorOrder')}`" has-save-button :is-add="isAdd"
    :loading="modalLoading" :button-loading="buttonLoading" form="vendor-order-form" :submitted="submitted">
    <Form id="vendor-order-form" class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2" @submit="onSubmit">
      <div class="select-group">
        <label for="vendorId">{{ t('names.vendorName') }}</label>
        <Field as="select" id="vendorId" name="vendorId" v-model="form.vendorId" class="select"
          :rules="{ required: true }">
          <option value="" disabled>{{ t('label.choose') }}</option>
          <option v-for="vendor in vendorOptions" :key="vendor.id" :value="String(vendor.id)">
            {{ vendor.name }}{{ vendor.isActive ? '' : ` (${t('names.inactive')})` }}
          </option>
        </Field>
        <ErrorMessage name="vendorId" class="error" />
      </div>
      <InputForm name="vendorReference" v-model="form.vendorReference" :label="t('names.vendorReference')"
        is-separate-row bordered :rules="{ required: true }" />

      <InputForm name="tripDate" v-model="form.tripDate" :label="t('names.tripDate')" type="datetime-local"
        is-separate-row bordered :rules="{ required: true, not_future: true }" />
      <div class="select-group">
        <label for="driverId">{{ t('names.driverName') }}</label>
        <Field as="select" id="driverId" name="driverId" v-model="form.driverId" class="select"
          :rules="{ required: true }">
          <option value="" disabled>{{ t('label.choose') }}</option>
          <option v-for="driver in drivers" :key="driver.id" :value="String(driver.id)">
            {{ driver.name }} - {{ driver.vehicleCode }}
          </option>
        </Field>
        <ErrorMessage name="driverId" class="error" />
      </div>

      <div class="select-group">
        <label for="carType">{{ t('names.carName') }}</label>
        <Field as="select" id="carType" name="carType" v-model="form.carType" class="select"
          :rules="{ required: true }">
          <option value="" disabled>{{ t('label.choose') }}</option>
          <option v-for="car in cars" :key="car.id" :value="String(car.id)">{{ car.carName }}</option>
        </Field>
        <ErrorMessage name="carType" class="error" />
      </div>
      <InputForm name="customerName" v-model="form.customerName" :label="t('names.customerName')" is-separate-row
        bordered :rules="{ required: true }" />

      <InputForm name="customerPhone" v-model="form.customerPhone" :label="t('names.customerPhone')" is-separate-row
        bordered />
      <InputForm name="pickupAddress" v-model="form.pickupAddress" :label="t('names.pickupAddress')" is-separate-row
        bordered :rules="{ required: true }" />

      <InputForm name="destinationAddress" v-model="form.destinationAddress" :label="t('names.destinationAddress')"
        is-separate-row bordered :rules="{ required: true }" />
      <InputForm name="distance" v-model="form.distance" :label="t('names.tripDistance')" type="number" suffix="km"
        is-separate-row bordered :rules="{ required: true, min_value: 0 }" />

      <InputForm name="price" v-model="form.price" :label="t('names.price')" type="number" prefix="Rp"
        is-separate-row bordered :rules="{ required: true, min_value: 1 }" />
      <div class="select-group">
        <label>{{ t('names.receiptPhoto') }}</label>
        <input type="file" accept="image/png,image/jpeg" @change="onFileAdd" class="text-sm" />
        <img v-if="previewUrl" :src="previewUrl" alt="Foto struk" class="preview" />
      </div>
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ErrorMessage, Field, Form, defineRule } from 'vee-validate'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import InputForm from '@/components/atoms/InputForm.vue'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import vendorService from '@/services/vendor/vendor.api'
import vendorOrderService from '@/services/vendor/vendor-order.api'
import driverService from '@/services/drivers/drivers.api'
import carsService from '@/services/drivers/cars.api'
import type { Car, Driver, Vendor, VendorOrder, VendorOrderForm } from '@/types/Data'

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  title: string
  id?: number
  isAdd?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdd: false
})

// datetime-local tanpa zona waktu: backend membacanya sebagai WIB
const toLocalInput = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

defineRule('not_future', (value: string) => {
  if (value && new Date(value).getTime() > Date.now()) {
    return t('message.tripDateFuture')
  }
  return true
})

const form = ref<VendorOrderForm>({
  vendorId: '',
  vendorReference: '',
  tripDate: toLocalInput(new Date()),
  driverId: '',
  carType: '',
  customerName: '',
  customerPhone: '',
  pickupAddress: '',
  destinationAddress: '',
  distance: 0,
  price: 0
})

const vendors = ref<Vendor[]>([])
const drivers = ref<Driver[]>([])
const cars = ref<Car[]>([])
const original = ref<VendorOrder | null>(null)
const photo = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const modalLoading = ref(false)
const buttonLoading = ref(false)
const submitted = ref(false)

// Vendor aktif, ditambah vendor lama saat edit meskipun sudah nonaktif
const vendorOptions = computed(() =>
  vendors.value.filter((vendor) => vendor.isActive || vendor.id === original.value?.vendorId)
)

const setPreview = (url: string | null): void => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = url
}

const onFileAdd = (e: Event): void => {
  const file = (e.target as HTMLInputElement).files?.item(0) ?? null
  photo.value = file
  setPreview(file ? URL.createObjectURL(file) : null)
}

// Store modal hanya menampung satu modal: konfirmasi di dalam form ini memakai
// dialog bawaan browser supaya form & callback tabel tidak tertimpa.
const onSubmit = (): void => {
  if (window.confirm(t('message.save'))) {
    save()
  }
}

const save = async (): Promise<void> => {
  const data = new FormData()
  Object.entries(form.value).forEach(([key, value]) => data.append(key, String(value ?? '')))
  if (photo.value) data.append('photo', photo.value)

  buttonLoading.value = true
  try {
    if (props.id) {
      await vendorOrderService.updateVendorOrder(props.id, data)
    } else {
      await vendorOrderService.createVendorOrder(data)
    }
    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
}

const loadOptions = async (): Promise<void> => {
  const [vendorRes, driverRes, carRes] = await Promise.all([
    vendorService.getVendors(),
    driverService.getDrivers({ page: 1, limit: 1000 }),
    carsService.getCars({ page: 1, limit: 1000, totalPages: 0, totalRows: 0, search: '' })
  ])
  vendors.value = vendorRes.data
  drivers.value = driverRes.data
  cars.value = carRes.data
}

const loadOrder = async (id: number): Promise<void> => {
  const { data } = await vendorOrderService.getVendorOrder(id)
  original.value = data
  form.value = {
    vendorId: String(data.vendorId),
    vendorReference: data.vendorReference,
    tripDate: toLocalInput(new Date(data.tripDate)),
    driverId: String(data.driverId),
    carType: String(data.carType),
    customerName: data.customerName,
    customerPhone: data.customerPhone === '-' ? '' : data.customerPhone,
    pickupAddress: data.pickupAddress,
    destinationAddress: data.destinationAddress,
    distance: Number(data.distance),
    price: Number(data.price)
  }
  if (data.hasPhoto) {
    setPreview(URL.createObjectURL(await vendorOrderService.getVendorOrderPhoto(id)))
  }
}

onMounted(async () => {
  modalLoading.value = true
  try {
    await loadOptions()
    if (props.id) await loadOrder(props.id)
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    modalLoading.value = false
  }
})

onBeforeUnmount(() => setPreview(null))
</script>

<style scoped>
.select-group {
  @apply flex flex-col space-y-1 text-sm 2xl:text-base
}

.select {
  @apply border border-buttonGray rounded-lg px-3 py-2 w-full bg-white
}

.error {
  @apply text-xs text-red-500
}

.preview {
  @apply max-h-40 w-auto object-contain border rounded
}
</style>
