<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeIfClickOutside">
        <div 
          class="modal-container"
          :class="{
            'size-small': size === 'small',
            'size-medium': size === 'medium',
            'size-large': size === 'large',
            'size-fullscreen': size === 'fullscreen',
          }"
          role="dialog"
          aria-modal="true"
        >
          <div class="modal-header">
            <h3 v-if="title">
              <i v-if="icon" class="material-icons modal-icon">{{ icon }}</i>
              {{ title }}
            </h3>
            <button 
              v-if="closable"
              class="close-button"
              @click="close"
              aria-label="Close"
              type="button"
            >
              <i class="material-icons">close</i>
            </button>
          </div>
          
          <div class="modal-content">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'AppModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'fullscreen'].includes(value)
    },
    closable: {
      type: Boolean,
      default: true
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit }) {
    // Handle closing
    const close = () => {
      emit('update:modelValue', false);
      emit('close');
    };
    
    const closeIfClickOutside = () => {
      if (props.closeOnClickOutside) {
        close();
      }
    };
    
    // Handle escape key
    const handleEscapeKey = (event) => {
      if (props.closeOnEscape && event.key === 'Escape' && props.modelValue) {
        close();
      }
    };
    
    onMounted(() => {
      document.addEventListener('keydown', handleEscapeKey);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleEscapeKey);
    });
    
    // Block scrolling when modal is open
    watch(() => props.modelValue, (isOpen) => {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }, { immediate: true });
    
    return {
      close,
      closeIfClickOutside
    };
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-large);
  display: flex;
  flex-direction: column;
}

.size-small {
  width: 90%;
  max-width: 400px;
}

.size-medium {
  width: 90%;
  max-width: 600px;
}

.size-large {
  width: 90%;
  max-width: 800px;
}

.size-fullscreen {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  border-radius: 0;
  margin: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-medium);
  border-bottom: 1px solid var(--color-gray-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-large);
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.modal-icon {
  color: var(--color-primary);
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-gray-medium);
  padding: var(--spacing-vsmall);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--color-gray-dark);
}

.modal-content {
  padding: var(--spacing-medium);
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: var(--spacing-medium);
  border-top: 1px solid var(--color-gray-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-small);
}

/* Transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
