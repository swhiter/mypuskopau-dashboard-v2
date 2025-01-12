<template>
    <div class="space-y-4">
      <h5 class="title">{{ t('title.passengerManagement') }}</h5>
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
  import type { Passenger, ExtendedPassenger } from '@/types/Data';
  import CustomTable from '../atoms/CustomTable.vue';
  import CustomTableButton from '../atoms/CustomTableButton.vue';
  import { handleErrorResponse } from '@/utils/common';
  import passengersService from '@/services/drivers/passenger.api';
  import ModalPassenger from '../molecules/modals/ModalPassenger.vue';
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
  
  const columns: Ref<TableField<Partial<Passenger>>[]> = ref([
    {
      name: 'actions',
      title: t('label.actions')
    },
    {
      name: 'maxPassenger',
      title: t('label.maxPassenger')
    },
    {
      name: 'price',
      title: t('label.pricePassenger'),
      field: (val) => `${val}`
    }
  ])
  
  const rows: Ref<ExtendedPassenger[]> = ref([])
  const data: Ref<Passenger | null> = ref(null)
  
  const getPassengers = async () => {
    rows.value = []
    try {
      const response = await passengersService.getPassengers(pagination.value)
      pagination.value.totalPages = response.pageCount
      pagination.value.totalRows = response.total
      for (let item of response.data) {
        const res: ExtendedPassenger = Object.assign(item, { actions: item.id })
        rows.value.push(res)
      }
    } catch (error) {
      handleErrorResponse(error)
    }
  }
  
  const add = () => {
    modal.openModal({
      component: ModalPassenger,
      props: { title: t('label.add'), isAdd: true, data: data.value }
    })
    modal.onOk(() => {
      getPassengers()
    })
  }
  
  const edit = (id: number) => {
    const findData = rows.value.find(item => item.id == id)
    modal.openModal({
      component: ModalPassenger,
      props: { title: t('label.update'), isAdd: false, data: findData, id: id }
    })
    modal.onOk(() => {
      getPassengers()
    })
  }
  
  const deleteConfirmation = (id: number) => {
    modal.openConfirmationModal(t('message.delete'))
    modal.onOk(async () => {
      await passengersService.deletePassenger(id)
      toast.success({ text: t('alert.successDelete') })
      getPassengers()
    })
  }
  
  const paginationRequest = async (page: number): Promise<void> => {
    pagination.value.page = page
    await getPassengers()
  }
  
  onMounted(() => {
    getPassengers()
  })
  </script>
  
  <style scoped>
  .title {
    @apply font-semibold text-lg
  }
  </style>