<template>
  <div class="tasks-view">
    <h1>Household Tasks</h1>
    
    <AppLoading :show="isLoading" message="Loading tasks..." />
    
    <div class="tasks-container" v-if="household">
      <div class="view-controls">
        <TabFilter 
          v-model="activeFilter"
          :tabs="filterTabs"
        />
      </div>
      
      <AppCard class="tasks-actions-card">
        <div class="actions-toolbar">
          <div class="action-buttons">
            <AppButton 
              icon="add_circle"
              :label="showAddTaskForm ? 'Cancel' : 'Add New Task'"
              variant="primary"
              @click="showAddTaskForm = !showAddTaskForm"
            />
          </div>
          
          <div class="sorting-container">
            <AppSelect
              v-model="sortOption"
              :options="sortOptions"
              placeholder="Sort by"
            />
          </div>
        </div>
        
        <AppForm 
          v-if="showAddTaskForm"
          :loading="isSubmittingTask"
          submitText="Add Task"
          @submit="addTask"
        >
          <h3>Add New Task</h3>
          
          <AppInput
            v-model="newTask.name"
            label="Task Name"
            required
            :error-message="formErrors.name"
            @blur="validateField('name')"
          />
          
          <AppInput
            v-model="newTask.description"
            label="Description"
            type="textarea"
            help-text="Describe what needs to be done."
            :error-message="formErrors.description"
            @blur="validateField('description')"
          />
          
          <div class="form-row">
            <AppSelect
              v-model="newTask.category"
              label="Category"
              required
              :options="categoryOptions"
              :error-message="formErrors.category"
              @blur="validateField('category')"
            />
            
            <AppInput
              v-model.number="newTask.pointsValue"
              label="Points Value"
              type="number"
              min="1" 
              max="10"
              required
              :error-message="formErrors.pointsValue"
              @blur="validateField('pointsValue')"
            />
          </div>
          
          <div class="form-group">
            <label for="taskIcon">Task Icon (optional)</label>
            <IconSelector 
              v-model="newTask.icon" 
              :category="newTask.category"
              input-id="task-icon" 
            />
          </div>
        </AppForm>
      </AppCard>
      
      <EmptyState 
        v-if="filteredTasks.length === 0"
        icon="search_off"
      >
        <p>No tasks found matching your criteria.</p>
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
    </div>
    
    <div v-else class="no-household">
      <EmptyState icon="home_work">
        <p>You need to join a household to see and manage tasks.</p>
      </EmptyState>
      <AppButton 
        label="Join or Create Household"
        icon="add_home"
        @click="navigateToHousehold"
      />
    </div>
    
    <TaskDetailModal
      v-model="showTaskDetails"
      :task="selectedTask"
      @task-updated="onTaskUpdated"
      @task-completed="completeTask"
      @task-deleted="onTaskDeleted"
    />
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

// Components
import AppCard from '../components/ui/AppCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppForm from '../components/ui/AppForm.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSelect from '../components/ui/AppSelect.vue'
import AppLoading from '../components/ui/AppLoading.vue'
import TabFilter from '../components/TabFilter.vue'
import TaskCard from '../components/TaskCard.vue'
import TaskDetailModal from '../components/TaskDetailModal.vue'
import IconSelector from '../components/IconSelector.vue'
import EmptyState from '../components/EmptyState.vue'

// Services and utilities
import { taskService } from '../services/taskService'
import { notificationService } from '../services/notificationService'
import { useForm } from '../composables/useForm'
import { useError } from '../composables/useError'
import { rules } from '../utils/validation'

