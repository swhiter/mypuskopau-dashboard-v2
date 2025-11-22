<!-- src/components/molecules/forms/CreateOrderForm.vue -->
<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Data Customer -->
        <PageInnerCard :title="$t('title.customerData')">
            <InputForm name="customerName" :label="$t('names.customerName')" v-model="localForm.customerName"
                is-separate-row bordered :rules="{ required: true }" />
            <InputForm name="customerEmail" :label="$t('names.customerEmail')" v-model="localForm.customerEmail"
                is-separate-row bordered :rules="{ required: true, email: true }" type="email" />
            <InputForm name="customerPhone" :label="$t('names.customerPhone')" v-model="localForm.customerPhone"
                is-separate-row bordered :rules="{ required: true }" type="tel" />
        </PageInnerCard>

        <!-- Driver & Staff -->
        <PageInnerCard :title="$t('title.driverAndStaff')">
            <InputForm name="driverID" :label="$t('names.driverID')" v-model="localForm.driverID" is-separate-row
                bordered :rules="{ required: true, numeric: true }" type="number" />

            <!-- carType simple select -->
            <div class="flex flex-col space-y-1">
                <label class="text-sm font-medium text-gray-700">
                    {{ $t('names.carType') }}
                </label>
                <select v-model="localForm.carType" class="border rounded px-3 py-2 text-sm">
                    <option disabled value="">
                        {{ $t('placeholder.selectCarType') }}
                    </option>
                    <option value="8">Puskopau</option>
                    <option value="7">Investor</option>
                </select>
            </div>

            <InputForm name="staffId" :label="$t('names.staffId')" v-model="localForm.staffId" is-separate-row bordered
                :rules="{ required: true, numeric: true }" type="number" />
        </PageInnerCard>

        <!-- Detail Order -->
        <PageInnerCard :title="$t('title.orderDetail')">
            <InputForm name="pickupAddress" :label="$t('names.pickupAddress')" v-model="localForm.pickupAddress"
                is-separate-row bordered :rules="{ required: true }" type="text" />
            <InputForm name="destinationAddress" :label="$t('names.destinationAddress')"
                v-model="localForm.destinationAddress" is-separate-row bordered :rules="{ required: true }"
                type="text" />

            <InputForm name="distance" :label="`Jarak (km)`" v-model="localForm.distance" is-separate-row bordered
                :rules="{ required: true, numeric: true }" type="number" suffix="km" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <InputForm name="latitudeStart" :label="$t('names.latitudeStart')" v-model="localForm.latitudeStart"
                    is-separate-row bordered :rules="{ required: true }" type="number" />
                <InputForm name="longitudeStart" :label="$t('names.longitudeStart')" v-model="localForm.longitudeStart"
                    is-separate-row bordered :rules="{ required: true }" type="number" />
                <InputForm name="latitudeDestination" :label="$t('names.latitudeDestination')"
                    v-model="localForm.latitudeDestination" is-separate-row bordered :rules="{ required: true }"
                    type="number" />
                <InputForm name="longitudeDestination" :label="$t('names.longitudeDestination')"
                    v-model="localForm.longitudeDestination" is-separate-row bordered :rules="{ required: true }"
                    type="number" />
            </div>


            <!-- Harga & charge -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <InputForm name="price" :label="`${$t('names.price')} (Rp)`" v-model="localForm.price" is-separate-row
                    bordered :rules="{ required: true, numeric: true }" prefix="Rp" type="number" />

                <InputForm name="chargePassenger" :label="`${$t('names.chargePassenger')} (Rp)`"
                    v-model="localForm.chargePassenger" is-separate-row bordered :rules="{ numeric: true }" prefix="Rp"
                    type="number" />

                <InputForm name="discount" :label="`${$t('names.discount')} (Rp)`" v-model="localForm.discount"
                    is-separate-row bordered :rules="{ numeric: true }" prefix="Rp" type="number" />
            </div>
        </PageInnerCard>
    </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import PageInnerCard from '@/components/atoms/PageInnerCard.vue'
import InputForm from '@/components/atoms/InputForm.vue'
import type { CreateOrderPayload } from '@/services/order/order.api'

/**
 * Kita pakai bentuk CreateOrderPayload
 * tapi diratakan sedikit untuk v-model
 */
export interface CreateOrderFormModel {
    customerEmail: string
    customerName: string
    customerPhone: string
    driverID: number | string
    carType: string
    pickupAddress: string
    destinationAddress: string
    distance: number | string
    latitudeDestination: string | number
    latitudeStart: string | number
    longitudeDestination: string | number
    longitudeStart: string | number
    paymentMethod: string
    vaAccount: string
    price: number | string
    chargePassenger: number | string
    discount: number | string
    staffId: number | string
}

interface Props {
    form: CreateOrderFormModel
}

const props = defineProps<Props>()
const emits = defineEmits<{
    update: [form: CreateOrderFormModel]
}>()

const { form } = toRefs(props)

// local computed agar perubahan langsung emit ke parent
const localForm = computed({
    get: () => form.value,
    set: (val) => emits('update', val)
})
</script>
