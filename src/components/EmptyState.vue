<template>
  <div class="empty-state">
    <i v-if="icon" class="material-icons empty-icon">{{ icon }}</i>
    <slot>No data available</slot>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>
.empty-state {
  padding: var(--spacing-large);
  background-color: var(--color-gray-vlight);
  border-radius: var(--border-radius-medium);
  color: var(--color-gray-dark);
  text-align: center);
}

.empty-icon {
  font-size: 2rem;
  color: var(--color-gray-medium);
  display: block;
  margin-bottom: var(--spacing-medium);
}
</style>
