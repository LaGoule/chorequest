<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/tasks">Tasks</router-link>
        <router-link to="/household">Household</router-link>
        <router-link to="/profile">Profile</router-link>
      </div>
      <div class="nav-actions">
        <button @click="logout" class="logout-button">
          <i class="material-icons">logout</i>
          Logout
        </button>
      </div>
    </nav>
    <router-view/>
    <AppNotifications />
  </div>
</template>

<script>
import AppNotifications from './components/ui/AppNotifications.vue';
import { authService } from './services/authService';

export default {
  name: 'App',
  components: {
    AppNotifications
  },
  setup() {
    const logout = async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };
    
    return {
      logout
    };
  }
}
</script>

<style>
/* Import variables CSS */
@import './assets/css/variables.css';

/* Import Inter font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  background-color: var(--color-white);
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-gray-vdark);
  background-color: #f9f9f9;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-headline);
  color: var(--color-gray-vdark);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-dark);
}

button {
  cursor: pointer;
  font-family: var(--font-family-body);
}

input, select, textarea {
  font-family: var(--font-family-body);
}

/* Navigation styles */
.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-medium);
  background-color: white;
  box-shadow: var(--shadow-small);
}

.nav-links {
  display: flex;
}

.nav-links a {
  margin: 0 var(--spacing-medium);
  color: var(--color-secondary);
  font-weight: var(--font-weight-semibold);
}

.nav-links a.router-link-active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
  background: none;
  border: none;
  color: var(--color-secondary);
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-fast);
}

.logout-button:hover {
  color: var(--color-error);
}

/* Utility classes */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.mt-1 {
  margin-top: var(--spacing-small);
}

.mt-2 {
  margin-top: var(--spacing-medium);
}

.mb-1 {
  margin-bottom: var(--spacing-small);
}

.mb-2 {
  margin-bottom: var(--spacing-medium);
}

.material-icons {
  font-size: 1.25rem;
  vertical-align: middle;
}
</style>
