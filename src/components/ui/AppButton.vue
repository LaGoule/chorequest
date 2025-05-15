<template>
  <button
    :class="[
      'app-button',
      `variant-${variant}`,
      `size-${size}`,
      { 'is-loading': loading }
    ]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-indicator">
      <i class="material-icons rotating">sync</i>
    </span>
    <i v-if="icon && !loading" class="material-icons button-icon">{{ icon }}</i>
    <span class="button-content">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    label: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => 
        ['primary', 'secondary', 'success', 'danger', 'outline', 'text'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => 
        ['small', 'medium', 'large'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'button',
      validator: (value) =>
        ['button', 'submit', 'reset'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius-medium);
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  gap: var(--spacing-vsmall);
}

.app-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button sizes */
.app-button.size-small {
  padding: var(--spacing-vsmall) var(--spacing-small);
  font-size: var(--font-size-small);
}

.app-button.size-medium {
  padding: var(--spacing-small) var(--spacing-medium);
  font-size: var(--font-size-base);
}

.app-button.size-large {
  padding: var(--spacing-medium) var(--spacing-large);
  font-size: var(--font-size-large);
}

/* Button variants */
.app-button.variant-primary {
  background-color: var(--color-primary);
  color: white;
}

.app-button.variant-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.app-button.variant-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.app-button.variant-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-dark);
}

.app-button.variant-success {
  background-color: var(--color-success);
  color: white;
}

.app-button.variant-success:hover:not(:disabled) {
  background-color: #3c8c40;
}

.app-button.variant-danger {
  background-color: var(--color-error);
  color: white;
}

.app-button.variant-danger:hover:not(:disabled) {
  background-color: #d32f2f;
}

.app-button.variant-outline {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.app-button.variant-outline:hover:not(:disabled) {
  background-color: rgba(0, 123, 255, 0.1);
}

.app-button.variant-text {
  background-color: transparent;
  color: var(--color-primary);
  padding-left: var(--spacing-small);
  padding-right: var(--spacing-small);
}

.app-button.variant-text:hover:not(:disabled) {
  background-color: rgba(0, 123, 255, 0.1);
}

/* Loading state */
.app-button.is-loading {
  color: transparent;
}

.app-button .loading-indicator {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.app-button .rotating {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
