<template>
  <form @submit.prevent="handleSubmit" novalidate class="app-form">
    <slot></slot>
    
    <div v-if="$slots.actions" class="form-actions">
      <slot name="actions"></slot>
    </div>
    <div v-else-if="showDefaultActions" class="form-actions">
      <button 
        v-if="showCancelButton" 
        type="button" 
        class="btn btn-outline" 
        @click="$emit('cancel')"
      >
        {{ cancelText }}
      </button>
      
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="loading || disabled"
      >
        <i v-if="loading" class="material-icons rotating">sync</i>
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'AppForm',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showDefaultActions: {
      type: Boolean,
      default: true
    },
    showCancelButton: {
      type: Boolean,
      default: true
    },
    submitText: {
      type: String,
      default: 'Submit'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const handleSubmit = (event) => {
      emit('submit', event);
    };
    
    return {
      handleSubmit
    };
  }
}
</script>

<style scoped>
.app-form {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-medium);
  margin-top: var(--spacing-large);
}

.btn {
  padding: var(--spacing-small) var(--spacing-large);
  border-radius: var(--border-radius-medium);
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-small);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: rgba(0, 123, 255, 0.1);
}

.rotating {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
