<template>
  <div class="tasks">
    <h1>Household Tasks</h1>
    
    <div class="tasks-container" v-if="household">
      <TaskFilters
        v-model:filter="filter"
        v-model:sortOption="sortOption"
      />
      
      <div class="user-actions">
        <button @click="showAddTaskModal = true">
          <i class="material-icons">add_circle</i>
          Add New Task
        </button>
      </div>
      
      <EmptyState 
        v-if="filteredTasks.length === 0"
        icon="search_off"
      >
        <p>No tasks found.</p>
      </EmptyState>
      
      <div v-else class="task-grid">
        <TaskCard
          v-for="task in sortedTasks"
          :key="task.id"
          :task="task"
          :completing="completingTaskId === task.id"
          :show-complete-button="!task.completedBy"
          :show-details-button="true"
          @complete="completeTask"
          @view-details="openTaskDetails"
        />
      </div>
      
      <!-- Modal pour ajouter une tâche -->
      <AppModal
        v-model="showAddTaskModal"
        title="Add New Task"
        icon="add_task"
        size="medium"
      >
        <form @submit.prevent="handleAddTask">
          <div class="form-group">
            <label for="taskName">Task Name</label>
            <input type="text" id="taskName" v-model="newTask.name" required />
          </div>
          
          <div class="form-group">
            <label for="taskIcon">Task Icon (optional)</label>
            <IconSelector 
              v-model="newTask.icon" 
              :category="newTask.category" 
              input-id="new-task-icon" 
            />
          </div>
          
          <div class="form-group">
            <label for="taskDescription">Description</label>
            <textarea id="taskDescription" v-model="newTask.description"></textarea>
          </div>
          
          <div class="form-group">
            <label for="taskCategory">Category</label>
            <select id="taskCategory" v-model="newTask.category" required>
              <option value="cleaning">Cleaning</option>
              <option value="cooking">Cooking</option>
              <option value="maintenance">Maintenance</option>
              <option value="outdoor">Outdoor</option>
              <option value="shopping">Shopping</option>
              <option value="laundry">Laundry</option>
              <option value="dishes">Dishes</option>
              <option value="pets">Pets</option>
              <option value="childcare">Childcare</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="taskPoints">Points Value</label>
            <input type="number" id="taskPoints" v-model.number="newTask.pointsValue" min="1" max="10" required />
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showAddTaskModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="addingTask">
              <span v-if="addingTask">Adding...</span>
              <span v-else>Add Task</span>
            </button>
          </div>
        </form>
      </AppModal>
      
      <!-- Modal pour afficher les détails de la tâche -->
      <AppModal
        v-model="showTaskDetails"
        :title="selectedTask.name || 'Task Details'"
        :icon="selectedTask.icon || getCategoryIcon(selectedTask.category)"
        size="medium"
      >
        <div class="task-details">
          <p v-if="selectedTask.description" class="task-description">{{ selectedTask.description }}</p>
          <div class="task-meta">
            <div class="task-meta-item">
              <span class="label">Category:</span>
              <span>{{ selectedTask.category }}</span>
            </div>
            <div class="task-meta-item">
              <span class="label">Points:</span>
              <span>{{ selectedTask.pointsValue || 0 }}</span>
            </div>
            <div v-if="selectedTask.completedBy" class="task-meta-item">
              <span class="label">Completed by:</span>
              <span>{{ getCompletedByName(selectedTask.completedBy) }}</span>
            </div>
            <div v-if="selectedTask.completedAt" class="task-meta-item">
              <span class="label">Completed on:</span>
              <span>{{ formatDate(selectedTask.completedAt) }}</span>
            </div>
          </div>
        </div>
        
        <template #footer>
          <button 
            v-if="!selectedTask.completedBy" 
            class="btn-primary" 
            @click="completeTask(selectedTask.id)"
            :disabled="completingTaskId === selectedTask.id"
          >
            <span v-if="completingTaskId === selectedTask.id">Completing...</span>
            <span v-else>Complete Task</span>
          </button>
        </template>
      </AppModal>
    </div>
    
    <div v-else class="no-household">
      <EmptyState icon="home_work">
        <p>You need to join a household to see and manage tasks.</p>
      </EmptyState>
      <router-link to="/household" class="btn">Join or Create Household</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import AppModal from '../components/ui/AppModal.vue';

