<template>
  <div class="tasks">
    <h1>Household Tasks</h1>
    
    <div class="tasks-container" v-if="household">
      <TaskFilters
        v-model:filter="filter"
        v-model:sortOption="sortOption"
      />
      
      <div class="user-actions">
        <button @click="showAddTaskForm = !showAddTaskForm">
          <i class="material-icons">{{ showAddTaskForm ? 'cancel' : 'add_circle' }}</i>
          {{ showAddTaskForm ? 'Cancel' : 'Add New Task' }}
        </button>
      </div>
      
      <div v-if="showAddTaskForm" class="add-task-form">
        <SectionHeader title="Add New Task" icon="add_task" />
        <form @submit.prevent="addTask">
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
          
          <button type="submit" :disabled="addingTask">
            <i class="material-icons">add</i>
            {{ addingTask ? 'Adding...' : 'Add Task' }}
          </button>
        </form>
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
          :completing="completingTask === task.id"
          :show-complete-button="!task.completedBy"
          :show-details-button="true"
          @complete="completeTask"
          @view-details="openTaskDetails"
        />
      </div>
    </div>
    
    <div v-else class="no-household">
      <EmptyState icon="home_work">
        <p>You need to join a household to see and manage tasks.</p>
      </EmptyState>
      <router-link to="/household" class="btn">Join or Create Household</router-link>
    </div>
    
    <TaskDetailModal
      v-model="showTaskDetails"
      :task="selectedTask"
      :isAdmin="isAdmin"
      @task-updated="onTaskUpdated"
      @task-completed="completeTask"
      @task-deleted="onTaskDeleted"
    />
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRoute, useRouter } from 'vue-router';

import TaskCard from '../components/TaskCard.vue';
import TaskFilters from '../components/TaskFilters.vue';
import TaskDetailModal from '../components/TaskDetailModal.vue';
import EmptyState from '../components/EmptyState.vue';
import SectionHeader from '../components/SectionHeader.vue';
import IconSelector from '../components/IconSelector.vue';

