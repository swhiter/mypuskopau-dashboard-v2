<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h5 class="title">Nomor Mobil Sedang Dipakai</h5>
        <p class="subtitle">
          Nomor mobil terkunci untuk driver selama sesi login-nya aktif (maks. 24 jam) dan otomatis lepas saat driver
          logout. Lepaskan manual jika HP driver hilang atau driver lupa logout.
        </p>
      </div>
      <MainButton type="button" label="Muat Ulang" outline :loading="loading" @click="getActive" />
    </div>

    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ item }">
        <MainButton type="button" label="Lepaskan" outline white @click="releaseConfirmation(item)" />
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { DateTime } from 'luxon';
import MainButton from '@/components/atoms/MainButton.vue';
import CustomTable from '@/components/atoms/CustomTable.vue';
import carAssignmentService from '@/services/car-assignment/car-assignment.api';
import type { ActiveCarAssignment } from '@/types/Data';
import type { TableField } from '@/types/Main';
import { handleErrorResponse } from '@/utils/common';
import { useModalStore } from '@/stores/modal';
import { useToasterStore } from '@/stores/toaster';

const modal = useModalStore()
const toast = useToasterStore()

const formatWib = (value: string | null): string =>
  value ? DateTime.fromISO(value).setZone('Asia/Jakarta').toFormat('dd/MM/yyyy HH:mm') : '-'

const columns: Ref<TableField<any>[]> = ref([
  { name: 'actions', title: 'Aksi' },
  { name: 'carName', title: 'Nomor Mobil' },
  { name: 'driverName', title: 'Driver' },
  { name: 'licensePlate', title: 'Plat Nomor' },
  { name: 'assignedAt', title: 'Dipilih Sejak (WIB)', field: formatWib },
  { name: 'sessionExpiredAt', title: 'Sesi Berakhir (WIB)', field: formatWib },
])

const rows: Ref<(ActiveCarAssignment & { actions: number })[]> = ref([])
const loading: Ref<boolean> = ref(false)

const getActive = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await carAssignmentService.getActive()
    rows.value = response.data.map(item => ({ ...item, actions: item.id }))
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const releaseConfirmation = (item: ActiveCarAssignment) => {
  modal.openConfirmationModal(`Lepaskan nomor mobil ${item.carName} dari ${item.driverName}?`)
  modal.onOk(async () => {
    try {
      await carAssignmentService.release(item.id)
      toast.success({ text: `Nomor mobil ${item.carName} berhasil dilepas` })
      await getActive()
    } catch (error) {
      handleErrorResponse(error)
    }
  })
}

onMounted(() => {
  getActive()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}

.subtitle {
  @apply text-sm text-gray-500 max-w-3xl
}
</style>
