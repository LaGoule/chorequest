<template>
  <div class="tab-filter">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tab-button"
      :class="{ active: modelValue === tab.value }"
      @click="updateValue(tab.value)"
      type="button"
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
      validator: (tabs) => {
        return tabs.every(tab => 'value' in tab && 'label' in tab);
      }
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const updateValue = (value) => {
      emit('update:modelValue', value);
    };
    
    return {
      updateValue
    };
  }
}
</script>

<style scoped>
.tab-filter {
  display: flex;
  justify-content: center;
  border-radius: var(--border-radius-medium);
  background-color: var(--color-gray-vlight);
  padding: var(--spacing-vsmall);
  gap: var(--spacing-vsmall);
  flex-wrap: wrap;
}

.tab-button {
  display: flex;
  align-items: center;
  padding: var(--spacing-small) var(--spacing-medium);
  border: none;
  background-color: transparent;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  white-space: nowrap;
  color: var(--color-gray-dark);
}

.tab-button:hover {
  background-color: var(--color-gray-light);
}

.tab-button.active {
  background-color: white;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-small);
}

.tab-icon {
  margin-right: var(--spacing-vsmall);
  font-size: 1rem;
}

@media (max-width: 600px) {
  .tab-filter {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: var(--spacing-vsmall) 0;
    scrollbar-width: none; /* Firefox */
  }
  
  .tab-filter::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  .tab-button {
    padding: var(--spacing-vsmall) var(--spacing-small);
    font-size: var(--font-size-small);
  }
}
</style>
