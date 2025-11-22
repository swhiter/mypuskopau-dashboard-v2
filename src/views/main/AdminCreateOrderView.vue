<!-- src/views/orders/AdminCreateOrderView.vue -->
<template>
  <PageContainer :title="$t('title.adminCreateOrder')">
    <PageCard
      has-save-button
      button-form="create-order-form"
      :loading="cardLoading"
      :button-loading="buttonLoading"
    >
      <Form id="create-order-form" class="space-y-4" @submit="onSubmit">
        <CreateOrderForm :form="form" @update="form = $event" />
      </Form>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageContainer from '@/components/atoms/PageContainer.vue'
import PageCard from '@/components/atoms/PageCard.vue'
import CreateOrderForm, {
  type CreateOrderFormModel
} from '@/components/molecules/forms/CreateOrderForm.vue'
import { useModalStore } from '@/stores/modal'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import orderService, {
  type CreateOrderPayload
} from '@/services/order/order.api'

const { t } = useI18n()
const modal = useModalStore()
const toaster = useToasterStore()

const cardLoading: Ref<boolean> = ref(false)
const buttonLoading: Ref<boolean> = ref(false)

const form = ref<CreateOrderFormModel>({
  customerEmail: '',
  customerName: '',
  customerPhone: '',
  driverID: '1',
  carType: '',
  pickupAddress: '',
  destinationAddress: '',
  distance: 0,
  latitudeDestination: '',
  latitudeStart: -6.265400587730816,
  longitudeDestination: '',
  longitudeStart: 106.88468187116457,
  paymentMethod: 'cash_avanza',
  vaAccount: '',
  price: 0,
  chargePassenger: 0,
  discount: 0,
  staffId: ''
})

const onSubmit = (): void => {
  modal.openConfirmationModal(t('message.save'))
  modal.onOk(() => {
    save()
  })
}

const save = async (): Promise<void> => {
  buttonLoading.value = true
  cardLoading.value = true

  const payload: CreateOrderPayload = {
    customerEmail: form.value.customerEmail,
    customerName: form.value.customerName,
    customerPhone: form.value.customerPhone,
    driverID: Number(form.value.driverID),
    carType: Number(form.value.carType),
    orderDetail: {
      pickupAddress: form.value.pickupAddress,
      destinationAddress: form.value.destinationAddress,
      distance: Number(form.value.distance),
      latitudeDestination: String(form.value.latitudeDestination),
      latitudeStart: form.value.latitudeStart,
      longitudeDestination: String(form.value.longitudeDestination),
      longitudeStart: form.value.longitudeStart,
      paymentMethod: form.value.paymentMethod,
      vaAccount: form.value.vaAccount,
      price: Number(form.value.price),
      chargePassenger: Number(form.value.chargePassenger || 0),
      discount: Number(form.value.discount || 0)
    },
    staffId: Number(form.value.staffId)
  }

  try {
    const response = await orderService.createOrder(payload)

    // ambil invoiceUrl dari response
    // tergantung struktur GeneralResponse kamu, jadi aku amankan dua kemungkinan:
    const rawInvoiceUrl = response.data.invoiceUrl

    if (rawInvoiceUrl) {
      // ganti IP jadi pakai port 21001
      const fixedInvoiceUrl = rawInvoiceUrl.replace(
        '46.202.160.103',
        '46.202.160.103:21001'
      )

      // buka tab baru untuk invoice
      window.open(fixedInvoiceUrl, '_blank')
    }

    toaster.success({ text: t('alert.successSave') })

    // optional: reset form
    form.value = {
      customerEmail: '',
      customerName: '',
      customerPhone: '',
      driverID: '',
      carType: '',
      pickupAddress: '',
      destinationAddress: '',
      distance: 0,
      latitudeDestination: '',
      latitudeStart: '',
      longitudeDestination: '',
      longitudeStart: '',
      paymentMethod: 'cash_avanza',
      vaAccount: '',
      price: 0,
      chargePassenger: 0,
      discount: 0,
      staffId: ''
    }
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
    cardLoading.value = false
  }
}
</script>
