<template>
  <div class="home">
    <h1>Welcome to ChoreQuest, {{ userProfile?.name ? userProfile.name : 'Guest' }}!</h1>

    <div v-if="household" class="household-info">
      <HouseholdCard :name="household.name" :points="userProfile?.points || 0">
        <!-- Contenu supplémentaire peut être ajouté ici avec le slot -->
      </HouseholdCard>
      
      <div class="dashboard">
        <div class="dashboard-section">
          <SectionHeader title="Tasks To Do" icon="assignment">
            <template v-slot:actions>
              <router-link to="/tasks" class="section-action-link">View All</router-link>
            </template>
          </SectionHeader>
          
          <EmptyState v-if="!availableTasks.length" icon="thumb_up">
            <p>All tasks completed! Good job! 🎉</p>
          </EmptyState>
          
          <div v-else class="task-cards">
            <TaskCard 
              v-for="task in availableTasks.slice(0, 3)" 
              :key="task.id" 
              :task="task"
              :compact="true"
              :show-details-button="false"
              details-button-text="Complete this task →"
              @view-details="navigateToTasks"
            />
          </div>
        </div>
        
        <div class="dashboard-section">
          <SectionHeader title="Recently Completed" icon="task_alt">
            <template v-slot:actions>
              <router-link to="/tasks?filter=completed" class="section-action-link">View All</router-link>
            </template>
          </SectionHeader>
          
          <EmptyState v-if="!recentCompletedTasks.length" icon="hourglass_empty">
            <p>No tasks have been completed yet.</p>
          </EmptyState>
          
          <div v-else class="task-cards">
            <TaskCard 
              v-for="task in recentCompletedTasks.slice(0, 3)" 
              :key="task.id" 
              :task="task"
              :compact="true"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-household">
      <EmptyState icon="home">
        <p>You are not part of a household yet.</p>
      </EmptyState>
      <router-link to="/household" class="btn">Join or Create Household</router-link>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import TaskCard from '../components/TaskCard.vue';
import HouseholdCard from '../components/HouseholdCard.vue';
import EmptyState from '../components/EmptyState.vue';
import SectionHeader from '../components/SectionHeader.vue';

export default {
  name: 'HomeView',
  components: {
    TaskCard,
    HouseholdCard,
    EmptyState,
    SectionHeader
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const userProfile = computed(() => store.getters.userProfile)
    const household = computed(() => store.getters.household)
    const tasks = computed(() => store.getters.tasks)
    
    // Filter tasks for available (not completed) ones
    const availableTasks = computed(() => {
      if (!tasks.value) return [];
      return tasks.value
        .filter(task => !task.completedBy)
        .sort((a, b) => b.pointsValue - a.pointsValue); // Sort by points value
    });
    
    // Filter and sort tasks for recently completed ones
    const recentCompletedTasks = computed(() => {
      if (!tasks.value) return [];
      return tasks.value
        .filter(task => task.completedBy)
        .sort((a, b) => {
          // Convert Firebase timestamps to JS dates for comparison
          const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
          const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
          return dateB - dateA; // Sort newest first
        });
    });
    
    onMounted(() => {
      if (household.value && household.value.id) {
        store.dispatch('fetchTasks');
      }
    });
    
    // Watch for changes to household and reload tasks if needed
    watch(household, (newHousehold) => {
      if (newHousehold && newHousehold.id) {
        store.dispatch('fetchTasks');
      }
    });
    
    const navigateToTasks = () => {
      router.push({ name: 'tasks' });
    };
    
    return {
      userProfile,
      household,
      availableTasks,
      recentCompletedTasks,
      navigateToTasks
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-medium);
}

.household-info {
  margin-top: var(--spacing-large);
}

.section-action-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-small);
}

.no-household {
  margin-top: var(--spacing-vlarge);
  padding: var(--spacing-vlarge);
  background-color: var(--color-gray-vlight);
  border-radius: var(--border-radius-medium);
  text-align: center;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-vvlarge);
  margin-top: var(--spacing-vvlarge);
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small);
}

.task-card {
}

.btn {
  display: inline-block;
  margin-top: var(--spacing-medium);
  padding: var(--spacing-small) var(--spacing-large);
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius-medium);
  font-weight: var(--font-weight-semibold);
}

/* Media query for larger screens */
@media (min-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
