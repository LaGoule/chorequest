import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { authService } from './services/authService';

// Import UI components that should be globally available
import AppNotifications from './components/ui/AppNotifications.vue';

const app = createApp(App);

// Register global components
app.component('AppNotifications', AppNotifications);

// Initialiser le service d'authentification
authService.initAuthListener();

// Mount the app
app.use(store)
   .use(router)
   .mount('#app');
