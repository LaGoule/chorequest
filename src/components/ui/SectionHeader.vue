<template>
  <div class="section-header">
    <i v-if="icon" class="material-icons section-icon">{{ icon }}</i>
    <h2 class="section-title">{{ title }}</h2>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-medium);
  padding-bottom: var(--spacing-small);
  border-bottom: 1px solid var(--color-gray-light);
}

.section-icon {
  margin-right: var(--spacing-small);
  color: var(--color-primary);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
}
</style>
