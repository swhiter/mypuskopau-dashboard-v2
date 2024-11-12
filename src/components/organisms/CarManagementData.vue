<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.carData') }}</h5>
    <div class="flex w-full items-center justify-end">
      <MainButton :label="t('label.add')" @click="add" />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @edit="edit" @delete="deleteConfirmation" hide-disburse hide-detail
          show-delete />
      </template>
    </CustomTable>
    <div class="flex w-full justify-end items-center">
      <CustomTablePagination :pagination="pagination" @page-changed="paginationRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import MainButton from '../atoms/MainButton.vue';
import { useModalStore } from '@/stores/modal';
import { onMounted, ref, type Ref } from 'vue';
import type { PaginationRequest, TableField } from '@/types/Main';
import type { Car, ExtendedCar } from '@/types/Data';
import CustomTable from '../atoms/CustomTable.vue';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import { handleErrorResponse } from '@/utils/common';
import carsService from '@/services/drivers/cars.api';
import ModalCar from '../molecules/modals/ModalCar.vue';
import { useToasterStore } from '@/stores/toaster';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';

const { t } = useI18n()
const modal = useModalStore()
const toast = useToasterStore()

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 10,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField<Partial<Car>>[]> = ref([
  {
    name: 'actions',
    title: t('label.actions')
  },
  {
    name: 'carName',
    title: t('label.carName')
  },
  {
    name: 'driverPercentage',
    title: t('label.driverPercentage'),
    field: (val) => `${val}%`
  },
  {
    name: 'managementPercentage',
    title: t('label.managementPercentage'),
    field: (val) => `${val}%`
  },
  {
    name: 'description',
    title: t('names.description')
  }
])

const rows: Ref<ExtendedCar[]> = ref([])
const data: Ref<Car | null> = ref(null)

const getCars = async () => {
  rows.value = []
  try {
    const response = await carsService.getCars(pagination.value)
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    for (let item of response.data) {
      const res: ExtendedCar = Object.assign(item, { actions: item.id })
      rows.value.push(res)
    }
  } catch (error) {
    handleErrorResponse(error)
  }
}

const add = () => {
  modal.openModal({
    component: ModalCar,
    props: { title: t('label.add'), isAdd: true, data: data.value }
  })
  modal.onOk(() => {
    getCars()
  })
}

const edit = (id: number) => {
  const findData = rows.value.find(item => item.id == id)
  modal.openModal({
    component: ModalCar,
    props: { title: t('label.update'), isAdd: false, data: findData, id: id }
  })
  modal.onOk(() => {
    getCars()
  })
}

const deleteConfirmation = (id: number) => {
  modal.openConfirmationModal(t('message.delete'))
  modal.onOk(async () => {
    await carsService.deleteCar(id)
    toast.success({ text: t('alert.successDelete') })
    getCars()
  })
}

const paginationRequest = async (page: number): Promise<void> => {
  pagination.value.page = page
  await getCars()
}

onMounted(() => {
  getCars()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}
</style>