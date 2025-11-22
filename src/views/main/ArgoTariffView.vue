<template>
  <PageContainer :title="$t('title.argoTariffManagement')">
    <!-- TARIF MINIMUM ARGO -->
    <PageCard
      has-save-button
      button-form="argo-tariff-form"
      :loading="cardLoading"
      :button-loading="buttonLoading"
    >
      <ArgoTariffManagement
        @cardLoading="cardLoading = $event"
        @buttonLoading="buttonLoading = $event"
      />
    </PageCard>

    <!-- RENTANG TARIF ARGO -->
    <PageCard>
      <ArgoTariffByDistance />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import ArgoTariffManagement from '@/components/organisms/ArgoTariffManagement.vue'
import ArgoTariffByDistance from '@/components/organisms/ArgoTariffByDistance.vue'

const cardLoading = ref(false)
const buttonLoading = ref(false)
</script>
