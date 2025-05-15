<template>
  <div class="task-category-group">
    <div class="category-header" @click="toggleExpand">
      <div class="category-info">
        <span class="category-icon"><i :class="getCategoryIcon(category)"></i></span>
        <h3>{{ formatCategory(category) }}</h3>
        <span class="task-count">{{ tasks.length }} tasks</span>
      </div>
      <button class="expand-button">
        <i :class="expanded ? actionIcons.expand : actionIcons.collapse"></i>
      </button>
    </div>
    
    <div v-if="expanded" class="category-tasks">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { getCategoryIcon, actionIcons } from '../utils/iconUtils';

export default {
  name: 'TaskCategoryGroup',
  props: {
    category: {
      type: String,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    },
    expandedByDefault: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      expanded: this.expandedByDefault
    };
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
    formatCategory(category) {
      if (!category) return '';
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  },
  setup() {
    return {
      getCategoryIcon,
      actionIcons
    };
  }
}
</script>

<style scoped>
.task-category-group {
  margin-bottom: var(--spacing-medium);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-medium);
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-medium);
  background-color: var(--color-gray-vlight);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.category-header:hover {
  background-color: var(--color-primary-light);
  color: white;
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
}

.category-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.category-icon i {
  font-size: 1.2rem;
}

.category-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.task-count {
  font-size: var(--font-size-small);
  background-color: white;
  border-radius: var(--border-radius-full);
  padding: 2px 8px;
  color: var(--color-secondary);
}

.expand-button {
  background: none;
  border: none;
  color: inherit;
  padding: 0;
  font-size: 1rem;
}

.expand-button i {
  font-size: 1rem;
}

.category-tasks {
  padding: var(--spacing-medium);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-medium);
}
</style>
