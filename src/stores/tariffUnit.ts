import satuanTarifService from '@/services/drivers/satuan-tarif.api'
import type { SatuanTarif } from '@/types/Data'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// Satuan jarak tarif (m_satuan_tarif): satuan yang sedang dikonfigurasi
// dan satuan yang dipakai untuk perhitungan harga.
export const useTariffUnitStore = defineStore('tariffUnit', () => {
  const units = ref<SatuanTarif[]>([])

  const configUnit = computed(() => units.value.find((item) => item.isActiveConfig) ?? null)
  const priceUnit = computed(() => units.value.find((item) => item.isActivePrice) ?? null)

  // Suffix input/label pada halaman tarif, default km seperti sebelumnya
  const configSuffix = computed(() => configUnit.value?.satuan.toLowerCase() ?? 'km')

  async function fetchUnits(): Promise<void> {
    const response = await satuanTarifService.getSatuanTarif()
    units.value = [...response.data].sort((a, b) => a.id - b.id)
  }

  async function setActiveConfig(id: number): Promise<void> {
    await satuanTarifService.setActiveConfig(id)
    await fetchUnits()
  }

  async function implement(id: number): Promise<void> {
    await satuanTarifService.implement(id)
    await fetchUnits()
  }

  return { units, configUnit, priceUnit, configSuffix, fetchUnits, setActiveConfig, implement }
})
