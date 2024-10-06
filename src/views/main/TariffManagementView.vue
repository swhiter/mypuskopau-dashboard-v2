<template>
  <PageContainer :title="$t('title.tariffManagement')">
    <PageCard has-save-button button-form="tariff-form" :loading="cardLoading" :button-loading="buttonLoading">
      <TariffManagement @card-loading="cardLoading = $event" @button-loading="buttonLoading = $event" />
    </PageCard>
    <PageCard :loading="cardDistanceLoading">
      <TariffByDistance />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import TariffByDistance from '@/components/organisms/TariffByDistance.vue';
import TariffManagement from '@/components/organisms/TariffManagement.vue';
import { tariffState } from '@/injects/keys';
import type { TariffByDistance as TariffByDistances } from '@/types/Data';
import { provide, ref, type Ref } from 'vue';

const cardLoading: Ref<boolean> = ref(false)
const buttonLoading: Ref<boolean> = ref(false)
const cardDistanceLoading: Ref<boolean> = ref(false)

const tariffByDistanceData: Ref<TariffByDistances[]> = ref([])

const updateData = (data: TariffByDistances[]): void => {
  tariffByDistanceData.value = data
}

provide(tariffState, {
  data: tariffByDistanceData,
  updateData: updateData
})
</script>