import TaskCard from '../components/TaskCard.vue';
import TaskFilters from '../components/TaskFilters.vue';
import EmptyState from '../components/EmptyState.vue';
import IconSelector from '../components/IconSelector.vue';

export default {
  name: 'TasksView',
  components: {
    TaskCard,
    TaskFilters,
    EmptyState,
    IconSelector,
    AppModal
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Récupération du filtre depuis l'URL si présent
    const filter = ref(router.currentRoute.value.query.filter || 'all');
    
    // Surveillance du changement de filtre pour mettre à jour l'URL
    watch(filter, (newFilter) => {
      router.replace({ query: { ...router.currentRoute.value.query, filter: newFilter } });
    });
    
    const showAddTaskModal = ref(false);
    const addingTask = ref(false);
    const completingTaskId = ref(null);
    const sortOption = ref('status');
    
    const showTaskDetails = ref(false);
    const selectedTask = ref({});
    
    const newTask = ref({
      name: '',
      description: '',
      category: 'cleaning',
      pointsValue: 5,
      icon: ''
    });
    
    // Fonction pour obtenir l'icône de catégorie
    const getCategoryIcon = (category) => {
      const icons = {
        cleaning: 'cleaning_services',
        cooking: 'restaurant',
        maintenance: 'build',
        outdoor: 'grass',
        shopping: 'shopping_cart',
        laundry: 'local_laundry_service',
        dishes: 'utensils',
        pets: 'pets',
        childcare: 'child_care'
      };
      
      return icons[category] || 'task_alt';
    };
    
    const household = computed(() => store.getters.household);
    const tasks = computed(() => store.getters.tasks || []);
    
    const filteredTasks = computed(() => {
      if (filter.value === 'available') {
        return tasks.value.filter(task => !task.completedBy);
      } else if (filter.value === 'completed') {
        return tasks.value.filter(task => task.completedBy);
      }
      
      return tasks.value;
    });
    
    // Tri des tâches selon différents critères
    const sortedTasks = computed(() => {
      const tasksToSort = [...filteredTasks.value];
      
      switch (sortOption.value) {
        case 'status':
          // Les tâches disponibles d'abord, puis les complétées
          return tasksToSort.sort((a, b) => {
            if (a.completedBy && !b.completedBy) return 1;
            if (!a.completedBy && b.completedBy) return -1;
            return b.pointsValue - a.pointsValue; // Sous-tri par points
          });
        
        case 'points':
          // Tri par points décroissant
          return tasksToSort.sort((a, b) => b.pointsValue - a.pointsValue);
        
        case 'date':
          // Tri par date d'ajout (plus récent d'abord)
          return tasksToSort.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
          });
        
        case 'name':
          // Tri alphabétique par nom
          return tasksToSort.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
        
        case 'category':
          // Tri par catégorie puis par nom
          return tasksToSort.sort((a, b) => {
            const categoryCompare = a.category.localeCompare(b.category);
            if (categoryCompare !== 0) return categoryCompare;
            return a.name.localeCompare(b.name);
          });
        
        default:
          return tasksToSort;
      }
    });
    
    // Chargement initial des tâches
    onMounted(() => {
      if (household.value && household.value.id) {
        store.dispatch('fetchTasks');
      }
    });
    
    // Surveillance des changements de household
    watch(household, (newHousehold) => {
      if (newHousehold && newHousehold.id) {
        store.dispatch('fetchTasks');
      }
    });
    
    // Ajouter une tâche
    const handleAddTask = async () => {
      if (!household.value) return;
      
      // Validation supplémentaire
      if (!newTask.value.name.trim()) {
        notificationService.error('Task name is required');
        return;
      }
      
      addingTask.value = true;
      
      try {
        await addDoc(collection(db, 'tasks'), {
          ...newTask.value,
          householdId: household.value.id,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.uid
        });
        
        // Réinitialiser le formulaire
        newTask.value = {
          name: '',
          description: '',
          category: 'cleaning',
          pointsValue: 5,
          icon: ''
        };
        
        showAddTaskModal.value = false;
        store.dispatch('fetchTasks');
        notificationService.success('Task added successfully');
      } catch (error) {
        console.error('Error adding task:', error);
        notificationService.error('Failed to add task: ' + error.message);
      } finally {
        addingTask.value = false;
      }
    };
    
    // Fonction pour compléter une tâche
    const completeTask = async (taskId) => {
      if (!authService.isAuthenticated()) {
        notificationService.error('You must be logged in to complete tasks');
        router.push('/login');
        return;
      }
      
      try {
        completingTaskId.value = taskId;
        
        await store.dispatch('completeTask', { 
          taskId, 
          userId: authService.getCurrentUser().uid 
        });
        
        notificationService.success('Task completed successfully! Points awarded.');
      } catch (error) {
        console.error('Failed to complete task:', error);
        notificationService.error('Failed to complete task: ' + error.message);
        
        // Si déconnecté après avoir tenté de compléter la tâche
        if (!authService.isAuthenticated()) {
          router.push('/login'); // Corrigé: router au lieu de route
        }
      } finally {
        completingTaskId.value = null;
      }
    };
    
    // Ouvrir la modal de détails de tâche
    const openTaskDetails = (task) => {
      selectedTask.value = task;
      showTaskDetails.value = true;
    };
    
    // Format date helper
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    // Get completed by name
    const getCompletedByName = (userId) => {
      // Placeholder - idéalement, vous auriez une fonction pour récupérer le nom d'utilisateur
      return userId; // Retourne l'ID en attendant d'avoir les noms d'utilisateurs
    };
    
    return {
      household,
      filter,
      sortOption,
      filteredTasks,
      sortedTasks,
      showAddTaskModal,
      addingTask,
      newTask,
      handleAddTask,
      completeTask,
      completingTaskId,
      showTaskDetails,
      selectedTask,
      openTaskDetails,
      formatDate,
      getCompletedByName,
      getCategoryIcon
    };
  }
}
</script>

