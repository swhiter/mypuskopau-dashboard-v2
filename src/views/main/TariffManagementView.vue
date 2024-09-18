<template>
  <PageContainer :title="$t('title.tariffManagement')">
    <PageCard has-save-button button-form="tariff-form" :loading="cardLoading" :button-loading="buttonLoading">
      <TariffManagement @card-loading="cardLoading = $event" @button-loading="buttonLoading = $event" />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import TariffManagement from '@/components/organisms/TariffManagement.vue';
import { ref, type Ref } from 'vue';

const cardLoading: Ref<boolean> = ref(false)
const buttonLoading: Ref<boolean> = ref(false)
</script>