export default {
  name: 'TasksViewStandardized',
  components: {
    AppCard,
    AppButton,
    AppForm,
    AppInput,
    AppSelect,
    AppLoading,
    TabFilter,
    TaskCard,
    TaskDetailModal,
    IconSelector,
    EmptyState
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const { error, isLoading, executeWithError } = useError()
    
    const household = computed(() => store.getters.household)
    const tasks = computed(() => store.getters.tasks || [])
    
    // Task filtering
    const activeFilter = ref('all')
    const filterTabs = [
      { label: 'All Tasks', value: 'all', icon: 'list_alt' },
      { label: 'Available', value: 'available', icon: 'assignment' },
      { label: 'Completed', value: 'completed', icon: 'assignment_turned_in' }
    ]
    
    const filteredTasks = computed(() => {
      if (activeFilter.value === 'available') {
        return tasks.value.filter(task => !task.completedBy)
      } else if (activeFilter.value === 'completed') {
        return tasks.value.filter(task => task.completedBy)
      }
      return tasks.value
    })
    
    // Task sorting
    const sortOption = ref('status')
    const sortOptions = [
      { label: 'Status (Available first)', value: 'status' },
      { label: 'Points (High to Low)', value: 'points' },
      { label: 'Date Added (Newest first)', value: 'date' },
      { label: 'Name (A to Z)', value: 'name' },
      { label: 'Category', value: 'category' }
    ]
    
    const sortedTasks = computed(() => {
      const tasksToSort = [...filteredTasks.value]
      
      switch (sortOption.value) {
        case 'status':
          return tasksToSort.sort((a, b) => {
            if (a.completedBy && !b.completedBy) return 1
            if (!a.completedBy && b.completedBy) return -1
            return b.pointsValue - a.pointsValue // Sub-sort by points
          })
        
        case 'points':
          return tasksToSort.sort((a, b) => b.pointsValue - a.pointsValue)
        
        case 'date':
          return tasksToSort.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
            return dateB - dateA
          })
        
        case 'name':
          return tasksToSort.sort((a, b) => a.name.localeCompare(b.name))
        
        case 'category':
          return tasksToSort.sort((a, b) => {
            const categoryCompare = a.category.localeCompare(b.category)
            if (categoryCompare !== 0) return categoryCompare
            return a.name.localeCompare(b.name)
          })
        
        default:
          return tasksToSort
      }
    })
    
    // Form for adding tasks
    const showAddTaskForm = ref(false)
    const isSubmittingTask = ref(false)
    const completingTaskId = ref(null)
    
    // Task details modal
    const showTaskDetails = ref(false)
    const selectedTask = ref({})
    
    // Options for the category select
    const categoryOptions = [
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'cooking', label: 'Cooking' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'laundry', label: 'Laundry' },
      { value: 'dishes', label: 'Dishes' },
      { value: 'pets', label: 'Pets' },
      { value: 'childcare', label: 'Childcare' }
    ]
    
    // Form validation
    const initialValues = {
      name: '',
      description: '',
      category: 'cleaning',
      pointsValue: 5,
      icon: ''
    }
    
    const validationSchema = {
      name: [
        rules.required('Please enter a task name'),
        rules.maxLength(50, 'Task name cannot exceed 50 characters')
      ],
      description: [
        rules.maxLength(500, 'Description cannot exceed 500 characters')
      ],
      category: [
        rules.required('Please select a category')
      ],
      pointsValue: [
        rules.required('Please set points value'),
        rules.min(1, 'Minimum value is 1'),
        rules.max(10, 'Maximum value is 10')
      ]
    }
    
    // Use form composable
    const {
      values: newTask,
      errors: formErrors,
      validateField,
      validate,
      resetForm
    } = useForm({
      initialValues,
      validationSchema
    })
    
    // Load tasks on mount
    onMounted(() => {
      if (household.value?.id) {
        loadTasks()
      }
    })
    
    // Watch for household changes
    watch(() => household.value?.id, (newId) => {
      if (newId) {
        loadTasks()
      }
    })
    
    // Load tasks
    const loadTasks = async () => {
      if (!household.value?.id) return
      
      await executeWithError(
        async () => {
          await store.dispatch('fetchTasks')
        },
        {
          onError: (err) => {
            notificationService.error('Failed to load tasks: ' + err.message)
          }
        }
      )
    }
    
    // Add task
    const addTask = async () => {
      if (!validate()) return
      
      isSubmittingTask.value = true
      
      try {
        await executeWithError(
          async () => {
            const task = await taskService.addTask({
              ...newTask,
              householdId: household.value.id
            })
            
            notificationService.success('Task added successfully')
            showAddTaskForm.value = false
            resetForm()
            
            // Refresh tasks list
            await store.dispatch('fetchTasks')
          },
          {
            showLoading: false,
            onError: (err) => {
              notificationService.error('Failed to add task: ' + err.message)
            }
          }
        )
      } finally {
        isSubmittingTask.value = false
      }
    }
    
    // Complete task
    const completeTask = async (taskId) => {
      completingTaskId.value = taskId
      
      try {
        await executeWithError(
          async () => {
            await taskService.completeTask(taskId)
            
            // Refresh tasks and user
            await Promise.all([
              store.dispatch('fetchTasks'),
              store.dispatch('fetchUserProfile')
            ])
            
            notificationService.success('Task completed! Points awarded.')
            
            // Close the modal if open
            if (showTaskDetails.value && selectedTask.value.id === taskId) {
              showTaskDetails.value = false
            }
          },
          {
            showLoading: false,
            onError: (err) => {
              notificationService.error('Failed to complete task: ' + err.message)
            }
          }
        )
      } finally {
        completingTaskId.value = null
      }
    }
    
    // Open task details
    const openTaskDetails = (task) => {
      selectedTask.value = task
      showTaskDetails.value = true
    }
    
    // Handle task update
    const onTaskUpdated = (updatedTask) => {
      const taskIndex = tasks.value.findIndex(t => t.id === updatedTask.id)
      
      if (taskIndex !== -1) {
        const updatedTasks = [...tasks.value]
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updatedTask }
        store.commit('setTasks', updatedTasks)
        
        notificationService.success('Task updated successfully')
      }
    }
    
    // Handle task deletion
    const onTaskDeleted = (taskId) => {
      const updatedTasks = tasks.value.filter(t => t.id !== taskId)
      store.commit('setTasks', updatedTasks)
      
      notificationService.success('Task deleted successfully')
    }
    
    // Navigation
    const navigateToHousehold = () => {
      router.push('/household')
    }
    
    return {
      // State
      household,
      tasks,
      activeFilter,
      filterTabs,
      filteredTasks,
      sortedTasks,
      sortOption,
      sortOptions,
      showAddTaskForm,
      isSubmittingTask,
      completingTaskId,
      showTaskDetails,
      selectedTask,
      isLoading,
      error,
      categoryOptions,
      
      // Form
      newTask,
      formErrors,
      validateField,
      
      // Actions
      addTask,
      completeTask,
      openTaskDetails,
      onTaskUpdated,
      onTaskDeleted,
      navigateToHousehold
    }
  }
}
</script>

<style scoped>
.tasks-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-medium);
}

.tasks-container {
  margin-top: var(--spacing-large);
}

.view-controls {
  margin-bottom: var(--spacing-medium);
}

.actions-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-medium);
  margin-bottom: var(--spacing-medium);
}

.tasks-actions-card {
  margin-bottom: var(--spacing-large);
}

.form-row {
  display: flex;
  gap: var(--spacing-medium);
}

.form-row > * {
  flex: 1;
}

.form-group {
  margin-bottom: var(--spacing-medium);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-vsmall);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-medium);
  margin-top: var(--spacing-large);
}

.no-household {
  margin-top: var(--spacing-xlarge);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-medium);
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
  }
  
  .actions-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
