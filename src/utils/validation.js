/**
 * Validation utility for form fields
 */

/**
 * @typedef {Object} ValidationRule
 * @property {Function} validate - Function that validates value
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {Object} errors - Object with field-error mappings
 */

/**
 * Predefined validation rules
 */
export const rules = {
  /**
   * Required field validation
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  required(message = 'This field is required') {
    return {
      validate: (value) => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return true;
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
      },
      message
    };
  },
  
  /**
   * Email format validation
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  email(message = 'Please enter a valid email address') {
    return {
      validate: (value) => {
        if (!value) return true; // Let required handle empty case
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message
    };
  },
  
  /**
   * Minimum length validation
   * @param {number} length - Minimum length
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  minLength(length, message = `Must be at least ${length} characters`) {
    return {
      validate: (value) => {
        if (!value) return true; // Let required handle empty case
        return value.length >= length;
      },
      message
    };
  },
  
  /**
   * Maximum length validation
   * @param {number} length - Maximum length
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  maxLength(length, message = `Cannot be longer than ${length} characters`) {
    return {
      validate: (value) => {
        if (!value) return true; // Let required handle empty case
        return value.length <= length;
      },
      message
    };
  },
  
  /**
   * Minimum value validation
   * @param {number} min - Minimum value
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  min(min, message = `Must be at least ${min}`) {
    return {
      validate: (value) => {
        if (value === undefined || value === null) return true;
        return Number(value) >= min;
      },
      message
    };
  },
  
  /**
   * Maximum value validation
   * @param {number} max - Maximum value
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  max(max, message = `Cannot be more than ${max}`) {
    return {
      validate: (value) => {
        if (value === undefined || value === null) return true;
        return Number(value) <= max;
      },
      message
    };
  },
  
  /**
   * Pattern validation
   * @param {RegExp} regex - Regular expression pattern
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  pattern(regex, message = 'Invalid format') {
    return {
      validate: (value) => {
        if (!value) return true; // Let required handle empty case
        return regex.test(value);
      },
      message
    };
  },
  
  /**
   * Field match validation
   * @param {string} matchField - Field to match against
   * @param {string} [message] - Custom error message
   * @returns {ValidationRule} Validation rule
   */
  match(matchField, message = 'Fields do not match') {
    return {
      validate: (value, allValues) => {
        return value === allValues[matchField];
      },
      message
    };
  }
};

/**
 * Validate values against schema
 * @param {Object} values - Form values to validate
 * @param {Object} schema - Validation schema
 * @returns {ValidationResult} Validation result
 */
export function validateForm(values, schema) {
  const errors = {};
  let valid = true;
  
  Object.keys(schema).forEach(field => {
    const fieldRules = schema[field];
    const value = values[field];
    
    for (const rule of fieldRules) {
      const isValid = rule.validate(value, values);
      if (!isValid) {
        errors[field] = rule.message;
        valid = false;
        break; // Stop at first error for this field
      }
    }
  });
  
  return { valid, errors };
}

/**
 * Create a reactive validation for a form
 * @param {Object} reactiveValues - Reactive form values (ref or reactive)
 * @param {Object} schema - Validation schema
 * @returns {Object} Object with validate function and computed errors
 */
export function useFormValidation(reactiveValues, schema) {
  const { ref, computed, unref } = require('vue');
  const errors = ref({});
  
  const validate = () => {
    const result = validateForm(unref(reactiveValues), schema);
    errors.value = result.errors;
    return result.valid;
  };
  
  // Validate field individually
  const validateField = (field) => {
    const fieldRules = schema[field];
    if (!fieldRules) return true;
    
    const value = unref(reactiveValues)[field];
    
    for (const rule of fieldRules) {
      const isValid = rule.validate(value, unref(reactiveValues));
      if (!isValid) {
        errors.value = { ...errors.value, [field]: rule.message };
        return false;
      }
    }
    
    // Field is valid, remove error if exists
    if (errors.value[field]) {
      const newErrors = { ...errors.value };
      delete newErrors[field];
      errors.value = newErrors;
    }
    
    return true;
  };
  
  return {
    errors,
    validate,
    validateField
  };
}
