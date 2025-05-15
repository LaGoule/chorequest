<template>
  <div 
    class="app-input"
    :class="{ 
      'has-error': hasError,
      'is-focused': isFocused
    }"
  >
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    
    <div class="input-wrapper">
      <i v-if="icon" class="material-icons input-icon">{{ icon }}</i>
      
      <input
        v-if="type !== 'textarea'"
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        class="input-field"
        @input="updateValue($event)"
        @focus="isFocused = true"
        @blur="onBlur"
      />
      
      <textarea
        v-else
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        class="input-field textarea"
        :rows="rows"
        @input="updateValue($event)"
        @focus="isFocused = true"
        @blur="onBlur"
      ></textarea>
      
      <i 
        v-if="clearable && modelValue && !disabled" 
        class="material-icons clear-button"
        @click="clearInput"
      >
        close
      </i>
    </div>
    
    <div v-if="hasError" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-else-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'AppInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    inputId: {
      type: String,
      default: () => `input-${Math.random().toString(36).substr(2, 9)}`
    },
    type: {
      type: String,
      default: 'text',
      validator: (value) => ['text', 'number', 'email', 'password', 'textarea', 'tel', 'search'].includes(value)
    },
    placeholder: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    min: {
      type: [Number, String],
      default: undefined
    },
    max: {
      type: [Number, String],
      default: undefined
    },
    maxlength: {
      type: Number,
      default: undefined
    },
    rows: {
      type: Number,
      default: 3
    },
  },
  emits: ['update:modelValue', 'blur'],
  setup(props, { emit }) {
    const isFocused = ref(false);
    
    const hasError = computed(() => !!props.errorMessage);
    
    const updateValue = (event) => {
      const target = event.target;
      emit('update:modelValue', props.type === 'number' ? parseFloat(target.value) : target.value);
    };
    
    const onBlur = (event) => {
      isFocused.value = false;
      emit('blur', event);
    };
    
    const clearInput = () => {
      emit('update:modelValue', props.type === 'number' ? 0 : '');
    };
    
    return {
      isFocused,
      hasError,
      updateValue,
      onBlur,
      clearInput
    };
  }
}
</script>

<style scoped>
.app-input {
  margin-bottom: var(--spacing-medium);
}

.input-label {
  display: block;
  margin-bottom: var(--spacing-vsmall);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.required-indicator {
  color: var(--color-error);
  margin-left: var(--spacing-vsmall);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: var(--spacing-small);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-small);
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.input-field:focus {
  border-color: var(--color-primary);
  outline: none;
}

.has-error .input-field {
  border-color: var(--color-error);
}

.input-icon {
  position: absolute;
  left: var(--spacing-small);
  color: var(--color-gray-dark);
  pointer-events: none;
}

.input-icon + .input-field {
  padding-left: calc(var(--spacing-medium) * 1.5);
}

.clear-button {
  position: absolute;
  right: var(--spacing-small);
  color: var(--color-gray-medium);
  cursor: pointer;
  font-size: var(--font-size-base);
}

.clear-button:hover {
  color: var(--color-gray-dark);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  margin-top: var(--spacing-vsmall);
  font-size: var(--font-size-small);
  color: var(--color-error);
}

.help-text {
  margin-top: var(--spacing-vsmall);
  font-size: var(--font-size-small);
  color: var(--color-gray-dark);
}
</style>
