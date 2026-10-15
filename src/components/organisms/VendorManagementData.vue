<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.vendorData') }}</h5>
    <div class="flex w-full items-center justify-end">
      <MainButton :label="t('label.add')" @click="add" />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @edit="edit" @delete="deleteConfirmation" hide-disburse hide-detail
          show-delete />
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, type Ref } from 'vue'
import MainButton from '../atoms/MainButton.vue'
import CustomTable from '../atoms/CustomTable.vue'
import CustomTableButton from '../atoms/CustomTableButton.vue'
import ModalVendor from '../molecules/modals/ModalVendor.vue'
import { useModalStore } from '@/stores/modal'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import vendorService from '@/services/vendor/vendor.api'
import type { TableField } from '@/types/Main'
import type { ExtendedVendor, Vendor } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()
const toast = useToasterStore()

// Dipancarkan setelah daftar vendor berubah, supaya dropdown vendor di halaman ikut diperbarui
const emits = defineEmits<{
  changed: []
}>()

const columns: Ref<TableField<Partial<Vendor>>[]> = ref([
  { name: 'actions', title: t('label.actions') },
  { name: 'name', title: t('names.vendorName') },
  {
    name: 'isActive',
    title: t('names.active'),
    field: (val) => (val ? t('names.active') : t('names.inactive'))
  }
])

const rows: Ref<ExtendedVendor[]> = ref([])

const getVendors = async (): Promise<void> => {
  try {
    const response = await vendorService.getVendors()
    rows.value = response.data.map((item) => ({ ...item, actions: item.id }))
  } catch (error) {
    handleErrorResponse(error)
  }
}

const refresh = async (): Promise<void> => {
  await getVendors()
  emits('changed')
}

const add = (): void => {
  modal.openModal({
    component: ModalVendor,
    props: { title: t('label.add'), isAdd: true }
  })
  modal.onOk(() => {
    refresh()
  })
}

const edit = (id: number): void => {
  const data = rows.value.find((item) => item.id == id)
  modal.openModal({
    component: ModalVendor,
    props: { title: t('label.update'), isAdd: false, data, id }
  })
  modal.onOk(() => {
    refresh()
  })
}

const deleteConfirmation = (id: number): void => {
  modal.openConfirmationModal(t('message.delete'))
  modal.onOk(async () => {
    try {
      await vendorService.deleteVendor(id)
      toast.success({ text: t('alert.successDelete') })
      await refresh()
    } catch (error) {
      handleErrorResponse(error)
    }
  })
}

onMounted(() => {
  getVendors()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}
</style>
