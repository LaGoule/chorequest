import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { initializeDefaultBadges } from './utils/dbStructure'

// Initialize default badges
initializeDefaultBadges()
  .catch(error => console.error('Error initializing badges:', error))

createApp(App).use(store).use(router).mount('#app')
