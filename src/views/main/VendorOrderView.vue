<template>
  <PageContainer :title="$t('title.vendorOrder')">
    <!-- RIWAYAT STRUK VENDOR -->
    <PageCard>
      <VendorOrderData ref="vendorOrderData" />
    </PageCard>

    <!-- DAFTAR VENDOR -->
    <PageCard>
      <VendorManagementData @changed="vendorOrderData?.getVendors()" />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import VendorOrderData from '@/components/organisms/VendorOrderData.vue'
import VendorManagementData from '@/components/organisms/VendorManagementData.vue'

const vendorOrderData = ref<InstanceType<typeof VendorOrderData> | null>(null)
</script>
