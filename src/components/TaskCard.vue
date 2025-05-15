<template>
  <div 
    class="task-card" 
    :class="{ 'task-completed': task.completedBy, 'compact-mode': compact }"
    @click="$emit('view-details', task)"
  >
    <div class="task-header">
      <div class="task-title">
        <TaskIcon 
          :icon="task.icon" 
          :category="task.category" 
          :size="compact ? 'small' : 'medium'"
          with-background
        />
        <h3>{{ task.name }}</h3>
      </div>
      <PointsBadge 
        :value="task.pointsValue" 
        :show-plus="!!task.completedBy" 
        :size="compact ? 'small' : 'medium'"
      />
    </div>
    
    <div v-if="!compact" class="task-body">
      <p v-if="task.description" class="task-description">
        {{ truncateDescription(task.description) }}
      </p>
      <div class="tags-container">
        <TagBadge 
          :category="task.category" 
          :text="formatCategory(task.category)" 
          size="small"
        />
        <!-- Emplacement futur pour des tags supplémentaires -->
      </div>
    </div>
    
    <div v-if="task.completedBy" class="task-completed-info">
      <p>
        <i class="material-icons">check_circle</i>
        Completed by {{ getCompletedByName(task.completedBy) }}
        <span class="completed-time">{{ formatTimeAgo(task.completedAt) }}</span>
      </p>
    </div>
    
    <div v-if="!compact" class="task-footer">
      <slot name="actions"></slot>
      
      <button 
        v-if="!task.completedBy && showCompleteButton" 
        class="complete-button"
        @click.stop="$emit('complete', task.id)"
        :disabled="completing"
      >
        <i class="material-icons">check</i>
        {{ completing ? 'Completing...' : 'Complete' }}
      </button>
      
      <button 
        v-if="showDetailsButton" 
        class="details-button"
        @click.stop="$emit('view-details', task)"
      >
        <i class="material-icons">visibility</i>
        {{ detailsButtonText || 'Details' }}
      </button>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebase';
import TaskIcon from './TaskIcon.vue';
import PointsBadge from './PointsBadge.vue';
import TagBadge from './TagBadge.vue';

export default {
  name: 'TaskCard',
  components: {
    TaskIcon,
    PointsBadge,
    TagBadge
  },
  props: {
    task: {
      type: Object,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    },
    showCompleteButton: {
      type: Boolean,
      default: false
    },
    showDetailsButton: {
      type: Boolean,
      default: false
    },
    detailsButtonText: {
      type: String,
      default: ''
    },
    completing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['complete', 'view-details'],
  setup() {
    const formatCategory = (category) => {
      if (!category) return '';
      return category.charAt(0).toUpperCase() + category.slice(1);
    };
    
    const getCompletedByName = (userId) => {
      if (!userId) return 'Unknown';
      return userId === auth.currentUser.uid ? 'you' : 'someone else';
    };
    
    const truncateDescription = (description, length = 100) => {
      if (!description) return '';
      if (description.length <= length) return description;
      
      return description.substring(0, length) + '...';
    };
    
    const formatTimeAgo = (timestamp) => {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return 'just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }
    };
    
    return {
      formatCategory,
      getCompletedByName,
      truncateDescription,
      formatTimeAgo
    };
  }
}
</script>

<style scoped>
.task-card {
  border: 1px solid var(--color--gray-light);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  box-shadow: var(--shadow-small);
  transition: all var(--transition-normal);
  background-color: white;
  cursor: pointer;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.compact-mode {
  padding: var(--spacing-small);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
}

.task-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  flex: 1;
}

.task-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-secondary);
}

.compact-mode .task-header h3 {
  font-size: 1rem;
}

.task-body {
  margin-top: var(--spacing-small);
  display: flex;
  flex-direction: column;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-vsmall);
  margin-top: var(--spacing-small);
}

.task-description {
  color: var(--color-secondary);
  margin: var(--spacing-small) 0;
  font-size: var(--font-size-small);
}

.task-completed {
  background-color: var(--color-gray-vlight);
  border-color: var(--color--gray-light);
  opacity: 0.85;
}

.task-completed .task-header h3 {
  color: var(--color-gray-dark);
}

.task-completed-info {
  font-size: var(--font-size-small);
  color: var(--color-gray-dark);
  margin-top: var(--spacing-small);
}

.task-completed-info p {
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
  margin: 0;
}

.completed-time {
  font-style: italic;
  margin-left: var(--spacing-small);
}

.task-footer {
  margin-top: var(--spacing-medium);
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  gap: var(--spacing-small);
}

.compact-mode .task-footer {
  margin-top: var(--spacing-small);
}

.complete-button {
  background-color: var(--color--gray-white);
  border: 1px solid var(--color-success);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-vsmall);
  font-size: var(--font-size-small);
  padding: var(--spacing-vsmall) var(--spacing-small);
}

.complete-button:hover {
    background-color: var(--color-success);
    color: var(--color-white);
}

.details-button {
  background-color: var(--color--gray-white);
  border: 1px solid var(--color-secondary-light);
  color: var(--color-secondary-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
  font-size: var(--font-size-small);
  padding: var(--spacing-vsmall) var(--spacing-small);
}

.details-button:hover {
  background-color: var(--color-secondary-light);
  color: var(--color-white);
}
</style>
