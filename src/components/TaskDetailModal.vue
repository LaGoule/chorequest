<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>
          <i class="material-icons">{{ isEditing ? 'edit' : 'task_alt' }}</i>
          {{ isEditing ? 'Edit Task' : 'Task Details' }}
        </h3>
        <button class="close-button" @click="close">
          <i class="material-icons">close</i>
        </button>
      </div>
      
      <div class="modal-content">
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
            <!-- Emplacement futur pour des tags supplémentaires -->
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
        <form v-else class="task-edit-form" @submit.prevent="saveTask">
          <div class="form-group">
            <label for="taskName">Task Name</label>
            <input type="text" id="taskName" v-model="editedTask.name" required />
          </div>
          
          <div class="form-group">
            <label for="taskIcon">Task Icon</label>
            <IconSelector 
              v-model="editedTask.icon" 
              :category="editedTask.category" 
              input-id="edit-task-icon" 
            />
          </div>
          
          <div class="form-group">
            <label for="taskDescription">Description</label>
            <textarea id="taskDescription" v-model="editedTask.description" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label for="taskCategory">Category</label>
            <select id="taskCategory" v-model="editedTask.category" required>
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
            <input type="number" id="taskPoints" v-model.number="editedTask.pointsValue" min="1" max="10" required />
          </div>
        </form>
      </div>
      
      <div class="modal-actions">
        <div v-if="!isEditing">
          
          <button 
            v-if="!task.completedBy" 
            class="complete-button"
            @click="completeTask"
            :disabled="completing"
          >
            <i class="material-icons">check_circle</i>
            {{ completing ? 'Completing...' : 'Complete Task' }}
          </button>
          
          <button v-if="canEdit" class="edit-button" @click="startEditing">
            <i class="material-icons">edit</i>
            Edit
          </button>
          
          <button v-if="canDelete" class="delete-button" @click="confirmDelete">
            <i class="material-icons">delete</i>
            Delete
          </button>
        </div>
        
        <div v-else>
          <button class="cancel-button" @click="cancelEdit">
            <i class="material-icons">close</i>
            Cancel
          </button>
          <button class="save-button" @click="saveTask" :disabled="saving">
            <i class="material-icons">save</i>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Confirmation modal for task deletion -->
  <div v-if="showDeleteConfirm" class="modal-overlay">
    <div class="confirm-modal">
      <h3>
        <i class="material-icons warning-icon">warning</i>
        Delete Task
      </h3>
      
      <p>Are you sure you want to delete this task?</p>
      
      <div v-if="task.completedBy" class="warning-message">
        <p><strong>Warning:</strong> This task has already been completed and has awarded points to a household member.</p>
        <p>Deleting this task will not revoke the points that were awarded.</p>
      </div>
      
      <div class="confirm-actions">
        <button class="cancel-button" @click="showDeleteConfirm = false">
          <i class="material-icons">close</i>
          Cancel
        </button>
        <button class="delete-confirm-button" @click="deleteTask" :disabled="deleting">
          <i class="material-icons">{{ deleting ? 'hourglass_empty' : 'delete_forever' }}</i>
          {{ deleting ? 'Deleting...' : 'Delete Permanently' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { auth, db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import IconSelector from './IconSelector.vue';
import TaskIcon from './TaskIcon.vue';
import PointsBadge from './PointsBadge.vue';
import TagBadge from './TagBadge.vue';

export default {
  name: 'TaskDetailModal',
  components: {
    IconSelector,
    TaskIcon,
    PointsBadge,
    TagBadge
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'task-updated', 'task-completed', 'task-deleted'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editedTask = ref({});
    const saving = ref(false);
    const completing = ref(false);
    const showDeleteConfirm = ref(false);
    const deleting = ref(false);
    
    // Clone the task for editing
    watch(() => props.task, (newTask) => {
      editedTask.value = { ...newTask };
    }, { immediate: true });
    
    const canEdit = computed(() => {
      return !props.task.completedBy && (props.task.createdBy === auth.currentUser.uid);
    });
    
    // Autoriser la suppression pour le créateur et l'admin
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
          icon: editedTask.value.icon // Ajout de l'icône
        };
        
        await updateDoc(taskRef, updates);
        
        // Update the task in the parent component
        emit('task-updated', { id: props.task.id, ...updates });
        
        isEditing.value = false;
      } catch (error) {
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
      isEditing,
      editedTask,
      saving,
      completing,
      showDeleteConfirm,
      deleting,
      canEdit,
      canDelete,
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-container {
  background-color: white;
  border-radius: var(--border-radius-medium);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-large);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-medium);
  border-bottom: 1px solid var(--color--gray-light);
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.close-button {
  background: none;
  border: none;
  padding: var(--spacing-vsmall);
  cursor: pointer;
  color: var(--color-gray-medium);
}

.modal-content {
  padding: var(--spacing-medium);
}

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
  border-top: 1px solid var(--color--gray-light);
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

.modal-actions>div {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  padding: var(--spacing-medium);
  border-top: 1px solid var(--color--gray-light);
  gap: var(--spacing-small);
}

.action-spacer {
  flex-grow: 1;
}

.complete-button {
  background-color: var(--color-success);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
}

.edit-button {
  background-color: var(--color-secondary-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
}

.delete-button {
  background-color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
}

.cancel-button {
  background-color: var(--color-gray-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
}

.save-button {
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
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
.form-group select,
.form-group textarea {
  width: calc(100% - var(--spacing-medium));
  padding: var(--spacing-small);
  border: 1px solid var(--color--gray-light);
  border-radius: var(--border-radius-small);
}
.form-group select{
    width: 100%;
}

.confirm-modal {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-large);
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-large);
}

.confirm-modal h3 {
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  color: var(--color-error);
}

.warning-icon {
  color: var(--color-error);
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

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-small);
  margin-top: var(--spacing-large);
}

.delete-confirm-button {
  background-color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
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
  border: 1px solid var(--color--gray-light);
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
