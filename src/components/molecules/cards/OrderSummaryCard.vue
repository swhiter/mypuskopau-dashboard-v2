<template>
  <DashboardCard :title="t('title.order')" :loading="loading">
    <div class="grid grid-cols-2 gap-2">
      <PageInnerCard v-for="(item, index) in orderSummary" :key="index">
        <div class="flex w-full">
          <div class="flex flex-col w-2/3 space-y-1">
            <span class="text-2xl font-bold">
              {{ item.total }}
            </span>
            <span class="text-base opacity-50">
              {{ item.title }}
            </span>
          </div>
          <div class="flex w-1/3 items-center justify-end">
            <span class="material-symbols-outlined text-5xl" :class="`text-${item.color}`">{{ item.icon }}</span>
          </div>
        </div>
      </PageInnerCard>
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import DashboardCard from '@/components/atoms/DashboardCard.vue';
import PageInnerCard from '@/components/atoms/PageInnerCard.vue';
import type { OrderCountByStatus } from '@/types/Dashboard';
import { ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

interface Props {
  summary: OrderCountByStatus
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})
const { summary } = toRefs(props)

const orderSummary = ref([
  {
    name: 'totalOrder',
    title: t('title.totalOrder'),
    total: summary.value.totalOrder,
    icon: 'order_approve',
    color: 'black'
  },
  {
    name: 'pendingOrders',
    title: t('title.pendingOrder'),
    total: summary.value.pendingOrders,
    icon: 'schedule',
    color: 'primaryDarkBlue'
  },
  {
    name: 'successfulOrders',
    title: t('title.successOrder'),
    total: summary.value.successfulOrders,
    icon: 'check_circle',
    color: 'accentDarkGreen'
  },
  {
    name: 'failedOrders',
    title: t('title.failedOrder'),
    total: summary.value.failedOrders,
    icon: 'cancel',
    color: 'accentRed'
  }
])

watch(summary, (newValue) => {
  const keys = Object.keys(newValue)
  for (const name of keys) {
    for (const [index, item] of orderSummary.value.entries()) {
      if (item.name == name) {
        orderSummary.value[index].total = newValue[name as keyof OrderCountByStatus]
      }
    }
  }
})
</script>