export default {
  name: 'TasksView',
  components: {
    TaskCard,
    TaskFilters,
    TaskDetailModal,
    EmptyState,
    SectionHeader,
    IconSelector
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    
    // Récupération du filtre depuis l'URL si présent
    const filter = ref(route.query.filter || 'all');
    
    // Surveillance du changement de filtre pour mettre à jour l'URL
    watch(filter, (newFilter) => {
      router.replace({ query: { ...route.query, filter: newFilter } });
    });
    
    const showAddTaskForm = ref(false);
    const addingTask = ref(false);
    const completingTask = ref(null);
    const sortOption = ref('status'); // Option de tri par défaut
    
    const showTaskDetails = ref(false);
    const selectedTask = ref({});
    
    const newTask = ref({
      name: '',
      description: '',
      category: 'cleaning',
      pointsValue: 5,
      icon: '' // Ajout du champ icon
    });
    
    // Liste d'icônes communes pour les tâches - icônes problématiques remplacées
    const commonIcons = [
      { value: 'cleaning_services', label: 'Clean' }, // Remplacé 'clean'
      { value: 'utensils', label: 'Dishes' }, // Remplacé 'wash_dishes'
      { value: 'local_laundry_service', label: 'Laundry' },
      { value: 'restaurant', label: 'Cooking' }, // Remplacé 'dinner'
      { value: 'shopping_cart', label: 'Shopping' },
      { value: 'pets', label: 'Pets' },
      { value: 'child_care', label: 'Children' },
      { value: 'yard', label: 'Garden' },
      { value: 'build', label: 'Fix/Repair' },
      { value: 'mop', label: 'Mopping' } // Ajouté une alternative de nettoyage
    ];
    
    // Liste d'icônes supplémentaires
    const otherIcons = [
      { value: 'bed', label: 'Bed' },
      { value: 'bathroom', label: 'Bathroom' },
      { value: 'kitchen', label: 'Kitchen' },
      { value: 'living', label: 'Living Room' },
      { value: 'menu_book', label: 'Book/Study' },
      { value: 'commute', label: 'Transport' },
      { value: 'payments', label: 'Payments' },
      { value: 'grass', label: 'Outdoor' },
      { value: 'water_drop', label: 'Water' },
      { value: 'call', label: 'Phone Call' }
    ];
    
    // Fonction pour obtenir l'icône de catégorie
    const getCategoryIcon = (category) => {
      const icons = {
        cleaning: 'cleaning_services', // Assurons-nous que c'est cohérent
        cooking: 'restaurant', // Assurons-nous que c'est cohérent
        maintenance: 'build',
        outdoor: 'grass',
        shopping: 'shopping_cart',
        laundry: 'local_laundry_service',
        dishes: 'utensils', // Remplacé par une icône qui fonctionne
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
    
    // Vérifier si l'utilisateur est admin du foyer
    const isAdmin = computed(() => {
      if (!household.value) return false;
      return household.value.adminId === auth.currentUser.uid;
    });
    
    // Ajouter une tâche
    const addTask = async () => {
      if (!household.value) return;
      
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
          icon: '' // Réinitialisation de l'icône
        };
        
        showAddTaskForm.value = false;
        store.dispatch('fetchTasks');
      } catch (error) {
        console.error('Error adding task:', error);
      } finally {
        addingTask.value = false;
      }
    };
    
    // Compléter une tâche
    const completeTask = async (taskId) => {
      completingTask.value = taskId;
      
      try {
        await store.dispatch('completeTask', {
          taskId,
          userId: auth.currentUser.uid
        });
        
        // Rafraîchir les tâches et le profil utilisateur
        store.dispatch('fetchTasks');
        store.dispatch('fetchUserProfile', auth.currentUser.uid);
      } catch (error) {
        console.error('Error completing task:', error);
      } finally {
        completingTask.value = null;
      }
    };
    
    // Ouvrir la modal de détails de tâche
    const openTaskDetails = (task) => {
      selectedTask.value = task;
      showTaskDetails.value = true;
    };
    
    // Gérer la mise à jour d'une tâche
    const onTaskUpdated = (updatedTask) => {
      // Mettre à jour la tâche dans le store
      const taskIndex = tasks.value.findIndex(t => t.id === updatedTask.id);
      
      if (taskIndex !== -1) {
        const updatedTasks = [...tasks.value];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updatedTask };
        store.commit('setTasks', updatedTasks);
      }
    };
    
    // Gérer la suppression d'une tâche
    const onTaskDeleted = (taskId) => {
      // Supprimer la tâche du store
      const updatedTasks = tasks.value.filter(t => t.id !== taskId);
      store.commit('setTasks', updatedTasks);
    };
    
    return {
      household,
      filter,
      sortOption,
      filteredTasks,
      sortedTasks,
      showAddTaskForm,
      addingTask,
      newTask,
      completingTask,
      showTaskDetails,
      selectedTask,
      isAdmin,
      addTask,
      completeTask,
      openTaskDetails,
      onTaskUpdated,
      onTaskDeleted,
      commonIcons,
      otherIcons,
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
}

.add-task-form {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-large);
  margin-bottom: var(--spacing-large);
  box-shadow: var(--shadow-small);
}

.add-task-form form {
  text-align: left;
}

.form-group {
  margin-bottom: var(--spacing-medium);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-vsmall);
  font-weight: var(--font-weight-semibold);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-medium);
  margin-top: var(--spacing-large);
}

.no-household {
  margin-top: var(--spacing-vlarge);
  text-align: center;
}

.btn {
  display: inline-block;
  margin-top: var(--spacing-medium);
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-small) var(--spacing-large);
  border-radius: var(--border-radius-medium);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
}

.icon-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: var(--spacing-small);
  margin: var(--spacing-small) 0;
}

.icon-option {
  position: relative;
}

.icon-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.icon-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-small);
  border: 1px solid var(--color--gray-light);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.icon-button i {
  font-size: 24px;
  margin-bottom: var(--spacing-vsmall);
  color: var(--color-secondary);
}

.icon-button span {
  font-size: 10px;
  color: var(--color-gray-dark);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
}

.icon-button.active {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
}

.icon-button.active i,
.icon-button.active span {
  color: white;
}

.more-icons {
  margin-top: var(--spacing-medium);
}

.more-icons summary {
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-small);
  user-select: none;
}
</style>
