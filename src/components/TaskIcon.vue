<template>
  <span 
    class="task-icon"
    :class="{
      'size-small': size === 'small',
      'size-medium': size === 'medium',
      'size-large': size === 'large',
      'with-background': withBackground
    }"
  >
    <i class="material-icons" :class="size">{{ icon || getCategoryIcon(category) }}</i>
  </span>
</template>

<script>
import { CATEGORY_ICONS } from '../utils/constants';

export default {
  name: 'TaskIcon',
  props: {
    icon: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'cleaning',
      validator: (value) => [
        'cleaning', 'cooking', 'maintenance', 'outdoor', 
        'shopping', 'laundry', 'dishes', 'pets', 'childcare'
      ].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    withBackground: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const getCategoryIcon = (category) => {
      return CATEGORY_ICONS[category] || 'task_alt';
    };
    
    return {
      getCategoryIcon
    };
  }
}
</script>

<style scoped>
.task-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.with-background {
  background-color: var(--color-primary-light);
  color: white;
  border-radius: var(--border-radius-full);
}

.size-small {
  width: 24px;
  height: 24px;
}

.size-medium {
  width: 28px;
  height: 28px;
}

.size-large {
  width: 36px;
  height: 36px;
}

.material-icons.small {
  font-size: 1rem;
}

.material-icons.medium {
  font-size: 1.25rem;
}

.material-icons.large {
  font-size: 1.5rem;
}
</style>
