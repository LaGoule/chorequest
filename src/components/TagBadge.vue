<template>
  <span 
    class="tag-badge"
    :class="{
      'size-small': size === 'small',
      'size-medium': size === 'medium',
      'size-large': size === 'large',
      [colorClass]: true
    }"
  >
    <i v-if="icon" class="material-icons" :class="size">{{ icon }}</i>
    <TaskIcon 
      v-else-if="category" 
      :category="category" 
      :size="size" 
      :with-background="false"
    />
    <span class="tag-text">{{ text }}</span>
  </span>
</template>

<script>
import TaskIcon from './TaskIcon.vue';

export default {
  name: 'TagBadge',
  components: {
    TaskIcon
  },
  props: {
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary', 'success', 'warning', 'error'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  },
  computed: {
    colorClass() {
      return `color-${this.color}`;
    }
  }
}
</script>

<style scoped>
.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-vsmall);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-vsmall) var(--spacing-small);
  max-width: 100%;
}

.tag-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.size-small {
  font-size: var(--font-size-vsmall);
  padding: 2px var(--spacing-small);
}

.size-medium {
  font-size: var(--font-size-small);
}

.size-large {
  font-size: var(--font-size-base);
  padding: var(--spacing-small) var(--spacing-medium);
}

/* Couleurs */
.color-default {
  background-color: var(--color-gray-vlight);
  color: var(--color-secondary);
}

.color-primary {
  background-color: var(--color-primary-light);
  color: white;
}

.color-secondary {
  background-color: var(--color-secondary-light);
  color: white;
}

.color-success {
  background-color: rgba(76, 175, 80, 0.2);
  color: var(--color-success);
}

.color-warning {
  background-color: rgba(255, 193, 7, 0.2);
  color: #f57c00;
}

.color-error {
  background-color: rgba(244, 67, 54, 0.2);
  color: var(--color-error);
}
</style>
