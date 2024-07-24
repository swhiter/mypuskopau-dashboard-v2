<template>
  <div id="gallery">
    <a :href="image" :data-pswp-width="images?.naturalWidth" :data-pswp-height="images?.naturalHeight" target="_blank"
      rel="noreferrer">
      Lihat Foto
    </a>
  </div>
</template>

<script setup lang="ts">
import PhotoSwipeLightBox from 'photoswipe/lightbox';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

interface Props {
  image: string
}

const props = defineProps<Props>()

const lightbox: Ref<PhotoSwipeLightBox | null> = ref(null)
const images: Ref<HTMLImageElement | null> = ref(null)

const decodeImage = async () => {
  const img = new Image()
  img.src = props.image
  await img.decode()
  images.value = img
}

onMounted(() => {
  if (!lightbox.value) {
    lightbox.value = new PhotoSwipeLightBox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: () => import('photoswipe')
    })
    lightbox.value.init()
    decodeImage()
  }
})

onUnmounted(() => {
  if (lightbox.value) {
    lightbox.value.destroy()
    lightbox.value = null
  }
})
</script>

<style scoped>
a {
  @apply text-accentPurple underline
}
</style>