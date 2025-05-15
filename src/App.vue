<template>
  <div id="app">
    <nav v-if="isLoggedIn">
      <router-link to="/">Home</router-link> |
      <router-link to="/tasks">Tasks</router-link> |
      <router-link to="/household">Household</router-link> |
      <router-link to="/profile">Profile</router-link> |
      <a href="#" @click.prevent="logout">Logout</a>
    </nav>
    <router-view/>
  </div>
</template>

<script>
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  setup() {
    const router = useRouter()
    const store = useStore()
    const isLoggedIn = ref(false)

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        isLoggedIn.value = !!user
        
        // Clear store data on logout
        if (!user) {
          store.commit('setUserProfile', null)
          store.commit('setHousehold', null)
          store.commit('setTasks', [])
          store.commit('setBadges', [])
        } else {
          // Fetch user profile when logged in
          store.dispatch('fetchUserProfile', user.uid)
        }
      })
    })

    const logout = async () => {
      // Clear store data before logging out
      store.commit('setUserProfile', null)
      store.commit('setHousehold', null)
      store.commit('setTasks', [])
      store.commit('setBadges', [])
      
      await signOut(auth)
      router.push('/login')
    }

    return {
      isLoggedIn,
      logout
    }
  }
}
</script>

<style>
/* Import Inter font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Typography */
  --font-family-headline: 'Inter', Helvetica, Arial, sans-serif;
  --font-family-body: 'Inter', Helvetica, Arial, sans-serif;
  --font-size-base: 16px;
  --font-size-small: 0.875rem;
  --font-size-large: 1.25rem;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Colors */
  --color-primary: #42b983;
  --color-primary-dark: #3aa876;
  --color-primary-light: #65c89e;
  --color-secondary: #2c3e50;
  --color-secondary-light: #4a6b8a;
  
  /* Neutral colors */
  --color-white: #f8f8f8;
  --color-gray-vlight: #f5f5f5;
  --color--gray-light: #e0e0e0;
  --color-gray-medium: #9e9e9e;
  --color-gray-dark: #616161;
  --color-gray-vdark: #212121;
  --color-black: #080808;
  
  /* UI colors */
  --color-success: var(--color-primary);
  --color-warning: #ff9800;
  --color-error: #f44336;
  --color-info: #2196f3;
  
  /* Spacing */
  --spacing-vsmall: 0.25rem;
  --spacing-small: 0.5rem;
  --spacing-medium: 1rem;
  --spacing-large: 1.5rem;
  --spacing-vlarge: 2rem;
  --spacing-vvlarge: 3rem;
  
  /* Border radius */
  --border-radius-small: 0.25rem;
  --border-radius-medium: 0.5rem;
  --border-radius-large: 1rem;
  --border-radius-full: 9999px;
  
  /* Box shadow */
  --shadow-small: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-large: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
  --transition-slow: 0.4s ease;
}

body {
  background-color: var(--color-white);
  margin: 0;
  padding: 0;
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--color-secondary);
}

#app {
  font-family: var(--font-family-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--color-secondary);
  background-color: var(--color-white);
}

nav {
  padding: var(--spacing-vlarge) var(--spacing-medium);
}

nav a {
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
  margin: 0 var(--spacing-small);
  text-decoration: none;
  transition: color var(--transition-fast);
}

nav a:hover {
  color: var(--color-primary);
}

nav a.router-link-exact-active {
  color: var(--color-primary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-headline);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-vlarge);
  margin-bottom: var(--spacing-medium);
}

h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.75rem;
}

h3 {
  font-size: 1.5rem;
}

h4 {
  font-size: 1.25rem;
}

button {
  font-family: var(--font-family-body);
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-small) var(--spacing-large);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

button:hover {
  background-color: var(--color-primary-dark);
}

button:disabled {
  background-color: var(--color-gray-medium);
  cursor: not-allowed;
}

input, select, textarea {
  font-family: var(--font-family-body);
  padding: var(--spacing-small);
  border: 1px solid var(--color--gray-light);
  border-radius: var(--border-radius-small);
  width: 100%;
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
