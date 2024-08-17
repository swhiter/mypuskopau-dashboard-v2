<template>
  <div class="flex w-full">
    <div id="map" class="w-full aspect-video bg-blue-400"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { Marker, type LatLngExpression } from 'leaflet';
import { getDriversPosition, initializeMap, updateDriversPosition } from '@/utils/mapUtils';
import type { Position } from '@/types/Position';
import type { PaginationRequest } from '@/types/Main';
import { handleErrorResponse } from '@/utils/common';
import driverService from '@/services/drivers/drivers.api';

const positions: Ref<Position[]> = ref([])
const drivers: Ref<Marker[]> = ref([])

const center: Ref<LatLngExpression> = ref([-6.2653379, 106.8829779])
const zoom: Ref<number> = ref(17)

let intervalId: number

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 9999,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const getDrivers = async (): Promise<void> => {
  try {
    const response = await driverService.getDrivers(pagination.value)
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    positions.value = []
    for (let item of response.data) {
      if (item.status != 3) {
        positions.value.push({
          lat: item.lastLatitude,
          lng: item.lastLongitude,
          title: item.name,
          status: item.status
        })
      }
    }
  } catch (error) {
    handleErrorResponse(error)
  }
}

onMounted(async () => {
  const map = initializeMap(center.value, zoom.value)

  // Get data Driver
  await getDrivers()

  // Inisialisasi Posisi Awal Driver
  drivers.value = getDriversPosition(map, positions.value)

  intervalId = window.setInterval(async () => {
    await getDrivers()
    drivers.value = updateDriversPosition(map, drivers.value, positions.value)
  }, 60000) // Update setiap 1 menit
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>