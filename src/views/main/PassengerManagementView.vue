<template>
    <PageContainer :title="t('title.passengerManagement')">
      <PageCard>
        <PassengerManagementData />
      </PageCard>
    </PageContainer>
  </template>
  
  <script setup lang="ts">
  import PageCard from '@/components/atoms/PageCard.vue';
  import PageContainer from '@/components/atoms/PageContainer.vue';
  import PassengerManagementData from '@/components/organisms/PassengerManagementData.vue';
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n()
  </script>