<template>
  <div class="flex items-center justify-center space-x-2">
    <button type="button" @click="edit()" v-if="!hideEdit">
      <span class="material-symbols-outlined">edit</span>
    </button>
    <button type="button" @click="emits('detail', value)" v-if="!hideDetail">
      <span class="material-symbols-outlined">order_approve</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number | string | boolean | object | unknown
  hideEdit?: boolean
  hideDetail?: boolean
}

const emits = defineEmits<{
  edit: [edit: any]
  detail: [detail: any]
}>()

const props = withDefaults(defineProps<Props>(), {
  hideEdit: false,
  hideDetail: false
})

const edit = () => {
  emits('edit', props.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
button {
  @apply flex p-1.5 bg-buttonBiGray text-white rounded-lg
}
</style>