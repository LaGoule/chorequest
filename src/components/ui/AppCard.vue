<template>
  <div 
    class="app-card" 
    :class="{ 
      clickable: clickable,
      [`elevation-${elevation}`]: true
    }"
  >
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-content">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    clickable: {
      type: Boolean,
      default: false
    },
    elevation: {
      type: Number,
      default: 1,
      validator: (value) => [0, 1, 2, 3].includes(value)
    }
  }
}
</script>

<style scoped>
.app-card {
  background-color: white;
  border-radius: var(--border-radius-medium);
  overflow: hidden;
}

.elevation-0 {
  border: 1px solid var(--color-gray-light);
  box-shadow: none;
}

.elevation-1 {
  box-shadow: var(--shadow-small);
}

.elevation-2 {
  box-shadow: var(--shadow-medium);
}

.elevation-3 {
  box-shadow: var(--shadow-large);
}

.clickable {
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.card-header {
  padding: var(--spacing-medium);
  border-bottom: 1px solid var(--color-gray-light);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-large);
  color: var(--color-secondary);
}

.card-content {
  padding: var(--spacing-medium);
}

.card-footer {
  padding: var(--spacing-medium);
  border-top: 1px solid var(--color-gray-light);
  background-color: var(--color-gray-vlight);
}
</style>
