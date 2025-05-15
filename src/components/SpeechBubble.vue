<template>
  <div 
    class="speech-bubble" 
    :class="{
      'left': direction === 'left',
      'right': direction === 'right',
      'top': direction === 'top',
      'bottom': direction === 'bottom',
      [`type-${type}`]: true
    }"
  >
    <div class="bubble-content">
      <div v-if="title" class="bubble-title">
        <i v-if="icon" class="material-icons bubble-icon">{{ icon }}</i>
        {{ title }}
      </div>
      <div class="bubble-message">
        <slot>{{ message }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpeechBubble',
  props: {
    message: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    direction: {
      type: String,
      default: 'bottom',
      validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
    },
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'info', 'success', 'warning', 'error', 'motivational'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.speech-bubble {
  position: relative;
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  box-shadow: var(--shadow-small);
  margin: var(--spacing-medium) 0;
  max-width: 100%;
}

/* Direction-specific styling */
.speech-bubble.left::before {
  content: "";
  position: absolute;
  top: 50%;
  left: -10px;
  margin-top: -10px;
  border-width: 10px 10px 10px 0;
  border-style: solid;
  border-color: transparent white transparent transparent;
}

.speech-bubble.right::before {
  content: "";
  position: absolute;
  top: 50%;
  right: -10px;
  margin-top: -10px;
  border-width: 10px 0 10px 10px;
  border-style: solid;
  border-color: transparent transparent transparent white;
}

.speech-bubble.top::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  margin-left: -10px;
  border-width: 0 10px 10px 10px;
  border-style: solid;
  border-color: transparent transparent white transparent;
}

.speech-bubble.bottom::before {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  margin-left: -10px;
  border-width: 10px 10px 0 10px;
  border-style: solid;
  border-color: white transparent transparent transparent;
}

/* Type-specific styling */
.speech-bubble.type-default {
  background-color: white;
  border: 1px solid var(--color-gray-light);
}

.speech-bubble.type-info {
  background-color: var(--color-gray-vlight);
  border: 1px solid var(--color-primary);
}

.speech-bubble.type-info::before {
  border-color: transparent var(--color-gray-vlight) transparent transparent;
}

.speech-bubble.type-info.right::before {
  border-color: transparent transparent transparent var(--color-gray-vlight);
}

.speech-bubble.type-info.top::before {
  border-color: transparent transparent var(--color-gray-vlight) transparent;
}

.speech-bubble.type-info.bottom::before {
  border-color: var(--color-gray-vlight) transparent transparent transparent;
}

.speech-bubble.type-success {
  background-color: #e3f2fd;
  border: 1px solid var(--color-success);
}

.speech-bubble.type-success::before {
  border-color: transparent #e3f2fd transparent transparent;
}

.speech-bubble.type-success.right::before {
  border-color: transparent transparent transparent #e3f2fd;
}

.speech-bubble.type-success.top::before {
  border-color: transparent transparent #e3f2fd transparent;
}

.speech-bubble.type-success.bottom::before {
  border-color: #e3f2fd transparent transparent transparent;
}

.speech-bubble.type-warning {
  background-color: #fff8e1;
  border: 1px solid #ffc107;
}

.speech-bubble.type-warning::before {
  border-color: transparent #fff8e1 transparent transparent;
}

.speech-bubble.type-warning.right::before {
  border-color: transparent transparent transparent #fff8e1;
}

.speech-bubble.type-warning.top::before {
  border-color: transparent transparent #fff8e1 transparent;
}

.speech-bubble.type-warning.bottom::before {
  border-color: #fff8e1 transparent transparent transparent;
}

.speech-bubble.type-error {
  background-color: #ffebee;
  border: 1px solid var(--color-error);
}

.speech-bubble.type-error::before {
  border-color: transparent #ffebee transparent transparent;
}

.speech-bubble.type-error.right::before {
  border-color: transparent transparent transparent #ffebee;
}

.speech-bubble.type-error.top::before {
  border-color: transparent transparent #ffebee transparent;
}

.speech-bubble.type-error.bottom::before {
  border-color: #ffebee transparent transparent transparent;
}

.speech-bubble.type-motivational {
  background-color: #e8f5e9;
  border: 1px solid #4caf50;
  font-style: italic;
}

.speech-bubble.type-motivational::before {
  border-color: transparent #e8f5e9 transparent transparent;
}

.speech-bubble.type-motivational.right::before {
  border-color: transparent transparent transparent #e8f5e9;
}

.speech-bubble.type-motivational.top::before {
  border-color: transparent transparent #e8f5e9 transparent;
}

.speech-bubble.type-motivational.bottom::before {
  border-color: #e8f5e9 transparent transparent transparent;
}

.bubble-content {
  position: relative;
}

.bubble-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-small);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.bubble-icon {
  font-size: 1.2rem;
}

.bubble-message {
  font-size: var(--font-size-small);
}
</style>
