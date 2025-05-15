<template>
  <div class="section-header">
    <h2>
      <i v-if="icon" class="material-icons section-icon">{{ icon }}</i>
      {{ title }}
    </h2>
    <div v-if="$slots.actions" class="section-actions">
      <slot name="actions"></slot>
    </div>
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
      default: null
    }
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-medium);
}

.section-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
}

.section-icon {
  margin-right: var(--spacing-small);
  font-size: 1.5rem;
}

.section-actions {
  display: flex;
  gap: var(--spacing-small);
}
</style>
