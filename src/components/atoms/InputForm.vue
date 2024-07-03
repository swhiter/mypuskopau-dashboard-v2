<template>
  <div class="form-group" :class="{ 'multi-row': isSeparateRow }">
    <div class="label" :class="isSeparateRow ? 'w-fit' : `w-${labelSpacing}/12`">
      <label :for="name">{{ label }}</label>
    </div>
    <div class="input-container"
      :class="[(isSeparateRow ? 'w-full' : `w-${fieldSize}/12`), { 'border border-black': bordered }]">
      <span class="input-affix pre" v-if="prefix">{{ prefix }}</span>
      <textarea :name="name" :id="name" v-model="(value as string)" class="input"
        :class="{ 'invalid': meta.touched && !meta.valid }" :disabled="disabled" @change="handleChange"
        @blur="handleBlur" v-if="inputType == 'textarea'"></textarea>
      <input :type="inputType" :name="name" :id="name" v-model="value" :placeholder="placeholder" class="input"
        :class="{ 'invalid': meta.touched && !meta.valid }" :disabled="disabled" @change="handleChange"
        @blur="handleBlur" v-else>
      <span class="input-affix suf" v-if="suffix">{{ suffix }}</span>
      <button class="password-toggler" v-if="hasPasswordToggler" @click="togglePassword()">
        <FontAwesomeIcon class="fa-fw" :icon="faEye" v-if="isPasswordShown" />
        <FontAwesomeIcon class="fa-fw" :icon="faEyeSlash" v-else />
      </button>
    </div>
    <span class="error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { computed, ref, type Ref } from 'vue';
import { useField } from 'vee-validate';

interface Props {
  name: string
  label: string
  modelValue: string | number | boolean | null
  type?: string
  placeholder?: string
  rules?: string | Record<string, any>
  disabled?: boolean
  isSeparateRow?: boolean
  hasPasswordToggler?: boolean
  prefix?: string | null
  suffix?: string | null
  labelSpacing?: number
  fieldSize?: number
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  isSeparateRow: false,
  hasPasswordToggler: false,
  prefix: null,
  suffix: null,
  labelSpacing: 4,
  fieldSize: 8,
  bordered: false
})

const { handleChange, value, handleBlur, errorMessage, meta } = useField(() => props.name, props.rules, { syncVModel: true })

const isPasswordShown: Ref<boolean> = ref(false)

const inputType = computed<string>(() => {
  if (props.hasPasswordToggler) {
    if (isPasswordShown.value) {
      return 'text'
    } else {
      return 'password'
    }
  } else {
    return props.type
  }
})

const togglePassword = (): void => {
  isPasswordShown.value = !isPasswordShown.value
}
</script>

<style scoped>
.form-group {
  @apply flex w-full space-y-2
}

.multi-row {
  @apply flex-col
}

.label {
  @apply font-semibold text-sm 2xl:text-base flex items-center
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