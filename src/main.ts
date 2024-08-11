import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18nSetup from './locales/i18n'

const app = createApp(App)

const pinia = createPinia()
pinia.use((context) => {
  const storeId = context.store.$id

  const serializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  }

  // Sync data store dengan local storage
  const fromStorage = localStorage.getItem(storeId)
  if (fromStorage) {
    const decoded = serializer.deserialize(fromStorage)
    context.store.$patch(decoded)
  }

  // Subscribe untuk memantau perubahan
  context.store.$subscribe((mutation, state) => {
    const encoded = serializer.serialize(state)
    if (storeId != 'modal') {
      localStorage.setItem(storeId, encoded)
    }
  })
})

app.use(pinia)
app.use(router)
app.use(i18nSetup)

app.mount('#app')
