<template>
  <div class="login">
    <h1>Login to ChoreQuest</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      
      <div v-if="isSignUp" class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="loading">{{ loading ? 'Logging in...' : (isSignUp ? 'Sign Up' : 'Login') }}</button>
        <p v-if="!isSignUp">Don't have an account? <a href="#" @click.prevent="toggleMode">Register</a></p>
        <p v-else>Already have an account? <a href="#" @click.prevent="toggleMode">Login</a></p>
      </div>
      
      <div v-if="error" class="error">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'LoginView',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Form state
    const email = ref('');
    const password = ref('');
    const name = ref('');  // Pour l'inscription
    const isSignUp = ref(false);
    const loading = ref(false);
    const error = ref('');
    
    const toggleMode = () => {
      isSignUp.value = !isSignUp.value;
      error.value = '';
    };
    
    const handleSubmit = async () => {
      if (!email.value || !password.value || (isSignUp.value && !name.value)) {
        error.value = 'Please fill in all fields';
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      try {
        if (isSignUp.value) {
          // Signup logic
          await store.dispatch('signup', {
            email: email.value,
            password: password.value,
            name: name.value
          });
        } else {
          // Login logic
          await store.dispatch('login', {
            email: email.value,
            password: password.value
          });
        }
        
        // Rediriger vers la page d'accueil après authentification
        router.push('/');
      } catch (err) {
        console.error('Authentication error:', err);
        error.value = err.message || 'An error occurred during authentication';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      email,
      password,
      name,
      isSignUp,
      loading,
      error,
      toggleMode,
      handleSubmit
    };
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
