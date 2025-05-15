<template>
  <div class="profile">
    <h1>Your Profile</h1>
    
    <div class="profile-stats">
      <ProfileStat :value="userProfile?.points || 0" label="Total Points" />
      <ProfileStat :value="completedTasks.length" label="Tasks Completed" />
      <ProfileStat :value="userProfile?.badges?.length || 0" label="Badges Earned" />
    </div>
    
    <div class="badges-section">
      <SectionHeader title="Badges" icon="emoji_events" />
      
      <div v-if="!badges.length" class="no-badges">
        <EmptyState icon="military_tech">
          <p>You haven't earned any badges yet. Complete tasks to earn badges!</p>
        </EmptyState>
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
      <SectionHeader title="Tasks History" icon="history" />
      
      <div v-if="!completedTasks.length" class="no-tasks">
        <EmptyState icon="pending_actions">
          <p>You haven't completed any tasks yet.</p>
        </EmptyState>
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
      <SectionHeader title="Edit Profile" icon="edit" />
      
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="displayName">Display Name</label>
          <input type="text" id="displayName" v-model="displayName" />
        </div>
        
        <button type="submit" :disabled="updating">{{ updating ? 'Updating...' : 'Update Profile' }}</button>
      </form>
    </div>
    
    <!-- Reset points section at the bottom -->
    <div class="danger-zone">
      <SectionHeader title="Danger Zone" icon="warning" />
      <div class="danger-actions">
        <div class="danger-action">
          <div class="danger-description">
            <h3>Reset Points</h3>
            <p>This will reset your points to zero. This action cannot be undone.</p>
          </div>
          <button class="reset-points-button" @click="showResetConfirm = true">Reset Points</button>
        </div>
      </div>
    </div>
    
    <!-- Reset points confirmation modal using ConfirmModal component -->
    <ConfirmModal
      v-model="showResetConfirm"
      title="Reset Points"
      confirmText="Reset Points"
      :loading="resetting"
      loadingText="Resetting..."
      warning="This action cannot be undone."
      danger
      icon="warning"
      @confirm="resetPoints"
    >
      <p>Are you sure you want to reset your points to zero?</p>
    </ConfirmModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Importation des nouveaux composants
import ProfileStat from '../components/ProfileStat.vue';
import SectionHeader from '../components/SectionHeader.vue';
import EmptyState from '../components/EmptyState.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

export default {
  name: 'ProfileView',
  components: {
    ProfileStat,
    SectionHeader,
    EmptyState,
    ConfirmModal
  },
  setup() {
    const store = useStore();
    const displayName = ref('');
    const updating = ref(false);
    const showResetConfirm = ref(false);
    const resetting = ref(false);
    
    const userProfile = computed(() => store.getters.userProfile);
    const badges = computed(() => store.getters.badges);
    const completedTasks = computed(() => {
      const tasks = store.getters.tasks || [];
      return tasks.filter(task => task.completedBy === auth.currentUser.uid);
    });
    
    onMounted(() => {
      if (userProfile.value) {
        displayName.value = userProfile.value.name || '';
      }
      
      // Fetch badges if not already loaded
      if (!badges.value.length) {
        store.dispatch('fetchBadges');
      }
    });
    
    const updateProfile = async () => {
      if (displayName.value.trim() === '') return;
      
      updating.value = true;
      
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        await updateDoc(userRef, {
          name: displayName.value
        });
        
        // Update local state
        store.commit('setUserProfile', {
          ...userProfile.value,
          name: displayName.value
        });
        
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        updating.value = false;
      }
    };
    
    const resetPoints = async () => {
      resetting.value = true;
      
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        await updateDoc(userRef, {
          points: 0
        });
        
        // Update local state
        store.commit('setUserProfile', {
          ...userProfile.value,
          points: 0
        });
        
        showResetConfirm.value = false;
      } catch (error) {
        console.error('Error resetting points:', error);
      } finally {
        resetting.value = false;
      }
    };
    
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    return {
      userProfile,
      badges,
      completedTasks,
      displayName,
      updating,
      showResetConfirm,
      resetting,
      updateProfile,
      resetPoints,
      formatDate
    };
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-medium);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-medium);
  margin-bottom: var(--spacing-large);
}

.badges-section, .tasks-history, .edit-profile, .danger-zone {
  margin-top: var(--spacing-vvlarge);
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-medium);
}

.badge-card {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  box-shadow: var(--shadow-small);
  text-align: center;
}

.badge-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-small);
}

.badge-name {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-vsmall);
}

.badge-description {
  font-size: var(--font-size-small);
  color: var(--color-gray-dark);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  
  gap: var(--spacing-small);
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-medium);
  background-color: white;
  border-radius: var(--border-radius-medium);
  box-shadow: var(--shadow-small);
}

.task-info {
  flex: 1;
  text-align: left;
}

.task-name {
  font-weight: var(--font-weight-semibold);
}

.task-category {
  color: var(--color-gray-dark);
  font-size: var(--font-size-small);
  margin-top: var(--spacing-vsmall);
}

.task-points {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0 var(--spacing-medium);
}

.task-date {
  color: var(--color-gray-dark);
  font-size: var(--font-size-small);
}

.edit-profile form {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-large);
  box-shadow: var(--shadow-small);
}

.danger-zone {
  margin-top: var(--spacing-vvlarge);
  padding-top: var(--spacing-large);
  border-top: 1px solid var(--color--gray-light);
}

.danger-actions {
  background-color: var(--color-gray-vlight);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
}

.danger-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.danger-description {
  text-align: left;
}

.danger-description h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-vsmall);
  color: var(--color-gray-vdark);
}

.danger-description p {
  margin-bottom: 0;
  color: var(--color-gray-dark);
}

.reset-points-button {
  background-color: var(--color-error);
  white-space: nowrap;
  padding: var(--spacing-small) var(--spacing-large);
}

.reset-points-button:hover {
  background-color: #d32f2f; /* Darker red */
}

.form-group {
  margin-bottom: var(--spacing-medium);
}
</style>
