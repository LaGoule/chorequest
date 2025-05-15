<template>
  <div class="household-card">
    <div class="household-header">
      <h2>{{ name }}</h2>
      <div class="points-badge">{{ points || 0 }} points</div>
    </div>
    <p v-if="showMotivation" class="household-subtext">Complete tasks to earn points and badges!</p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'HouseholdCard',
  props: {
    name: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    showMotivation: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.household-card {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-large);
  box-shadow: var(--shadow-small);
  margin-bottom: var(--spacing-large);
}

.household-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.household-header h2 {
  margin: 0;
  color: var(--color-secondary);
}

.points-badge {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-small) var(--spacing-medium);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-weight-semibold);
}

.household-subtext {
  margin-top: var(--spacing-small);
  color: var(--color-gray-dark);
}
</style>
