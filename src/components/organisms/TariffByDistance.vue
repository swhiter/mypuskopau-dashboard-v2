<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.tariffByDistanceData') }}</h5>
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
import { useI18n } from 'vue-i18n';
import CustomTable from '../atoms/CustomTable.vue';
import { inject, onMounted, ref, type Ref } from 'vue';
import type { PaginationRequest, TableField } from '@/types/Main';
import MainButton from '../atoms/MainButton.vue';
import { useModalStore } from '@/stores/modal';
import ModalTariff from '../molecules/modals/ModalTariff.vue';
import type { ExtendedTariffByDistance, TariffByDistance } from '@/types/Data';
import { handleErrorResponse } from '@/utils/common';
import tariffService from '@/services/drivers/tariff.api';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import { tariffState } from '@/injects/keys';

const { t } = useI18n()
const modal = useModalStore()

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 9999,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField<Partial<TariffByDistance>>[]> = ref([
  {
    name: 'actions',
    title: t('label.actions')
  },
  {
    name: 'distance',
    title: t('label.distance'),
    field: (val) => {
      return `${val.intervalMin}km - ${val.intervalMax}km`
    }
  },
  {
    name: 'price',
    title: t('label.pricePerKm')
  }
])

const rows: Ref<ExtendedTariffByDistance[]> = ref([])
const data: Ref<TariffByDistance[]> = ref([])

const parentTariffByDistance = inject(tariffState)

const getTariffs = async () => {
  rows.value = []
  try {
    const response = await tariffService.getTariffByRange(pagination.value)
    data.value = response.data
    parentTariffByDistance!.updateData(response.data)
    for (let item of response.data) {
      const res: ExtendedTariffByDistance = Object.assign(item, {
        distance: { intervalMin: item.intervalMin, intervalMax: item.intervalMax },
        actions: item.id
      })
      rows.value.push(res)
      rows.value.sort((a, b) => a.intervalMin - b.intervalMin)
    }
  } catch (error) {
    handleErrorResponse(error)
  }
}

const add = () => {
  modal.openModal({
    component: ModalTariff,
    props: { title: t('label.add'), isAdd: true, data: data.value }
  })
  modal.onOk(() => {
    getTariffs()
  })
}

const edit = (id: number) => {
  modal.openModal({
    component: ModalTariff,
    props: { title: t('label.update'), id: id, data: data.value }
  })
  modal.onOk(() => {
    getTariffs()
  })
}

onMounted(() => {
  getTariffs()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}
</style>