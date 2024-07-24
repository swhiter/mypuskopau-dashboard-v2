<template>
  <PageInnerCard :title="isDriver ? $t('title.driverInformation') : $t('title.staffInformation')">
    <div class="flex space-x-4">
      <div class="flex flex-col w-2/3">
        <InputForm name="fullname" :label="$t('names.fullname')" v-model="form.name" is-separate-row bordered
          :rules="{ required: true }" :placeholder="$t('placeholder.inputFullname')" />
        <InputForm name="idCardNumber" :label="$t('names.idCardNumber')" v-model="form.nik" is-separate-row bordered
          :rules="{ required: true }" :placeholder="$t('placeholder.inputIdCardNumber')" />
      </div>
      <div class="flex w-1/3">
        <UploadFileForm name="photo" :label="$t('names.photo')" v-model="imageFile" @update="imageFile = $event"
          is-separate-row bordered grow />
      </div>
    </div>
  </PageInnerCard>
</template>

<script setup lang="ts">
import InputForm from '@/components/atoms/InputForm.vue';
import PageInnerCard from '@/components/atoms/PageInnerCard.vue';
import UploadFileForm from '@/components/atoms/UploadFileForm.vue';
import type { UserInfo } from '@/types/Forms';
import { urlToFile } from '@/utils/common';
import { onMounted, ref, toRefs, watch, type Ref } from 'vue';

interface Props {
  form: UserInfo
  isDriver?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDriver: false
})

const emits = defineEmits<{
  update: [form: UserInfo]
}>()

const { form } = toRefs(props)
const imageFile: Ref<File[]> = ref([])

watch(form, (newValue) => {
  console.log(newValue)
  emits('update', newValue)
})
watch(imageFile, (newValue) => {
  form.value.photo = newValue[0]
})

const fetchResponseImage = async () => {
  if (form.value.photo) {
    console.log('masuk sini')
    const image: File = await urlToFile(form.value.photo as string, 'profile-image.png')
    imageFile.value.push(image)
  }
}

onMounted(() => {
  fetchResponseImage()
})
</script>