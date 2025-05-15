<template>
  <div class="household">
    <h1>Household Management</h1>
    
    <div v-if="household" class="household-details">
      <AppCard title="Your Household">
        <div class="household-info">
          <h2>{{ household.name }}</h2>
          <p>
            <strong>Members:</strong> {{ householdMembersCount }}
          </p>
        </div>
        
        <div class="household-members">
          <h3>Members</h3>
          <div v-if="isLoadingMembers" class="loading-indicator">Loading members...</div>
          <ul v-else-if="members.length > 0" class="members-list">
            <li v-for="member in members" :key="member.id" class="member-item">
              <span class="member-name">{{ member.name }}</span>
              <span class="member-points">{{ member.points }} pts</span>
              <span v-if="member.id === household.adminId" class="admin-badge">Admin</span>
            </li>
          </ul>
          <p v-else>No members found</p>
        </div>
        
        <div class="invite-section">
          <h3>Invite Others</h3>
          <p>Share this code to invite others to join your household:</p>
          <div class="invite-code">
            <span class="code">{{ getInviteCode() }}</span>
            <button class="copy-button" @click="copyInviteCode">
              <i class="material-icons">content_copy</i>
            </button>
          </div>
        </div>
      </AppCard>
    </div>
    
    <div v-else class="no-household">
      <h2>You are not part of a household yet</h2>
      
      <div class="action-cards">
        <AppCard title="Create a Household" class="action-card">
          <p>Start a new household and invite others to join.</p>
          <button v-if="!isShowingCreateForm" class="action-button" @click="isShowingCreateForm = true">
            Create Household
          </button>
          
          <form v-else @submit.prevent="handleCreateHousehold" class="household-form">
            <AppInput
              v-model="newHouseholdName"
              label="Household Name"
              required
              :error-message="errorMessage"
            />
            
            <div class="form-actions">
              <AppButton
                variant="outline"
                label="Cancel"
                @click="isShowingCreateForm = false"
              />
              
              <AppButton
                type="submit"
                label="Create"
                :loading="isLoading"
              />
            </div>
          </form>
        </AppCard>
        
        <AppCard title="Join a Household" class="action-card">
          <p>Join an existing household using an invite code.</p>
          <button v-if="!isShowingJoinForm" class="action-button" @click="isShowingJoinForm = true">
            Join Household
          </button>
          
          <form v-else @submit.prevent="handleJoinHousehold" class="household-form">
            <AppInput
              v-model="householdCode"
              label="Household Code"
              required
              :error-message="errorMessage"
            />
            
            <div class="form-actions">
              <AppButton
                variant="outline"
                label="Cancel"
                @click="isShowingJoinForm = false"
              />
              
              <AppButton
                type="submit"
                label="Join"
                :loading="isLoading"
              />
            </div>
          </form>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { auth } from '../firebase'; // Ajout de l'import manquant
import { householdService } from '../services/householdService';
import { notificationService } from '../services/notificationService';
import AppCard from '../components/ui/AppCard.vue';
import AppInput from '../components/ui/AppInput.vue';
import AppButton from '../components/ui/AppButton.vue';

export default {
  name: 'HouseholdView',
  components: {
    AppCard,
    AppInput,
    AppButton
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // State
    const newHouseholdName = ref('');
    const householdCode = ref('');
    const isLoading = ref(false);
    const errorMessage = ref('');
    const isShowingCreateForm = ref(false);
    const isShowingJoinForm = ref(false);
    // Initialiser members comme un tableau vide pour éviter undefined
    const members = ref([]);
    const isLoadingMembers = ref(false);
    
    // Computed
    const household = computed(() => store.getters.household);
    // Ajouter une protection contre undefined
    const householdMembersCount = computed(() => members.value ? members.value.length : 0);
    
    // Fetch household members when a household is available
    onMounted(() => {
      if (household.value?.id) {
        fetchHouseholdMembers();
      }
    });
    
    // Watch for household changes to fetch members when the household ID changes
    watch(() => household.value?.id, (newHouseholdId) => {
      if (newHouseholdId) {
        fetchHouseholdMembers();
      } else {
        members.value = [];
      }
    });
    
    // Methods
    const handleCreateHousehold = async () => {
      if (!newHouseholdName.value.trim()) {
        errorMessage.value = 'Please enter a household name';
        return;
      }
      
      isLoading.value = true;
      errorMessage.value = '';
      
      try {
        await store.dispatch('createHousehold', newHouseholdName.value.trim());
        router.push('/'); // Rediriger vers la page d'accueil après création
        notificationService.success('Household created successfully!');
      } catch (err) {
        console.error('Error creating household:', err);
        errorMessage.value = err.message || 'Failed to create household';
        notificationService.error('Failed to create household: ' + (err.message || 'Unknown error'));
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleJoinHousehold = async () => {
      if (!householdCode.value.trim()) {
        errorMessage.value = 'Please enter a household code';
        return;
      }
      
      isLoading.value = true;
      errorMessage.value = '';
      
      try {
        await householdService.joinHousehold(householdCode.value.trim());
        notificationService.success('Successfully joined household!');
        
        // Force reload household data to ensure we have the latest
        if (auth.currentUser) {
          await store.dispatch('fetchUserProfile', auth.currentUser);
        }
        
        // Redirection à la page d'accueil
        router.push('/');
      } catch (err) {
        console.error('Error joining household:', err);
        errorMessage.value = err.message || 'Failed to join household';
        notificationService.error('Failed to join household: ' + (err.message || 'Unknown error'));
      } finally {
        isLoading.value = false;
      }
    };
    
    const fetchHouseholdMembers = async () => {
      if (!household.value?.id) {
        members.value = [];
        return;
      }
      
      isLoadingMembers.value = true;
      
      try {
        const householdMembers = await store.dispatch('fetchHouseholdMembers');
        members.value = householdMembers || [];
      } catch (err) {
        console.error('Error fetching household members:', err);
        notificationService.error('Failed to load household members');
        members.value = [];
      } finally {
        isLoadingMembers.value = false;
      }
    };
    
    const getInviteCode = () => {
      return household.value?.id || 'Loading...';
    };
    
    const copyInviteCode = () => {
      navigator.clipboard.writeText(getInviteCode())
        .then(() => {
          notificationService.success('Invite code copied to clipboard!');
        })
        .catch(() => {
          notificationService.error('Failed to copy code');
        });
    };
    
    return {
      household,
      newHouseholdName,
      householdCode,
      isLoading,
      errorMessage,
      isShowingCreateForm,
      isShowingJoinForm,
      members,
      isLoadingMembers,
      householdMembersCount,
      handleCreateHousehold,
      handleJoinHousehold,
      getInviteCode,
      copyInviteCode,
      fetchHouseholdMembers  // Exporter la fonction pour pouvoir l'appeler si nécessaire
    };
  }
}
</script>

<style scoped>
.household {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-medium);
}

.household-options, .household-details {
  margin-top: var(--spacing-vlarge);
}

.action-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-large);
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
  border-bottom: 1px solid var(--color-gray-light);
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
