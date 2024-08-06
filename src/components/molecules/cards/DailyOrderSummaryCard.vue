<template>
  <DashboardCard :title="t('title.order')">
    <!--  -->
  </DashboardCard>
</template>

<script setup lang="ts">
import DashboardCard from '@/components/atoms/DashboardCard.vue';
import type { DailyOrder } from '@/types/Dashboard';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

interface Props {
  summary: DailyOrder
}
</script>