<style scoped>
.tasks {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-medium);
}

.tasks-container {
  margin: var(--spacing-large) 0;
}

.user-actions {
  display: flex;
  justify-content: center;
  margin: var(--spacing-medium) 0;
}

.user-actions button {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--spacing-small) var(--spacing-medium);
  border-radius: var(--border-radius-medium);
  font-weight: var(--font-weight-semibold);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-medium);
  margin-top: var(--spacing-large);
}

.no-household {
  text-align: center;
  padding: var(--spacing-vlarge);
}

.btn {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-small) var(--spacing-large);
  border-radius: var(--border-radius-medium);
  margin-top: var(--spacing-medium);
  font-weight: var(--font-weight-semibold);
}

.form-group {
  margin-bottom: var(--spacing-medium);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-vsmall);
  font-weight: var(--font-weight-semibold);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: var(--spacing-small);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-small);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-medium);
  margin-top: var(--spacing-large);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--spacing-small) var(--spacing-large);
  border-radius: var(--border-radius-small);
  font-weight: var(--font-weight-semibold);
}

.btn-secondary {
  background-color: var(--color-gray-light);
  color: var(--color-gray-dark);
  border: none;
  padding: var(--spacing-small) var(--spacing-large);
  border-radius: var(--border-radius-small);
  font-weight: var(--font-weight-semibold);
}

.task-details {
  padding: var(--spacing-medium) 0;
}

.task-description {
  margin-bottom: var(--spacing-medium);
  white-space: pre-line;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small);
}

.task-meta-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-small) 0;
  border-bottom: 1px solid var(--color-gray-light);
}

.task-meta-item .label {
  font-weight: var(--font-weight-semibold);
  min-width: 120px;
}
</style>
