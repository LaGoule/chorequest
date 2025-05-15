<template>
  <div class="tab-filters">
    <button 
      v-for="tab in tabs" 
      :key="tab.value"
      :class="{ active: modelValue === tab.value }" 
      @click="$emit('update:modelValue', tab.value)"
    >
      <i v-if="tab.icon" class="material-icons tab-icon">{{ tab.icon }}</i>
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'TabFilter',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true,
      // Chaque tab doit avoir { label: 'Label', value: 'value', icon?: 'icon_name' }
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.tab-filters {
  display: flex;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-large);
  justify-content: center;
}

.tab-filters button {
  padding: var(--spacing-small) var(--spacing-medium);
  background-color: var(--color-gray-vlight);
  color: var(--color-gray-dark);
  border: 1px solid var(--color--gray-light);
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
  transition: all var(--transition-fast);
}

.tab-filters button.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.tab-icon {
  font-size: 1.1rem;
}
</style>
