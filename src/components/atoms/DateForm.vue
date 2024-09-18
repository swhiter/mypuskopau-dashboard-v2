<template>
  <div class="form-group" :class="{ 'multi-row': isSeparateRow }">
    <div class="label"
      :class="[(isSeparateRow ? 'w-fit' : `w-${labelSpacing}/12`), { 'font-semibold': semiboldLabel }]">
      <label :for="name">{{ label }}</label>
    </div>
    <div class="input-container"
      :class="[(isSeparateRow ? 'w-full' : `w-${fieldSize}/12`), { 'border border-black': bordered }]">
      <input type="date" :name="name" :id="name" v-model="value" class="input"
        :class="{ 'invalid': meta.touched && !meta.valid }" :disabled="disabled" @change="handleChange"
        @blur="handleBlur">
    </div>
    <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';

interface Props {
  name: string
  label: string
  modelValue: number | string | boolean | null
  rules?: string | Record<string, any>
  disabled?: boolean
  isSeparateRow?: boolean
  labelSpacing?: number
  fieldSize?: number
  bordered?: boolean
  semiboldLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  isSeparateRow: false,
  prefix: null,
  suffix: null,
  labelSpacing: 4,
  fieldSize: 8,
  bordered: false,
  semiboldLabel: false
})

const { handleChange, value, handleBlur, errorMessage, meta } = useField(() => props.name, props.rules, { syncVModel: true })
</script>

<style scoped>
.form-group {
  @apply flex w-full space-y-2
}

.multi-row {
  @apply flex-col
}

.label {
  @apply text-sm 2xl:text-base flex items-center
}

.input-container {
  /* Default State */
  @apply flex items-center rounded-lg bg-buttonGray
  /* Focus State */
  focus-within:ring-2 focus-within:border-primarySkyBlue focus-within:ring-primarySkyBlue
  /* Error State */
  has-[.invalid]:border has-[.invalid]:border-accentRed has-[.invalid]:focus-within:ring-1 has-[.invalid]:focus-within:ring-accentRed
}

.input {
  @apply flex w-full items-center px-4 py-2 rounded-lg bg-transparent placeholder:text-black placeholder:opacity-50 focus:outline-none
}

.input-affix {
  /* @apply px-2 */
}

.pre {
  @apply pl-4 pr-2 border-r border-black
}

.suf {
  @apply pl-2 pr-4 border-l border-black
}

.password-toggler {
  @apply flex items-center justify-center pr-4 pl-2
}

.error-message {
  @apply text-accentRed text-sm
}
</style>