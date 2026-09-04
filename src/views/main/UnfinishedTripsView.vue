<template>
  <PageContainer title="Trip Bermasalah">
    <PageCard>
      <UnfinishedTripsData />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import UnfinishedTripsData from '@/components/organisms/UnfinishedTripsData.vue';
</script>
