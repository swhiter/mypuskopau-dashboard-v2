<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th scope="col" v-for="(item, index) in columns" :key="index">
            <span>{{ item.title }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="perPage && currentPage">
          <tr v-for="(item, index) in paginatedRows" :key="index">
            <td v-for="(colItem, colIndex) in columns" :key="colIndex">
              <slot :name="`cell(${colItem.name})`" :value="item[colItem.name]" :item="item">
                {{ item[colItem.name] }}
              </slot>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="(item, index) in rows" :key="index">
            <td v-for="(colItem, colIndex) in columns" :key="colIndex">
              <slot :name="`cell(${colItem.name})`" :value="item[colItem.name]" :item="item">
                {{ item[colItem.name] }}
              </slot>
            </td>
          </tr>
        </template>
        <tr v-if="rows.length == 0">
          <td :colspan="columns.length" class="px-6 py-3 text-center">{{ $t('label.noData') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { TableField } from '@/types/Main';
import { computed } from 'vue';

interface Props {
  columns: TableField[]
  rows: any[]
  currentPage?: number
  perPage?: number
}

const props = defineProps<Props>()

const paginatedRows = computed(() => {
  return props.rows.slice((props.currentPage! - 1) * props.perPage!, props.currentPage! * props.perPage!)
})
</script>

<style scoped>
.table-container {
  @apply flex flex-col w-full max-w-full bg-white rounded-lg border border-buttonGray shadow-lg overflow-x-auto
}

table {
  @apply table-auto w-full max-w-full
}

thead {
  @apply text-white font-medium text-base border-b-2
}

thead tr {
  @apply bg-buttonBiGray
}

thead tr th {
  @apply px-6 py-4
}

tbody {
  @apply text-gray-800 text-base font-medium
}

tbody tr {
  @apply border-b hover:bg-gray-100
}

tbody tr td {
  @apply px-6 py-2
}
</style>