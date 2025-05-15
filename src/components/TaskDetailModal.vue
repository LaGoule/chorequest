<template>
  <AppModal
    v-model="isOpen"
    title="Task Details"
    :icon="isEditing ? 'edit' : 'task_alt'"
    size="medium"
    @close="close"
  >
    <!-- View Mode -->
    <div v-if="!isEditing" class="task-details-view">
      <div class="task-header">
        <div class="task-title">
          <TaskIcon 
            :icon="task.icon" 
            :category="task.category" 
            size="large"
            with-background
          />
          <h2>{{ task.name }}</h2>
        </div>
        <PointsBadge 
          :value="task.pointsValue" 
          :show-plus="!!task.completedBy" 
          size="large"
        />
      </div>
      
      <div class="task-tags">
        <TagBadge 
          :category="task.category" 
          :text="formatCategory(task.category)" 
          size="medium"
        />
      </div>
      
      <div v-if="task.description" class="task-description">
        {{ task.description }}
      </div>
      
      <div class="task-meta">
        <span class="task-created">
          Created {{ formatDate(task.createdAt) }}
        </span>
      </div>
      
      <div v-if="task.completedBy" class="task-completion">
        <i class="material-icons completion-icon">check_circle</i>
        <span>Completed by {{ getCompletedByName(task.completedBy) }}</span>
        <span class="completion-date">{{ formatDate(task.completedAt) }}</span>
      </div>
    </div>
    
    <!-- Edit Mode -->
    <AppForm 
      v-else 
      class="task-edit-form" 
      @submit="saveTask"
      :loading="saving"
    >
      <AppInput
        v-model="editedTask.name"
        label="Task Name"
        required
      />
      
      <AppInput
        v-model="editedTask.description"
        label="Description"
        type="textarea"
        rows="3"
      />
      
      <AppSelect
        v-model="editedTask.category"
        label="Category"
        required
        :options="categoryOptions"
      />
      
      <AppInput
        v-model.number="editedTask.pointsValue"
        label="Points Value"
        type="number"
        min="1"
        max="10"
        required
      />
      
      <div class="form-group">
        <label>Task Icon</label>
        <IconSelector 
          v-model="editedTask.icon" 
          :category="editedTask.category" 
          input-id="edit-task-icon" 
        />
      </div>
    </AppForm>
    
    <template v-slot:footer>
      <div v-if="!isEditing">
        <!-- Delete button -->
        <AppButton
          v-if="canDelete"
          variant="danger"
          icon="delete"
          label="Delete Task"
          @click="confirmDelete"
        />
        
        <div class="actions-spacer"></div>
        
        <!-- Complete button -->
        <AppButton
          v-if="!task.completedBy"
          variant="success"
          icon="check_circle"
          :label="completing ? 'Completing...' : 'Complete Task'"
          :loading="completing"
          :disabled="completing"
          @click="completeTask"
        />
        
        <!-- Edit button -->
        <AppButton
          v-if="canEdit"
          variant="secondary"
          icon="edit"
          label="Edit Task"
          @click="startEditing"
        />
      </div>
      
      <div v-else>
        <AppButton
          variant="outline"
          label="Cancel"
          @click="cancelEdit"
        />
        
        <AppButton
          variant="primary"
          icon="save"
          :label="saving ? 'Saving...' : 'Save Changes'"
          :loading="saving"
          :disabled="saving"
          type="submit"
          @click="saveTask"
        />
      </div>
    </template>
  </AppModal>
  
  <!-- Confirmation modal for task deletion -->
  <ConfirmModal
    v-model="showDeleteConfirm"
    title="Delete Task"
    confirmText="Delete Permanently"
    :loading="deleting"
    loadingText="Deleting..."
    warning="This action cannot be undone."
    danger
    icon="warning"
    @confirm="deleteTask"
  >
    <p>Are you sure you want to delete this task?</p>
    
    <div v-if="task.completedBy" class="warning-message">
      <p><strong>Warning:</strong> This task has already been completed and has awarded points to a household member.</p>
      <p>Deleting this task will not revoke the points that were awarded.</p>
    </div>
  </ConfirmModal>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { auth, db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Components
import TaskIcon from './TaskIcon.vue';
import PointsBadge from './PointsBadge.vue';
import TagBadge from './TagBadge.vue';
import IconSelector from './IconSelector.vue';
import ConfirmModal from './ConfirmModal.vue';
import AppModal from './ui/AppModal.vue';
import AppForm from './ui/AppForm.vue';
import AppInput from './ui/AppInput.vue';
import AppSelect from './ui/AppSelect.vue';
import AppButton from './ui/AppButton.vue';

// Services
import { notificationService } from '../services/notificationService';

export default {
  name: 'TaskDetailModal',
  components: {
    TaskIcon,
    PointsBadge,
    TagBadge,
    IconSelector,
    ConfirmModal,
    AppModal,
    AppForm,
    AppInput,
    AppSelect,
    AppButton
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    task: {
      type: Object,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'task-updated', 'task-completed', 'task-deleted'],
  setup(props, { emit }) {
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    const isEditing = ref(false);
    const editedTask = ref({});
    const saving = ref(false);
    const completing = ref(false);
    const showDeleteConfirm = ref(false);
    const deleting = ref(false);
    
    // Category options for the select
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
    ];
    
    // Clone the task for editing
    watch(() => props.task, (newTask) => {
      editedTask.value = { ...newTask };
    }, { immediate: true });
    
    // Permission checks
    const canEdit = computed(() => {
      return !props.task.completedBy && (props.task.createdBy === auth.currentUser.uid);
    });
    
    const canDelete = computed(() => {
      // Vérifier si l'utilisateur est le créateur ou l'admin du foyer
      return props.task.createdBy === auth.currentUser.uid || props.isAdmin;
    });
    
    const close = () => {
      if (!saving.value && !completing.value) {
        isEditing.value = false;
        emit('update:modelValue', false);
      }
    };
    
    const startEditing = () => {
      editedTask.value = { ...props.task };
      isEditing.value = true;
    };
    
    const cancelEdit = () => {
      isEditing.value = false;
    };
    
    const saveTask = async () => {
      if (saving.value) return;
      
      saving.value = true;
      
      try {
        const taskRef = doc(db, 'tasks', props.task.id);
        
        const updates = {
          name: editedTask.value.name,
          description: editedTask.value.description,
          category: editedTask.value.category,
          pointsValue: editedTask.value.pointsValue,
          icon: editedTask.value.icon
        };
        
        await updateDoc(taskRef, updates);
        
        // Update the task in the parent component
        emit('task-updated', { id: props.task.id, ...updates });
        
        isEditing.value = false;
        notificationService.success('Task updated successfully');
      } catch (error) {
        notificationService.error('Failed to update task: ' + error.message);
        console.error('Error updating task:', error);
      } finally {
        saving.value = false;
      }
    };
    
    const completeTask = async () => {
      if (completing.value || props.task.completedBy) return;
      
      completing.value = true;
      
      try {
        await emit('task-completed', props.task.id);
        close();
      } finally {
        completing.value = false;
      }
    };
    
    const confirmDelete = () => {
      showDeleteConfirm.value = true;
    };
    
    const deleteTask = async () => {
      if (deleting.value) return;
      
      deleting.value = true;
      
      try {
        const taskRef = doc(db, 'tasks', props.task.id);
        await deleteDoc(taskRef);
        
        // Notify parent that the task has been deleted
        emit('task-deleted', props.task.id);
        
        showDeleteConfirm.value = false;
        close();
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        deleting.value = false;
      }
    };
    
    const formatCategory = (category) => {
      if (!category) return '';
      return category.charAt(0).toUpperCase() + category.slice(1);
    };
    
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
    
    const getCompletedByName = (userId) => {
      if (!userId) return 'Unknown';
      return userId === auth.currentUser.uid ? 'you' : 'someone else';
    };
    
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    return {
      isOpen,
      isEditing,
      editedTask,
      saving,
      completing,
      showDeleteConfirm,
      deleting,
      canEdit,
      canDelete,
      categoryOptions,
      close,
      startEditing,
      cancelEdit,
      saveTask,
      completeTask,
      confirmDelete,
      deleteTask,
      formatCategory,
      commonIcons,
      otherIcons,
      getCategoryIcon,
      getCompletedByName,
      formatDate
    };
  }
}
</script>

<style scoped>
.task-details-view {
  text-align: left;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-medium);
}

