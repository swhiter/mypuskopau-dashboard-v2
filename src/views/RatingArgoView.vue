<template>
  <div class="page">
    <div class="card">
      <img src="@/assets/images/logo.png" alt="Puskopau" class="logo" />

      <template v-if="loading">
        <p class="muted text-center">Memuat informasi perjalanan...</p>
      </template>

      <template v-else-if="loadError">
        <span class="material-symbols-outlined icon-error">error</span>
        <h2 class="title">Tautan Tidak Valid</h2>
        <p class="muted text-center">{{ loadError }}</p>
      </template>

      <template v-else-if="submitted || tripInfo?.alreadyRated">
        <span class="material-symbols-outlined icon-success">check_circle</span>
        <h2 class="title">Terima Kasih!</h2>
        <p class="muted text-center">Ulasan Anda untuk perjalanan ini sudah kami terima.</p>
      </template>

      <template v-else-if="tripInfo">
        <div class="driver-info">
          <img :src="tripInfo.photo || avatarPlaceholder" alt="Foto driver" class="driver-photo" />
          <div class="flex flex-col">
            <span class="driver-name">{{ tripInfo.driverName }}</span>
            <span class="driver-meta">{{ tripInfo.vehicleCode }} &middot; {{ tripInfo.licensePlate }}</span>
          </div>
        </div>

        <p class="muted text-center prompt">
          Bagaimana pengalaman perjalanan Anda bersama driver ini?
        </p>

        <div class="stars">
          <button v-for="star in 5" :key="star" type="button" class="star-button"
            @click="rating = star">
            <span class="material-symbols-outlined star-icon" :class="{ 'star-filled': star <= rating }">
              star
            </span>
          </button>
        </div>

        <textarea v-model="review" class="review-input" rows="4"
          placeholder="Ceritakan pengalaman Anda (opsional)"></textarea>

        <p v-if="submitError" class="error-text">{{ submitError }}</p>

        <MainButton type="button" label="Kirim Ulasan" wide :disabled="rating === 0 || submitting"
          :loading="submitting" @click="onSubmit" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import MainButton from '@/components/atoms/MainButton.vue';
import argoRatingService from '@/services/argo-rating/argo-rating.api';
import type { TripRatingInfo } from '@/types/Data';
import avatarPlaceholder from '@/assets/images/user.png';

const route = useRoute()
const transactionNumber = String(route.params.transactionNumber || '')

const loading: Ref<boolean> = ref(true)
const loadError: Ref<string> = ref('')
const tripInfo: Ref<TripRatingInfo | null> = ref(null)

const rating: Ref<number> = ref(0)
const review: Ref<string> = ref('')
const submitting: Ref<boolean> = ref(false)
const submitError: Ref<string> = ref('')
const submitted: Ref<boolean> = ref(false)

const loadTripInfo = async (): Promise<void> => {
  if (!transactionNumber) {
    loadError.value = 'Nomor transaksi tidak ditemukan pada tautan ini.'
    loading.value = false
    return
  }
  try {
    const response = await argoRatingService.getTripInfo(transactionNumber)
    tripInfo.value = response.data
  } catch (error: any) {
    loadError.value = error?.message || 'Perjalanan tidak ditemukan. Pastikan kode QR masih berlaku.'
  } finally {
    loading.value = false
  }
}

const onSubmit = async (): Promise<void> => {
  if (rating.value === 0) return
  submitting.value = true
  submitError.value = ''
  try {
    await argoRatingService.submitRating({
      transactionNumber,
      rating: rating.value,
      review: review.value || undefined
    })
    submitted.value = true
  } catch (error: any) {
    submitError.value = error?.message || 'Gagal mengirim ulasan. Silakan coba lagi.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadTripInfo()
})
</script>

<style scoped>
.page {
  @apply min-h-dvh w-dvw flex items-center justify-center bg-gray-100 px-4 py-8
}

.card {
  @apply w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center space-y-4
}

.logo {
  @apply h-12 object-contain
}

.title {
  @apply text-lg font-semibold text-gray-800
}

.muted {
  @apply text-sm text-gray-500
}

.text-center {
  @apply text-center
}

.icon-error {
  @apply text-5xl text-red-500
}

.icon-success {
  @apply text-5xl text-green-600
}

.driver-info {
  @apply w-full flex items-center space-x-3 bg-gray-50 rounded-xl p-3
}

.driver-photo {
  @apply w-14 h-14 rounded-full object-cover bg-gray-200
}

.driver-name {
  @apply font-semibold text-gray-800
}

.driver-meta {
  @apply text-xs text-gray-500
}

.prompt {
  @apply pt-1
}

.stars {
  @apply flex space-x-1
}

.star-button {
  @apply p-1
}

.star-icon {
  @apply text-4xl text-gray-300
}

.star-filled {
  @apply text-amber-400
}

.review-input {
  @apply w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primaryDarkBlue
}

.error-text {
  @apply text-sm text-red-500 text-center
}
</style>
