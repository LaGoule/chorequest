<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon">
      <i class="material-icons">{{ icon }}</i>
    </div>
    <div class="empty-content">
      <h3 v-if="title" class="empty-title">{{ title }}</h3>
      <slot>
        <p>No data available</p>
      </slot>
    </div>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: 'sentiment_dissatisfied'
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xlarge) var(--spacing-medium);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-gray-light);
  margin-top: var(--spacing-medium);
}

.empty-icon i {
  font-size: 56px;
}

.empty-title {
  color: var(--color-secondary);
  margin-top: 0;
  margin-bottom: var(--spacing-small);
}

.empty-content {
  max-width: 400px;
  color: var(--color-gray-dark);
}

.empty-action {
  margin-top: var(--spacing-large);
}
</style>
