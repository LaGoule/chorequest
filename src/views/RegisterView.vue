<template>
  <div class="register">
    <h1>Register for ChoreQuest</h1>
    
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="loading">{{ loading ? 'Registering...' : 'Register' }}</button>
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
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
import { auth } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { createUser } from '../utils/dbStructure'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const error = ref(null)
    const loading = ref(false)
    
    const register = async () => {
      loading.value = true
      error.value = null
      
      try {
        console.log("Registering user:", email.value);
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          email.value, 
          password.value
        );
        
        console.log("User created:", userCredential.user.uid);
        
        // Create user profile using our dbStructure utility
        // Make sure NOT to include any householdId for new users
        await createUser(userCredential.user.uid, {
          name: name.value,
          email: email.value,
          // Explicitly set householdId to null to ensure no accidental inheritance
          householdId: null
        });
        
        console.log("User profile created in Firestore");
        
        // Directly navigate to home page since the user is now authenticated
        router.push('/')
      } catch (err) {
        console.error("Registration error:", err);
        error.value = err.message
      } finally {
        loading.value = false
      }
    }
    
    return {
      name,
      email,
      password,
      error,
      loading,
      register
    }
  }
}
</script>

<style scoped>
.register {
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
