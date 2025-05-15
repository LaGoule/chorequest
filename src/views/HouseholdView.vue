<template>
  <div class="household">
    <h1>Manage Household</h1>
    
    <div v-if="household" class="household-details">
      <h2>{{ household.name }}</h2>
      
      <div class="members">
        <h3>Household Members</h3>
        <ul class="members-list">
          <li v-for="member in householdMembers" :key="member.id" class="member-row">
            <div class="member-name">
              {{ member.name }}
              <span v-if="member.id === household.adminId" class="admin-badge">
                <span class="shield-icon">🛡️</span>
              </span>
            </div>
            <div class="member-points">
              <div class="points-container">
                <span class="points-value">{{ member.points || 0 }}</span>
                <span class="points-label">&nbsp;points</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <div class="leaderboard">
        <h3>Leaderboard</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(member, index) in sortedMembers" :key="member.id">
              <td>{{ index + 1 }}</td>
              <td>{{ member.name }}</td>
              <td>{{ member.points || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="isAdmin" class="admin-controls">
        <h3>Admin Controls</h3>
        
        <div class="invite-member">
          <h4>Invite New Member</h4>
          <form @submit.prevent="generateInviteCode">
            <button type="submit">Generate Invite Code</button>
          </form>
          
          <div v-if="inviteCode" class="invite-code">
            <p>Share this code with others to join your household:</p>
            <div class="code">{{ inviteCode }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="household-options">
      <h2>You're not part of a household yet</h2>
      
      <div class="option-buttons">
        <button @click="showCreateForm = !showCreateForm">Create a New Household</button>
        <button @click="showJoinForm = !showJoinForm">Join an Existing Household</button>
      </div>
      
      <div v-if="showCreateForm" class="create-form">
        <h3>Create a New Household</h3>
        <form @submit.prevent="createHousehold">
          <div class="form-group">
            <label for="householdName">Household Name</label>
            <input type="text" id="householdName" v-model="newHouseholdName" required />
          </div>
          
          <button type="submit" :disabled="loading">{{ loading ? 'Creating...' : 'Create Household' }}</button>
        </form>
      </div>
      
      <div v-if="showJoinForm" class="join-form">
        <h3>Join a Household</h3>
        <form @submit.prevent="joinHousehold">
          <div class="form-group">
            <label for="inviteCode">Invite Code</label>
            <input type="text" id="inviteCode" v-model="joinCode" required />
          </div>
          
          <button type="submit" :disabled="loading">{{ loading ? 'Joining...' : 'Join Household' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { auth } from '../firebase'
import { 
  createHousehold, 
  getHouseholdMembers, 
  createHouseholdInvite, 
  joinHouseholdWithInvite 
} from '../utils/dbStructure'

export default {
  name: 'HouseholdView',
  setup() {
    const store = useStore()
    const showCreateForm = ref(false)
    const showJoinForm = ref(false)
    const newHouseholdName = ref('')
    const joinCode = ref('')
    const loading = ref(false)
    const householdMembers = ref([])
    const inviteCode = ref('')
    
    const household = computed(() => store.getters.household)
    
    const isAdmin = computed(() => {
      if (!household.value) return false
      return household.value.adminId === auth.currentUser.uid
    })
    
    const sortedMembers = computed(() => {
      return [...householdMembers.value].sort((a, b) => {
        return (b.points || 0) - (a.points || 0)
      })
    })
    
    onMounted(async () => {
      if (household.value) {
        await fetchHouseholdMembers()
      }
    })
    
    const fetchHouseholdMembers = async () => {
      if (!household.value) return
      
      const members = await getHouseholdMembers(household.value.id)
      householdMembers.value = members
    }
    
    const createHouseholdHandler = async () => {
      loading.value = true;
      
      try {
        console.log("Creating household:", newHouseholdName.value);
        const newHousehold = await createHousehold(
          newHouseholdName.value, 
          auth.currentUser.uid
        );
        
        console.log("Household created:", newHousehold);
        
        // Update store with the new household
        store.commit('setHousehold', newHousehold);
        
        // Refresh user profile to ensure it has the household ID
        await store.dispatch('fetchUserProfile', auth.currentUser.uid);
        
        showCreateForm.value = false;
        
        // Immediately fetch members after creation
        await fetchHouseholdMembers();
      } catch (error) {
        console.error('Error creating household:', error);
        alert(`Failed to create household: ${error.message}`);
      } finally {
        loading.value = false;
      }
    }
    
    const joinHouseholdHandler = async () => {
      loading.value = true
      
      try {
        const joinedHousehold = await joinHouseholdWithInvite(
          joinCode.value,
          auth.currentUser.uid
        )
        
        // Update store
        store.commit('setHousehold', joinedHousehold)
        
        showJoinForm.value = false
        
        // Fetch household members
        await fetchHouseholdMembers()
      } catch (error) {
        console.error('Error joining household:', error)
      } finally {
        loading.value = false
      }
    }
    
    const generateInviteCode = async () => {
      try {
        const code = await createHouseholdInvite(
          household.value.id,
          auth.currentUser.uid
        )
        
        inviteCode.value = code
      } catch (error) {
        console.error('Error generating invite code:', error)
      }
    }
    
    return {
      household,
      showCreateForm,
      showJoinForm,
      newHouseholdName,
      joinCode,
      loading,
      householdMembers,
      sortedMembers,
      isAdmin,
      inviteCode,
      createHousehold: createHouseholdHandler,
      joinHousehold: joinHouseholdHandler,
      generateInviteCode
    }
  }
}
</script>

<style scoped>
.household {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-vlarge);
}

.household-options, .household-details {
  margin-top: var(--spacing-vlarge);
}

.option-buttons {
  display: flex;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-vlarge);
}

.create-form, .join-form {
  background-color: var(--color-gray-vlight);
  padding: var(--spacing-vlarge);
  border-radius: var(--border-radius-medium);
  margin-top: var(--spacing-vlarge);
}

.members {
  margin-top: var(--spacing-vlarge);
}

.members-list {
  list-style-type: none;
  padding: 0;
}

.member-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-medium);
  border-bottom: 1px solid var(--color--gray-light);
  transition: background-color var(--transition-fast);
}

.member-row:hover {
  background-color: var(--color-gray-vlight);
}

.member-name {
  flex: 1;
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-semibold);
}

.member-points {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.points-container {
  background-color: var(--color-primary);
  color: #ffffff; /* Pure white for better contrast */
  border-radius: var(--border-radius-full);
  padding: var(--spacing-vsmall) var(--spacing-large);
  display: inline-flex;
  align-items: center;
  box-shadow: var(--shadow-small);
}

.points-value {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-large);
  margin-right: var(--spacing-vsmall);
}

.points-label {
  font-size: var(--font-size-small);
  opacity: 0.9;
}

.admin-badge {
  color: var(--color-primary);
  margin-right: var(--spacing-small);
}

.shield-icon {
  font-size: 1.2em;
}

.leaderboard {
  margin-top: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.admin-controls {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.invite-code {
  margin-top: 15px;
}

.code {
  font-size: 24px;
  font-weight: bold;
  background-color: #42b983;
  color: white;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  text-align: center;
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
