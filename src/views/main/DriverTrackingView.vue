<template>
  <PageContainer :title="$t('title.driverTracking')">
    <PageCard>
      <MapTracker />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import MapTracker from '@/components/atoms/MapTracker.vue';
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
</script>