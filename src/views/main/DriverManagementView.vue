<template>
  <PageContainer :title="$t('title.driverManagement')">
    <PageCard has-save-button button-form="driver-form" :button-disabled="!saveEnabled" :loading="isFormLoading">
      <DriverManagement :driver="selectedDriver" @save-enabled="saveEnabled = $event" />
    </PageCard>
    <PageCard>
      <DriverManagementData @select="selectedDriver = $event" />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import DriverManagement from '@/components/organisms/DriverManagement.vue';
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import DriverManagementData from '@/components/organisms/DriverManagementData.vue';
import { provide, ref, type Ref } from 'vue';
import type { Driver } from '@/types/Data';
import { formState } from '@/injects/keys';

const selectedDriver: Ref<Driver | null> = ref(null)
const saveEnabled: Ref<boolean> = ref(false)
const isFormLoading: Ref<boolean> = ref(false)

const updateLoadingState = (): void => {
  isFormLoading.value = !isFormLoading.value
}

provide(formState, { loading: isFormLoading, updateLoadingState: updateLoadingState })
</script>