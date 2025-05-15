<template>
  <Transition name="fade">
    <div v-if="show" class="loading-overlay">
      <div class="loading-container">
        <div class="spinner"></div>
        <p v-if="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'AppLoading',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Loading...'
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: var(--spacing-large);
  border-radius: var(--border-radius-medium);
  box-shadow: var(--shadow-medium);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--color-gray-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: var(--spacing-medium);
  color: var(--color-secondary);
  font-weight: var(--font-weight-medium);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
