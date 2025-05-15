<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>
          <i v-if="icon" class="material-icons modal-icon">{{ icon }}</i>
          {{ title }}
        </h3>
        <button class="close-button" @click="close">
          <i class="material-icons">close</i>
        </button>
      </div>
      
      <div class="modal-content">
        <slot></slot>
        <p v-if="warning" class="warning-text">{{ warning }}</p>
      </div>
      
      <div class="modal-actions">
        <button 
          class="cancel-button" 
          @click="close" 
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button 
          class="confirm-button" 
          :class="{ danger }"
          @click="confirm" 
          :disabled="loading"
        >
          <i v-if="loading" class="material-icons loading-icon">hourglass_empty</i>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Confirm'
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    loadingText: {
      type: String,
      default: 'Processing...'
    },
    loading: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    },
    warning: {
      type: String,
      default: null
    },
    danger: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirm'],
  methods: {
    close() {
      if (!this.loading) {
        this.$emit('update:modelValue', false);
      }
    },
    confirm() {
      if (!this.loading) {
        this.$emit('confirm');
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-container {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-large);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-medium);
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.modal-icon {
  color: var(--color-primary);
}

.close-button {
  background: none;
  border: none;
  padding: var(--spacing-vsmall);
  cursor: pointer;
  color: var(--color-gray-medium);
}

.modal-content {
  margin-bottom: var(--spacing-large);
}

.warning-text {
  color: var(--color-error);
  font-weight: var(--font-weight-semibold);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-small);
}

.cancel-button {
  background-color: var(--color-gray-medium);
}

.confirm-button {
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-vsmall);
}

.confirm-button.danger {
  background-color: var(--color-error);
}

.loading-icon {
  animation: spin 1.5s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
