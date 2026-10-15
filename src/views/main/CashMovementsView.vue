<template>
  <PageContainer :title="$t('title.cashMovements')">
    <PageCard>
      <CashMovementTable />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import CashMovementTable from '@/components/organisms/CashMovementTable.vue'
</script>
