<template>
  <ModalBaseWithHeader :title="title" :loading="modalLoading">
    <div class="grid grid-cols-3 gap-4">
      <InputForm name="orderNumber" :label="t('label.orderNumber')" v-model="transaction.transactionNumber" bordered
        is-separate-row semibold-label disabled />
      <InputForm name="orderDate" :label="t('label.orderDate')" v-model="transaction.createdAt" bordered is-separate-row
        semibold-label disabled />
      <InputForm name="orderPrice" :label="t('label.orderPrice')" v-model="transaction.orderDetail.price" bordered
        is-separate-row semibold-label disabled />
      <InputForm name="customerName" :label="t('label.customerName')" v-model="transaction.customerName" bordered
        is-separate-row semibold-label disabled />
      <div class="col-span-2">
        <InputForm name="address" :label="t('label.destinationAddress')"
          v-model="transaction.orderDetail.destinationAddress" bordered is-separate-row semibold-label disabled />
      </div>
      <InputForm name="distance" :label="t('label.distance')" v-model="transaction.orderDetail.distance" bordered
        is-separate-row semibold-label disabled />
      <template v-if="transaction.driver">
        <InputForm name="driverName" :label="t('label.driverName')" v-model="transaction.driver.name" bordered
          is-separate-row semibold-label disabled />
        <InputForm name="licensePlate" :label="t('label.licensePlate')" v-model="transaction.driver.licensePlate"
          bordered is-separate-row semibold-label disabled />
      </template>
    </div>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import ModalBaseWithHeader from './ModalBaseWithHeader.vue';
import { handleErrorResponse } from '@/utils/common';
import orderService from '@/services/order/order.api';
import type { Transaction } from '@/types/Data';
import InputForm from '@/components/atoms/InputForm.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

interface Props {
  title: string
  trxId: string
}

const props = defineProps<Props>()

const transaction: Ref<Transaction> = ref({
  id: 2,
  transactionNumber: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  status: 2,
  createdAt: '',
  updatedAt: '',
  orderDetail: {
    id: 2,
    destinationAddress: '',
    longitudeDestination: '',
    latitudeDestination: '',
    longitudeStart: '',
    latitudeStart: '',
    price: '',
    distance: '',
    parkingPrice: '',
    paymentMethod: '',
    vaAccount: '',
    midtransId: '',
    createdAt: '',
    updatedAt: ''
  },
  driver: {
    id: 1,
    userId: '',
    name: '',
    nik: '',
    photo: '',
    vehicleCode: '',
    licensePlate: '',
    lastLongitude: '',
    lastLatitude: '',
    status: 3,
    totalIncome: ''
  },
  staff: {
    id: 1,
    userId: '',
    name: '',
    nik: '',
    photo: ''
  }
})
const modalLoading: Ref<boolean> = ref(false)

const getOrderById = async (): Promise<void> => {
  modalLoading.value = true
  try {
    const response = await orderService.getOrderByTrxId(props.trxId)
    transaction.value = response.data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    modalLoading.value = false
  }
}

onMounted(() => {
  getOrderById()
})
</script>