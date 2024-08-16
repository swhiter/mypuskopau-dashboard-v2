<template>
  <nav class="inline-flex shadow-sm" aria-label="Pagination">
    <a href="#" class="paging-button" :class="{ 'disabled': isFirstPage }" :disabled="isFirstPage"
      @click.prevent="changePage(pagination.page - 1)">
      <FontAwesomeIcon class="fa-fw" :icon="faChevronLeft" />
    </a>
    <a href="#" aria-current="page" class="paging-button" @click.prevent="changePage(1)" v-if="hasFirst">
      1
    </a>
    <span class="paging-button" v-if="hasFirst">
      ...
    </span>
    <a href="#" aria-current="page" v-for="(page, index) in calculatedPages" :key="index" class="paging-button"
      :class="{ 'active': page == pagination.page }" @click.prevent="changePage(page)">
      {{ page }}
    </a>
    <span class="paging-button" v-if="hasLast">
      ...
    </span>
    <a href="#" aria-current="page" class="paging-button" @click.prevent="changePage(pagination.totalPages)"
      v-if="hasLast">
      {{ pagination.totalPages }}
    </a>
    <a href="#" class="paging-button" :class="{ 'disabled': isLastPage }" :disabled="isLastPage"
      @click.prevent="changePage(pagination.page + 1)">
      <FontAwesomeIcon class="fa-fw" :icon="faChevronRight" />
    </a>
  </nav>
</template>

<script setup lang="ts">
import type { PaginationRequest } from '@/types/Main';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { computed, onMounted, ref, type Ref } from 'vue';

const props = defineProps<{
  pagination: PaginationRequest
}>()

const emits = defineEmits<{
  pageChanged: [page: number]
  pageLimit: [limit: number]
}>()

const pageRange: number = 2

let pageLimit: Ref<number> = ref(5)

// Computed
const isFirstPage = computed<boolean>(() => {
  return props.pagination.page === 1
})
const isLastPage = computed<boolean>(() => {
  return props.pagination.page >= props.pagination.totalPages
})
const rangeStart = computed<number>(() => {
  let start: number = props.pagination.page - pageRange
  return (start > 0) ? start : 1
})
const rangeEnd = computed<number>(() => {
  let end: number = props.pagination.page + pageRange
  return (end < props.pagination.totalPages) ? end : props.pagination.totalPages
})
const hasFirst = computed<boolean>(() => {
  return rangeStart.value !== 1
})
const hasLast = computed<boolean>(() => {
  return rangeEnd.value !== props.pagination.totalPages
})
const calculatedPages = computed(() => {
  let pages = []
  for (let i = rangeStart.value; i <= rangeEnd.value; i++) {
    pages.push(i)
  }
  return pages
})
const paginationFrom = computed<number>(() => {
  return (props.pagination.limit * (props.pagination.page - 1)) + 1
})
const paginationTo = computed<number>(() => {
  let end: number = props.pagination.page * props.pagination.limit
  return (props.pagination.totalRows < end) ? props.pagination.totalRows : end
})

// Function
const changePage = (page: number) => {
  if (page > 0 && page <= props.pagination.totalPages) {
    emits('pageChanged', page)
  }
}
const changeLimit = (limit: number) => {
  emits('pageLimit', limit)
}

onMounted(() => {
  pageLimit.value = props.pagination.limit
})
</script>

<style scoped>
.paging-button {
  @apply inline-flex items-center p-2 first:rounded-l-lg last:rounded-r-lg border text-xs font-medium hover:bg-primaryBlue min-w-8 justify-center
}

.active {
  @apply bg-buttonBiGray hover:bg-primaryDarkBlue !text-white
}

.disabled {
  @apply cursor-not-allowed bg-buttonGray hover:bg-buttonGray
}
</style>