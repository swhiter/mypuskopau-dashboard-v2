<template>
  <PageInnerCard :title="isDriver ? $t('title.driverInformation') : $t('title.staffInformation')">
    <div class="flex space-x-4">
      <div class="flex flex-col w-2/3 space-y-2">
        <InputForm name="fullname" :label="$t('names.fullname')" v-model="form.name" is-separate-row bordered
          :rules="{ required: true }" :placeholder="$t('placeholder.inputFullname')" :reset="reset" />

        <InputForm name="idCardNumber" :label="$t('names.idCardNumber')" v-model="form.nik" is-separate-row bordered
          :rules="{ required: true, numeric: true, length: 16 }" :placeholder="$t('placeholder.inputIdCardNumber')"
          :reset="reset" />

        <InputForm v-if="isDriver" name="phoneNumber" :label="$t('names.phoneNumber')" v-model="form.no_hp"
          is-separate-row bordered :placeholder="$t('placeholder.inputPhoneNumber')" :reset="reset" />

        <div v-if="isDriver" class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <!-- Status Lokasi -->
          <div class="flex flex-col text-xs">
            <span class="mb-1 font-semibold">Status Lokasi</span>
            <select v-model="form.statusLocation" class="border rounded px-2 py-1">
              <option :value="1">Dalam Bandara</option>
              <option :value="0">Luar Bandara</option>
            </select>
          </div>

          <!-- Suspend -->
          <div class="flex flex-col text-xs">
            <span class="mb-1 font-semibold">Status Suspend</span>
            <select v-model="form.isSuspend" class="border rounded px-2 py-1">
              <option :value="0">Tidak Suspend</option>
              <option :value="1">Suspend</option>
            </select>
          </div>

          <!-- Langganan -->
          <div class="flex flex-col text-xs">
            <span class="mb-1 font-semibold">Jenis Driver</span>
            <select v-model="form.isLangganan" class="border rounded px-2 py-1">
              <option :value="0">Driver Normal</option>
              <option :value="1">Driver Langganan</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex w-1/3">
        <UploadFileForm name="photo" :label="$t('names.photo')" v-model="imageFile" @update="imageFile = $event"
          is-separate-row bordered grow :reset="reset" />
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
  reset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDriver: false,
  reset: false
})

const emits = defineEmits<{
  update: [form: UserInfo]
}>()

const { form } = toRefs(props)
const isDriver = toRefs(props).isDriver
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