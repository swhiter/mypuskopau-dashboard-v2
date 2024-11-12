<template>
  <PageContainer :title="t('title.carManagement')">
    <PageCard>
      <CarManagementData />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import CarManagementData from '@/components/organisms/CarManagementData.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
</script>