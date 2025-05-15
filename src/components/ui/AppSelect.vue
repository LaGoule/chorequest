<template>
  <div 
    class="app-select"
    :class="{ 'has-error': errorMessage }"
  >
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    
    <div class="select-wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="select-field"
        @input="updateValue($event)"
        @change="$emit('change', $event)"
        @blur="$emit('blur', $event)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option 
          v-for="option in options" 
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      
      <i class="material-icons select-icon">arrow_drop_down</i>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-else-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppSelect',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    selectId: {
      type: String,
      default: () => `select-${Math.random().toString(36).substr(2, 9)}`
    },
    placeholder: {
      type: String,
      default: null
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
    optionLabel: {
      type: String,
      default: null // If options are objects, this is the property to use as label
    },
    optionValue: {
      type: String,
      default: null // If options are objects, this is the property to use as value
    }
  },
  emits: ['update:modelValue', 'change', 'blur'],
  setup(props, { emit }) {
    const getOptionLabel = (option) => {
      if (props.optionLabel && typeof option === 'object' && option !== null) {
        return option[props.optionLabel];
      }
      return option;
    };
    
    const getOptionValue = (option) => {
      if (props.optionValue && typeof option === 'object' && option !== null) {
        return option[props.optionValue];
      }
      return option;
    };
    
    const updateValue = (event) => {
      emit('update:modelValue', event.target.value);
    };
    
    return {
      getOptionLabel,
      getOptionValue,
      updateValue
    };
  }
}
</script>

<style scoped>
.app-select {
  margin-bottom: var(--spacing-medium);
}

.select-label {
  display: block;
  margin-bottom: var(--spacing-vsmall);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.required-indicator {
  color: var(--color-error);
  margin-left: var(--spacing-vsmall);
}

.select-wrapper {
  position: relative;
  display: block;
}

.select-field {
  width: 100%;
  appearance: none;
  padding: var(--spacing-small) var(--spacing-medium);
  padding-right: calc(var(--spacing-medium) * 2);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-small);
  background-color: white;
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
  cursor: pointer;
}

.select-field:focus {
  border-color: var(--color-primary);
  outline: none;
}

.select-icon {
  position: absolute;
  right: var(--spacing-small);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-dark);
  pointer-events: none;
}

.has-error .select-field {
  border-color: var(--color-error);
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
