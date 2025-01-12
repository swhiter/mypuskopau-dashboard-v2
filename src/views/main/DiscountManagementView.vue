<template>
    <PageContainer :title="t('title.discountManagement')">
      <PageCard>
        <DiscountManagementData />
      </PageCard>
    </PageContainer>
  </template>
  
  <script setup lang="ts">
  import PageCard from '@/components/atoms/PageCard.vue';
  import PageContainer from '@/components/atoms/PageContainer.vue';
  import DiscountManagementData from '@/components/organisms/DiscountManagementData.vue';
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n()
  </script>