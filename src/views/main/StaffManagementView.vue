<template>
  <PageContainer :title="$t('title.staffManagement')">
    <PageCard has-save-button button-form="staff-form" :button-disabled="!saveEnabled" :loading="isFormLoading">
      <StaffManagement @save-enabled="saveEnabled = $event" />
    </PageCard>
    <PageCard>
      <StaffManagementData />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import StaffManagement from '@/components/organisms/StaffManagement.vue';
import StaffManagementData from '@/components/organisms/StaffManagementData.vue';
import { formState } from '@/injects/keys';
import { provide, ref, type Ref } from 'vue';

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