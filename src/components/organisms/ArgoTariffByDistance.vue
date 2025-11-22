<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.argoTariffByDistance') }}</h5>
    <div class="flex w-full items-center justify-end">
      <MainButton :label="t('label.add')" @click="add" />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(price)="{ value }">
        {{ 'Rp ' + parseFloat(value).toLocaleString('id-ID') }}
      </template>
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @edit="edit" hide-disburse hide-detail />
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, type Ref } from 'vue'
import CustomTable from '../atoms/CustomTable.vue'
import CustomTableButton from '../atoms/CustomTableButton.vue'
import MainButton from '../atoms/MainButton.vue'
import { useModalStore } from '@/stores/modal'
import tariffService from '@/services/drivers/tariff.api'
import ModalTariff from '../molecules/modals/ModalTariff.vue'
import { handleErrorResponse } from '@/utils/common'
import type { PaginationRequest, TableField } from '@/types/Main'
import type {
  ArgoTariffByDistance,
  ExtendedArgoTariffByDistance
} from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 9999,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField<Partial<ArgoTariffByDistance>>[]> = ref([
  { name: 'actions', title: t('label.actions') },
  {
    name: 'distance',
    title: t('label.distance'),
    field: (val) => `${val.intervalMin}km - ${val.intervalMax}km`
  },
  { name: 'price', title: t('label.pricePerKm') }
])

const rows: Ref<ExtendedArgoTariffByDistance[]> = ref([])
const data: Ref<ArgoTariffByDistance[]> = ref([])

const getTariffs = async () => {
  rows.value = []
  try {
    const response = await tariffService.getArgoTariffByRange(pagination.value)
    data.value = response.data
    for (const item of response.data) {
      const mapped: ExtendedArgoTariffByDistance = Object.assign(item, {
        distance: { intervalMin: item.intervalMin, intervalMax: item.intervalMax },
        actions: item.id
      })
      rows.value.push(mapped)
    }
    rows.value.sort((a, b) => a.intervalMin - b.intervalMin)
  } catch (error) {
    handleErrorResponse(error)
  }
}

const add = () => {
  modal.openModal({
    component: ModalTariff,
    props: {
      title: t('label.add'),
      isAdd: true,
      data: data.value,
      tableType: 'argo'
    }
  })
  modal.onOk(() => getTariffs())
}

const edit = (id: number) => {
  modal.openModal({
    component: ModalTariff,
    props: {
      title: t('label.update'),
      id,
      data: data.value,
      tableType: 'argo'
    }
  })
  modal.onOk(() => getTariffs())
}

onMounted(() => {
  getTariffs()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg;
}
</style>
