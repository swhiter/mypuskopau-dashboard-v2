<template>
  <PageContainer title="Ulasan Argo">
    <PageCard>
      <ArgoReviewsData />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import ArgoReviewsData from '@/components/organisms/ArgoReviewsData.vue';
</script>
