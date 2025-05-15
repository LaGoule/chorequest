import { ref, reactive } from 'vue';
import { validateForm } from '../utils/validation';

/**
 * Form handling composable
 * @param {Object} options - Form options
 * @param {Object} options.initialValues - Initial form values
 * @param {Object} options.validationSchema - Form validation schema
 * @param {Function} options.onSubmit - Submit handler function
 * @param {Function} [options.onError] - Error handler function
 * @returns {Object} Form helpers
 */
export function useForm({ initialValues, validationSchema, onSubmit, onError }) {
  const values = reactive({ ...initialValues });
  const errors = reactive({});
  const touched = reactive({});
  const isSubmitting = ref(false);
  const isValid = ref(true);
  
  // Validate the entire form
  const validateAll = () => {
    const result = validateForm(values, validationSchema || {});
    Object.assign(errors, result.errors);
    isValid.value = result.valid;
    return result.valid;
  };
  
  // Validate a specific field
  const validateField = (field) => {
    if (!validationSchema || !validationSchema[field]) {
      return true;
    }
    
    let isFieldValid = true;
    const fieldRules = validationSchema[field];
    
    for (const rule of fieldRules) {
      const result = rule.validate(values[field], values);
      if (!result) {
        errors[field] = rule.message;
        isFieldValid = false;
        break;
      } else {
        delete errors[field];
      }
    }
    
    return isFieldValid;
  };
  
  // Handle field change
  const handleChange = (field, value) => {
    values[field] = value;
    if (touched[field]) {
      validateField(field);
    }
  };
  
  // Handle field blur
  const handleBlur = (field) => {
    touched[field] = true;
    validateField(field);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Mark all fields as touched
    Object.keys(values).forEach(key => {
      touched[key] = true;
    });
    
    // Validate all fields
    const valid = validateAll();
    
    if (!valid) {
      if (onError) {
        onError(errors);
      }
      return;
    }
    
    isSubmitting.value = true;
    
    try {
      await onSubmit(values);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error('Form submission error:', error);
      }
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Reset the form
  const resetForm = () => {
    Object.keys(values).forEach(key => {
      values[key] = initialValues[key];
    });
    Object.keys(errors).forEach(key => {
      delete errors[key];
    });
    Object.keys(touched).forEach(key => {
      touched[key] = false;
    });
    isValid.value = true;
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    validateField,
    validateAll,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  };
}
