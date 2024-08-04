<template>
  <PageContainer :title="$t('title.orderManagement')">
    <PageCard>
      <div class="space-y-4">
        <OrderManagementData />
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import OrderManagementData from '@/components/organisms/OrderManagementData.vue';

</script>