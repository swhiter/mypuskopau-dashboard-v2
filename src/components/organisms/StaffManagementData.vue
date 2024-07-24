<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.staffInformationData') }}</h5>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @edit="edit" @detail="detail" />
      </template>
      <template #cell(photo)="{ value }">
        <CustomTableImageViewer :image="value" />
      </template>
    </CustomTable>
    <div class="flex w-full justify-end items-center">
      <CustomTablePagination :pagination="pagination" @page-changed="paginationRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CustomTable from '../atoms/CustomTable.vue';
import type { PaginationRequest, TableField } from '@/types/Main';
import { handleErrorResponse } from '@/utils/common';
import type { ExtendedStaff, Staff } from '@/types/Data';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import CustomTableImageViewer from '../atoms/CustomTableImageViewer.vue';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';
import { formState } from '@/injects/keys';
import staffService from '@/services/drivers/staff.api';

const { t } = useI18n()

const emits = defineEmits<{
  select: [staff: Staff]
}>()

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 10,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField[]> = ref([
  {
    name: 'actions',
    title: t('label.actions')
  },
  {
    name: 'name',
    title: t('label.staffName')
  },
  {
    name: 'nik',
    title: t('label.idCardNumber')
  },
  {
    name: 'userId',
    title: t('label.staffId')
  },
  {
    name: 'photo',
    title: t('label.profilePhoto')
  },
])

const rows: Ref<ExtendedStaff[]> = ref([])
const selectedStaff: Ref<Staff | null> = ref(null)

const parentForm = inject(formState)

watch(parentForm!.submitted, (newValue, oldValue) => {
  if (newValue != oldValue) {
    getStaffs()
  }
})

const getStaffs = async (): Promise<void> => {
  rows.value = []
  try {
    const response = await staffService.getStaff(pagination.value)
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    for (let item of response.data) {
      const res: ExtendedStaff = Object.assign(item, { actions: item.id! })
      rows.value.push(res)
    }
  } catch (error) {
    handleErrorResponse(error)
  }
}

const getStaffById = async (id: number): Promise<void> => {
  try {
    const response = await staffService.getStaffById(id)
    selectedStaff.value = response.data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const edit = async (id: number): Promise<void> => {
  parentForm?.updateLoadingState()
  await getStaffById(id)
  emits('select', selectedStaff.value!)
  parentForm?.updateLoadingState()
}

const detail = async (id: number): Promise<void> => {
  await getStaffById(id)
}

const paginationRequest = async (page: number): Promise<void> => {
  pagination.value.page = page
  await getStaffs()
}

onMounted(() => {
  getStaffs()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}
</style>