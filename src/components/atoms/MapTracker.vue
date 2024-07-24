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

const positions: Ref<Position[]> = ref([
  { lat: -6.264814, lng: 106.883987, title: 'Pin 1' },
  { lat: -6.263818, lng: 106.885989, title: 'Pin 2' },
  { lat: -6.262986, lng: 106.885318, title: 'Pin 3' },
])
const drivers: Ref<Marker[]> = ref([])

const center: Ref<LatLngExpression> = ref([-6.2653379, 106.8829779])
const zoom: Ref<number> = ref(17)

let intervalId: number

onMounted(() => {
  const map = initializeMap(center.value, zoom.value)

  // Inisialisasi Posisi Awal Driver
  drivers.value = getDriversPosition(map, positions.value)

  intervalId = setInterval(() => {
    drivers.value = updateDriversPosition(map, drivers.value, positions.value)
  }, 60000) // Update setiap 1 menit
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>