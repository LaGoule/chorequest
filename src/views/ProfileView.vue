<template>
  <div class="profile">
    <h1>Your Profile</h1>
    
    <div class="profile-stats">
      <div class="stat-card">
        <div class="stat-value">{{ userProfile?.points || 0 }}</div>
        <div class="stat-label">Total Points</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ completedTasks.length }}</div>
        <div class="stat-label">Tasks Completed</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ userProfile?.badges?.length || 0 }}</div>
        <div class="stat-label">Badges Earned</div>
      </div>
    </div>
    
    <div class="badges-section">
      <h2>Badges</h2>
      
      <div v-if="!badges.length" class="no-badges">
        <p>You haven't earned any badges yet. Complete tasks to earn badges!</p>
      </div>
      
      <div v-else class="badges-grid">
        <div v-for="badge in badges" :key="badge.id" class="badge-card">
          <div class="badge-icon">🏆</div>
          <div class="badge-name">{{ badge.name }}</div>
          <div class="badge-description">{{ badge.description }}</div>
        </div>
      </div>
    </div>
    
    <div class="tasks-history">
      <h2>Tasks History</h2>
      
      <div v-if="!completedTasks.length" class="no-tasks">
        <p>You haven't completed any tasks yet.</p>
      </div>
      
      <div v-else class="tasks-list">
        <div v-for="task in completedTasks" :key="task.id" class="task-item">
          <div class="task-info">
            <div class="task-name">{{ task.name }}</div>
            <div class="task-category">{{ task.category }}</div>
          </div>
          <div class="task-points">+{{ task.pointsValue }}</div>
          <div class="task-date">{{ formatDate(task.completedAt) }}</div>
        </div>
      </div>
    </div>
    
    <div class="edit-profile">
      <h2>Edit Profile</h2>
      
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="displayName">Display Name</label>
          <input type="text" id="displayName" v-model="displayName" />
        </div>
        
        <button type="submit" :disabled="updating">{{ updating ? 'Updating...' : 'Update Profile' }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { auth, db } from '../firebase'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'

export default {
  name: 'ProfileView',
  setup() {
    const store = useStore()
    const displayName = ref('')
    const updating = ref(false)
    const completedTasks = ref([])
    const badges = ref([])
    
    const userProfile = computed(() => store.getters.userProfile)
    
    onMounted(async () => {
      if (userProfile.value) {
        displayName.value = userProfile.value.name
        await fetchCompletedTasks()
        await fetchBadges()
      }
    })
    
    const fetchCompletedTasks = async () => {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('completedBy', '==', auth.currentUser.uid)
      )
      
      const taskSnap = await getDocs(tasksQuery)
      const tasks = []
      
      taskSnap.forEach(doc => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      completedTasks.value = tasks
    }
    
    const fetchBadges = async () => {
      if (!userProfile.value?.badges || userProfile.value.badges.length === 0) {
        badges.value = []
        return
      }
      
      const fetchedBadges = []
      
      for (const badgeId of userProfile.value.badges) {
        const badgeSnap = await getDocs(
          query(collection(db, 'badges'), where('id', '==', badgeId))
        )
        
        if (!badgeSnap.empty) {
          badgeSnap.forEach(doc => {
            fetchedBadges.push({
              id: doc.id,
              ...doc.data()
            })
          })
        }
      }
      
      badges.value = fetchedBadges
    }
    
    const updateProfile = async () => {
      updating.value = true
      
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        
        await updateDoc(userRef, {
          name: displayName.value
        })
        
        // Update local state
        store.commit('setUserProfile', {
          ...userProfile.value,
          name: displayName.value
        })
      } catch (error) {
        console.error('Error updating profile:', error)
      } finally {
        updating.value = false
      }
    }
    
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    }
    
    return {
      userProfile,
      displayName,
      updating,
      completedTasks,
      badges,
      updateProfile,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #42b983;
}

.stat-label {
  margin-top: 5px;
  color: #666;
}

.badges-section, .tasks-history, .edit-profile {
  margin-top: 30px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.badge-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.badge-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.badge-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.badge-description {
  font-size: 14px;
  color: #666;
}

.tasks-list {
  margin-top: 15px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.task-name {
  font-weight: bold;
}

.task-category {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.task-points {
  font-weight: bold;
  color: #42b983;
}

.edit-profile {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
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
</style>
