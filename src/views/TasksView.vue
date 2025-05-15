<template>
  <div class="tasks">
    <h1>Household Tasks</h1>
    
    <div class="tasks-container" v-if="household">
      <div class="task-filters">
        <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All Tasks</button>
        <button :class="{ active: filter === 'available' }" @click="filter = 'available'">Available Tasks</button>
        <button :class="{ active: filter === 'completed' }" @click="filter = 'completed'">Completed Tasks</button>
      </div>
      
      <div v-if="isAdmin" class="admin-actions">
        <button @click="showAddTaskForm = !showAddTaskForm">
          {{ showAddTaskForm ? 'Cancel' : 'Add New Task' }}
        </button>
      </div>
      
      <div v-if="showAddTaskForm" class="add-task-form">
        <h3>Add New Task</h3>
        <form @submit.prevent="addTask">
          <div class="form-group">
            <label for="taskName">Task Name</label>
            <input type="text" id="taskName" v-model="newTask.name" required />
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
            </select>
          </div>
          
          <div class="form-group">
            <label for="taskPoints">Points Value</label>
            <input type="number" id="taskPoints" v-model.number="newTask.pointsValue" min="1" required />
          </div>
          
          <button type="submit" :disabled="addingTask">{{ addingTask ? 'Adding...' : 'Add Task' }}</button>
        </form>
      </div>
      
      <div v-if="filteredTasks.length === 0" class="no-tasks">
        <p>No tasks found.</p>
      </div>
      
      <div v-else class="task-list">
        <div v-for="task in filteredTasks" :key="task.id" class="task-card">
          <div class="task-header">
            <h3>{{ task.name }}</h3>
            <span class="points-badge">{{ task.pointsValue }} points</span>
          </div>
          
          <div class="task-body">
            <p>{{ task.description }}</p>
            <span class="category-badge">{{ task.category }}</span>
          </div>
          
          <div class="task-footer">
            <button 
              v-if="!task.completedBy"
              @click="completeTask(task.id)"
              :disabled="completingTask"
            >
              {{ completingTask === task.id ? 'Completing...' : 'Complete Task' }}
            </button>
            <div v-else class="completed-info">
              <p>Completed by {{ getCompletedByName(task.completedBy) }}</p>
              <p>{{ formatDate(task.completedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-household">
      <p>You need to join a household to see and manage tasks.</p>
      <router-link to="/household" class="btn">Join or Create Household</router-link>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'TasksView',
  setup() {
    const store = useStore();
    const filter = ref('all');
    const showAddTaskForm = ref(false);
    const addingTask = ref(false);
    const completingTask = ref(null);
    
    const newTask = ref({
      name: '',
      description: '',
      category: 'cleaning',
      pointsValue: 5
    });
    
    const household = computed(() => store.getters.household);
    const tasks = computed(() => store.getters.tasks);
    
    const isAdmin = computed(() => {
      if (!household.value) return false;
      return household.value.adminId === auth.currentUser.uid;
    });
    
    const filteredTasks = computed(() => {
      if (!tasks.value) return [];
      
      if (filter.value === 'available') {
        return tasks.value.filter(task => !task.completedBy);
      } else if (filter.value === 'completed') {
        return tasks.value.filter(task => task.completedBy);
      }
      
      return tasks.value;
    });
    
    onMounted(() => {
      if (household.value && household.value.id) {
        store.dispatch('fetchTasks');
      }
    });
    
    // Add a watcher for the household value
    watch(household, (newHousehold) => {
      if (newHousehold && newHousehold.id) {
        store.dispatch('fetchTasks');
      }
    });
    
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
        
        newTask.value = {
          name: '',
          description: '',
          category: 'cleaning',
          pointsValue: 5
        };
        
        showAddTaskForm.value = false;
        store.dispatch('fetchTasks');
      } catch (error) {
        console.error('Error adding task:', error);
      } finally {
        addingTask.value = false;
      }
    };
    
    const completeTask = async (taskId) => {
      completingTask.value = taskId;
      
      try {
        await store.dispatch('completeTask', {
          taskId,
          userId: auth.currentUser.uid
        });
        
        // Refresh tasks
        store.dispatch('fetchTasks');
        store.dispatch('fetchUserProfile', auth.currentUser.uid);
      } catch (error) {
        console.error('Error completing task:', error);
      } finally {
        completingTask.value = null;
      }
    };
    
    const getCompletedByName = (userId) => {
      // In a real app, you would lookup the user name by ID
      return userId === auth.currentUser.uid ? 'you' : 'someone else';
    };
    
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    return {
      household,
      tasks,
      filter,
      filteredTasks,
      showAddTaskForm,
      newTask,
      addingTask,
      completingTask,
      isAdmin,
      addTask,
      completeTask,
      getCompletedByName,
      formatDate
    };
  }
}
</script>

<style scoped>
.tasks-container {
  margin: 20px auto;
  max-width: 800px;
}

.task-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.task-filters button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.task-filters button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.admin-actions {
  margin-bottom: 20px;
}

.add-task-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.task-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.task-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-badge {
  background-color: #42b983;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
}

.category-badge {
  display: inline-block;
  background-color: #f0f0f0;
  color: #333;
  padding: 3px 8px;
  border-radius: 12px;
  margin-top: 10px;
}

.task-footer {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.completed-info {
  font-style: italic;
  color: #666;
}

button {
  padding: 8px 16px;
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

input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  height: 100px;
}

@media (min-width: 768px) {
  .task-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