.task-header h2 {
  margin: 0;
  color: var(--color-secondary);
}

.points-badge {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-vsmall) var(--spacing-small);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-weight-semibold);
}

.task-category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-vsmall);
  background-color: var(--color-gray-vlight);
  color: var(--color-secondary);
  padding: var(--spacing-vsmall) var(--spacing-small);
  border-radius: var(--border-radius-medium);
  margin-bottom: var(--spacing-medium);
}

.task-description {
  margin-top: var(--spacing-medium);
  margin-bottom: var(--spacing-medium);
  color: var(--color-secondary);
  white-space: pre-line;
}

.task-meta {
  margin-top: var(--spacing-medium);
  color: var(--color-gray-dark);
  font-size: var(--font-size-small);
}

.task-completion {
  margin-top: var(--spacing-medium);
  padding-top: var(--spacing-medium);
  border-top: 1px solid var(--color-gray-light);
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.completion-icon {
  color: var(--color-success);
}

.completion-date {
  margin-left: auto;
  color: var(--color-gray-dark);
  font-size: var(--font-size-small);
}

.task-edit-form {
  text-align: left;
}

.actions-spacer {
  flex-grow: 1;
}

.warning-message {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid var(--color-error);
  padding: var(--spacing-medium);
  margin: var(--spacing-medium) 0;
  text-align: left;
}

.warning-message p {
  margin: var(--spacing-vsmall) 0;
  font-size: var(--font-size-small);
}

.task-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
}

.task-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-primary-light);
  color: white;
  border-radius: var(--border-radius-full);
}

.icon-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
}

.icon-selector select {
  flex-grow: 1;
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-primary-light);
  color: white;
  border-radius: var(--border-radius-full);
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
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-small);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all var(--transition-fast);
  gap: var(--spacing-vsmall);
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

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-medium);
}
</style>
