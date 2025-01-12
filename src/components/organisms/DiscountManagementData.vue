<template>
    <div class="space-y-4">
      <h5 class="title">{{ t('title.discountManagement') }}</h5>
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
  import type { Discount, ExtendedDiscount } from '@/types/Data';
  import CustomTable from '../atoms/CustomTable.vue';
  import CustomTableButton from '../atoms/CustomTableButton.vue';
  import { handleErrorResponse } from '@/utils/common';
  import discountsService from '@/services/drivers/discount.api';
  import ModalDiscount from '../molecules/modals/ModalDiscount.vue';
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
  
  const columns: Ref<TableField<Partial<Discount>>[]> = ref([
    {
      name: 'actions',
      title: t('label.actions')
    },
    {
      name: 'discount',
      title: t('label.discount')
    },
    {
      name: 'status',
      title: t('label.statusDiscount'),
      field: (val) => (val === 1 ? t('label.active') : t('label.inactive'))
    }
  ])
  
  const rows: Ref<ExtendedDiscount[]> = ref([])
  const data: Ref<Discount | null> = ref(null)
  
  const getDiscounts = async () => {
    rows.value = []
    try {
      const response = await discountsService.getDiscounts(pagination.value)
      pagination.value.totalPages = response.pageCount
      pagination.value.totalRows = response.total
      for (let item of response.data) {
        const res: ExtendedDiscount = Object.assign(item, { actions: item.id })
        rows.value.push(res)
      }
    } catch (error) {
      handleErrorResponse(error)
    }
  }
  
  const add = () => {
    modal.openModal({
      component: ModalDiscount,
      props: { title: t('label.add'), isAdd: true, data: data.value }
    })
    modal.onOk(() => {
      getDiscounts()
    })
  }
  
  const edit = (id: number) => {
    const findData = rows.value.find(item => item.id == id)
    modal.openModal({
      component: ModalDiscount,
      props: { title: t('label.update'), isAdd: false, data: findData, id: id }
    })
    modal.onOk(() => {
      getDiscounts()
    })
  }
  
  const deleteConfirmation = (id: number) => {
    modal.openConfirmationModal(t('message.delete'))
    modal.onOk(async () => {
      await discountsService.deleteDiscount(id)
      toast.success({ text: t('alert.successDelete') })
      getDiscounts()
    })
  }
  
  const paginationRequest = async (page: number): Promise<void> => {
    pagination.value.page = page
    await getDiscounts()
  }
  
  onMounted(() => {
    getDiscounts()
  })
  </script>
  
  <style scoped>
  .title {
    @apply font-semibold text-lg
  }
  </style>