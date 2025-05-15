<template>
  <div class="stat-card">
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ProfileStat',
  props: {
    value: {
      type: [Number, String],
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.stat-card {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  box-shadow: var(--shadow-small);
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-small);
}

.stat-label {
  color: var(--color-gray-dark);
  font-weight: var(--font-weight-medium);
}
</style>
