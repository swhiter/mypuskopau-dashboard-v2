<template>
  <PageContainer :title="$t('title.driverManagement')">
    <PageCard>
      <TargetDriverManagement />
    </PageCard>
    <PageCard has-save-button button-form="driver-form" :button-disabled="!saveEnabled" :loading="isFormLoading">
      <DriverManagement @save-enabled="saveEnabled = $event" />
    </PageCard>
    <PageCard>
      <DriverManagementData />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import DriverManagement from '@/components/organisms/DriverManagement.vue';
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import DriverManagementData from '@/components/organisms/DriverManagementData.vue';
import TargetDriverManagement from '@/components/organisms/TargetDriverManagement.vue';
import { provide, ref, type Ref } from 'vue';
import { formState } from '@/injects/keys';

const saveEnabled: Ref<boolean> = ref(false)
const isFormLoading: Ref<boolean> = ref(false)
const isFormSubmitted: Ref<boolean> = ref(false)

const updateLoadingState = (): void => {
  isFormLoading.value = !isFormLoading.value
}

const updateSubmittedState = (): void => {
  isFormSubmitted.value = !isFormSubmitted.value
}

provide(formState, {
  loading: isFormLoading,
  submitted: isFormSubmitted,
  updateLoadingState: updateLoadingState,
  updateSubmittedState: updateSubmittedState
})
</script>