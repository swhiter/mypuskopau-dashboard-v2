<template>
  <div class="card-container">
    <slot />
    <div class="flex items-center justify-end" v-if="hasSaveButton">
      <MainButton type="submit" :label="$t('save')" :form="buttonForm" :disabled="buttonDisabled || buttonLoading"
        :loading="buttonLoading" />
    </div>
    <ComponentLoading v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import ComponentLoading from './ComponentLoading.vue';
import MainButton from './MainButton.vue';

interface Props {
  loading?: boolean
  hasSaveButton?: boolean
  buttonDisabled?: boolean
  buttonForm?: string
  buttonLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasSaveButton: false,
  buttonDisabled: false,
  buttonForm: '',
  buttonLoading: false
})
</script>

<style scoped>
.card-container {
  @apply flex flex-col px-12 py-6 w-full bg-white rounded-lg border border-buttonGray shadow-lg space-y-4
}
</style>