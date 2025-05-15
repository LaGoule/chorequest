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
body {
  background-color: #F8F8F8;
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #F8F8F8;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
