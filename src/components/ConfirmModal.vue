<template>
  <AppModal
    v-model="isOpen"
    :title="title"
    :icon="icon"
    :size="size"
    :closable="closable"
    @close="$emit('cancel')"
  >
    <div class="confirm-content">
      <div v-if="warning" class="warning-message">
        <i class="material-icons">warning</i>
        {{ warning }}
      </div>
      
      <slot>
        <p>Are you sure you want to continue?</p>
      </slot>
    </div>
    
    <template v-slot:footer>
      <AppButton
        variant="outline"
        :label="cancelText"
        @click="$emit('cancel')"
      />
      
      <AppButton
        :variant="danger ? 'danger' : 'primary'"
        :icon="confirmIcon"
        :label="loading ? loadingText : confirmText"
        :loading="loading"
        :disabled="loading"
        @click="$emit('confirm')"
      />
    </template>
  </AppModal>
</template>

<script>
import { computed } from 'vue';
import AppModal from './ui/AppModal.vue';
import AppButton from './ui/AppButton.vue';

export default {
  name: 'ConfirmModal',
  components: {
    AppModal,
    AppButton
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Confirm'
    },
    icon: {
      type: String,
      default: 'help_outline'
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Processing...'
    },
    size: {
      type: String,
      default: 'small'
    },
    closable: {
      type: Boolean,
      default: true
    },
    warning: {
      type: String,
      default: ''
    },
    danger: {
      type: Boolean,
      default: false
    },
    confirmIcon: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  setup(props, { emit }) {
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    return {
      isOpen
    };
  }
}
</script>

<style scoped>
.confirm-content {
  margin-bottom: var(--spacing-medium);
}

.warning-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  background-color: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #ff9800;
  padding: var(--spacing-small) var(--spacing-medium);
  margin-bottom: var(--spacing-medium);
  color: #e65100;
}

.warning-message i {
  color: #ff9800;
}
</style>
