<template>
  <div class="form-group" :class="{ 'multi-row': isSeparateRow }">
    <div class="label"
      :class="[(isSeparateRow ? 'w-fit' : `w-${labelSpacing}/12`), { 'font-semibold': semiboldLabel }]">
      <label :for="name">{{ label }}</label>
    </div>
    <div class="input-container" :class="[
      (isSeparateRow ? 'w-full' : `w-${fieldSize}/12`),
      { 'border border-dashed': bordered },
      (isDragging ? 'border-green-400' : 'border-black'),
      { 'h-full': grow }
    ]" @dragover="dragOver" @dragleave="dragLeave" @drop="drop">
      <template v-if="files && files.length != 0">
        <div v-for="(item, index) in files" :key="index" class="preview-container">
          <div class="input-preview">
            <img :src="readImage(item)" :alt="item.name" v-if="isImage(item)">
            <FontAwesomeIcon class="fa-fw" :icon="faFile" size="4x" v-else />
          </div>
          <span class="file-size">{{ Math.round(item.size / 1000) + 'KB' }}</span>
        </div>
      </template>
      <template v-else>
        <FontAwesomeIcon class="fa-fw" :icon="faImage" size="xl" />
        <span>
          {{ placeholder ? placeholder : $t('placeholder.uploadImage') }} <a href="#" @click.prevent="triggerFileInput">
            {{ $t('browse').toLowerCase() }}
          </a>
        </span>
        <input type="file" :name="name" ref="fileInputRef" class="hidden" :multiple="multiple" :accept="accept"
          @change="handleInputChange" @blur="handleBlur" :class="{ 'invalid': meta.touched && !meta.valid }">
      </template>
    </div>
    <span class="error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFile, faImage } from '@fortawesome/free-regular-svg-icons';
import { useField } from 'vee-validate';
import { ref, toRefs, watch, type Ref } from 'vue';

interface Props {
  name: string
  label: string
  modelValue: File[]
  placeholder?: string
  multiple?: boolean
  accept?: string
  rules?: string | Record<string, any>
  disabled?: boolean
  isSeparateRow?: boolean
  labelSpacing?: number
  fieldSize?: number
  bordered?: boolean
  semiboldLabel?: boolean
  grow?: boolean
  reset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  multiple: false,
  accept: 'image/*',
  disabled: false,
  isSeparateRow: false,
  labelSpacing: 4,
  fieldSize: 8,
  bordered: false,
  semiboldLabel: false,
  reset: false
})

const emits = defineEmits<{
  (event: 'update:modelValue', modelValue: File[]): void
}>()

const { handleBlur, value: files, errorMessage, meta, resetField } = useField<File[]>(() => props.name, props.rules)

const { reset } = toRefs(props)

watch(reset, (newValue) => {
  if (newValue) {
    resetField({ touched: false, errors: undefined })
  }
})

watch(files, (newValue) => {
  emits('update:modelValue', newValue)
})

const fileInputRef: Ref<HTMLInputElement | null> = ref(null)
const isDragging: Ref<boolean> = ref(false)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const dragOver = (e: DragEvent): void => {
  e.preventDefault()
  isDragging.value = true
}

const dragLeave = (e: DragEvent): void => {
  e.preventDefault()
  isDragging.value = false
}

const drop = (e: DragEvent): void => {
  e.preventDefault()
  if (e.dataTransfer) {
    const fileList: FileList = e.dataTransfer.files
    if (props.multiple) {
      for (let i = 0; i < fileList.length; i++) {
        let isExist = files.value.some(item => {
          return item.name === fileList.item(i)?.name && item.size === fileList.item(i)?.size
        })
        if (isExist) {
          console.log('file duplikat')
        } else {
          (files.value as File[]).push(fileList.item(i)!)
        }
      }
    } else {
      files.value = []
      files.value.push(fileList.item(0)!)
    }
  }
  isDragging.value = false
}

const handleInputChange = (e: Event): void => {
  const file = (e.target as HTMLInputElement).files
  if (file) {
    if (props.multiple) {
      for (let i = 0; i < file.length; i++) {
        let isExist = files.value.some(item => {
          return item.name === file.item(i)?.name && item.size === file.item(i)?.size
        })
        if (isExist) {
          console.log('file duplikat')
        } else {
          files.value.push(file.item(i)!)
        }
      }
    } else {
      files.value = []
      files.value.push(file.item(0)!)
    }
  }
}

const isImage = (file: File): boolean => {
  if (file.type && file.type.startsWith('image/')) {
    return true
  } else {
    return false
  }
}

const readImage = (file: File): string => {
  return URL.createObjectURL(file)
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
  @apply text-sm 2xl:text-base flex items-center
}

.input-container {
  /* Default State */
  @apply flex flex-col items-center justify-center rounded-lg bg-buttonGray p-4 space-y-2
  /* Focus State */
  focus-within:ring-2 focus-within:border-primarySkyBlue focus-within:ring-primarySkyBlue
  /* Error State */
  has-[.invalid]:border has-[.invalid]:border-accentRed has-[.invalid]:focus-within:ring-1 has-[.invalid]:focus-within:ring-accentRed
}

.input-container span {
  @apply text-xs text-center
}

.input-container span a {
  @apply text-accentPurple;
}

.preview-container {
  @apply p-1 flex flex-col items-center justify-center border border-accentOrangeGray border-opacity-50 w-1/4 relative
}

.input-preview {
  @apply w-full aspect-square flex items-center justify-center mb-1
}

.file-size {
  @apply text-xs absolute w-full bottom-0 text-center bg-accentOrangeGray bg-opacity-50
}

.error-message {
  @apply text-accentRed text-sm
}
</style>