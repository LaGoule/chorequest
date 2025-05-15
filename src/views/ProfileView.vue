<template>
  <div class="profile">
    <h1>Your Profile</h1>
    
    <div class="profile-stats">
      <ProfileStat :value="userProfile?.points || 0" label="Total Points" />
      <ProfileStat :value="completedTasks.length" label="Tasks Completed" />
      <ProfileStat :value="userProfile?.badges?.length || 0" label="Badges Earned" />
    </div>
    
    <AppCard title="Badges" icon="emoji_events" class="section-card">
      <div v-if="!badges.length" class="empty-section">
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
    </AppCard>
    
    <AppCard title="Tasks History" icon="history" class="section-card">
      <div v-if="!completedTasks.length" class="empty-section">
        <EmptyState icon="pending_actions">
          <p>You haven't completed any tasks yet.</p>
        </EmptyState>
      </div>
      
      <div v-else class="tasks-list">
        <div v-for="task in completedTasks" :key="task.id" class="task-item">
          <div class="task-info">
            <div class="task-name">{{ task.name }}</div>
            <TagBadge 
              :category="task.category" 
              :text="formatCategory(task.category)" 
              size="small"
            />
          </div>
          <PointsBadge :value="task.pointsValue" show-plus />
          <div class="task-date">{{ formatDate(task.completedAt) }}</div>
        </div>
      </div>
    </AppCard>
    
    <AppCard title="Edit Profile" icon="edit" class="section-card">
      <AppForm @submit="handleUpdateProfile" :loading="isUpdating">
        <AppInput
          v-model="displayName"
          label="Display Name"
          required
          :error-message="updateError"
        />
      </AppForm>
    </AppCard>
    
    <AppCard title="Danger Zone" icon="warning" class="section-card danger-zone">
      <div class="danger-actions">
        <div class="danger-action">
          <div class="danger-description">
            <h3>Reset Points</h3>
            <p>This will reset your points to zero. This action cannot be undone.</p>
          </div>
          <AppButton 
            label="Reset Points"
            variant="danger"
            @click="isShowingResetConfirm = true"
          />
        </div>
      </div>
    </AppCard>
    
    <!-- Reset points confirmation modal -->
    <ConfirmModal
      v-model="isShowingResetConfirm"
      title="Reset Points"
      confirmText="Reset Points"
      :loading="isResetting"
      loadingText="Resetting..."
      warning="This action cannot be undone."
      danger
      icon="warning"
      @confirm="handleResetPoints"
    >
      <p>Are you sure you want to reset your points to zero?</p>
    </ConfirmModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { notificationService } from '../services/notificationService';

// Components
import ProfileStat from '../components/ProfileStat.vue';
import AppCard from '../components/ui/AppCard.vue';
import AppForm from '../components/ui/AppForm.vue';
import AppInput from '../components/ui/AppInput.vue';
import AppButton from '../components/ui/AppButton.vue';
import EmptyState from '../components/EmptyState.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import TagBadge from '../components/TagBadge.vue';
import PointsBadge from '../components/PointsBadge.vue';

export default {
  name: 'ProfileView',
  components: {
    ProfileStat,
    AppCard,
    AppForm,
    AppInput,
    AppButton,
    EmptyState,
    ConfirmModal,
    TagBadge,
    PointsBadge
  },
  setup() {
    const store = useStore();
    
    // State
    const displayName = ref('');
    const isUpdating = ref(false);
    const updateError = ref('');
    const isShowingResetConfirm = ref(false);
    const isResetting = ref(false);
    
    // Computed properties
    const userProfile = computed(() => store.getters.userProfile);
    const tasks = computed(() => store.getters.tasks || []);
    
    const completedTasks = computed(() => {
      return tasks.value.filter(task => task.completedBy === auth.currentUser?.uid);
    });
    
    const badges = computed(() => {
      return userProfile.value?.badges || [];
    });
    
    // Initialiser le champ avec la valeur actuelle
    onMounted(() => {
      if (userProfile.value?.name) {
        displayName.value = userProfile.value.name;
      }
    });
    
    // Methods
    const handleUpdateProfile = async () => {
      if (!displayName.value.trim()) {
        updateError.value = 'Please enter a display name';
        return;
      }
      
      isUpdating.value = true;
      updateError.value = '';
      
      try {
        await store.dispatch('updateProfile', { name: displayName.value.trim() });
        notificationService.success('Profile updated successfully');
      } catch (err) {
        console.error('Error updating profile:', err);
        updateError.value = err.message || 'Failed to update profile';
        notificationService.error('Failed to update profile: ' + (err.message || 'Unknown error'));
      } finally {
        isUpdating.value = false;
      }
    };
    
    const handleResetPoints = async () => {
      isResetting.value = true;
      
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
        
        isShowingResetConfirm.value = false;
        notificationService.success('Points have been reset to zero');
      } catch (error) {
        console.error('Error resetting points:', error);
        notificationService.error('Failed to reset points: ' + (error.message || 'Unknown error'));
      } finally {
        isResetting.value = false;
      }
    };
    
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    const formatCategory = (category) => {
      if (!category) return '';
      return category.charAt(0).toUpperCase() + category.slice(1);
    };
    
    return {
      userProfile,
      displayName,
      isUpdating,
      updateError,
      isShowingResetConfirm,
      isResetting,
      completedTasks,
      badges,
      handleUpdateProfile,
      handleResetPoints,
      formatDate,
      formatCategory
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

.section-card {
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
