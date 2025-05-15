/**
 * Validation utility for form fields
 */

export type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export type ValidationSchema = Record<string, ValidationRule[]>;

/**
 * Predefined validation rules
 */
export const rules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value: any) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return true;
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    },
    message
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Let required handle empty case
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),
  
  minLength: (length: number, message = `Must be at least ${length} characters`): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Let required handle empty case
      return value.length >= length;
    },
    message
  }),
  
  maxLength: (length: number, message = `Cannot be longer than ${length} characters`): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Let required handle empty case
      return value.length <= length;
    },
    message
  }),
  
  min: (min: number, message = `Must be at least ${min}`): ValidationRule => ({
    validate: (value: number) => {
      if (value === undefined || value === null) return true;
      return Number(value) >= min;
    },
    message
  }),
  
  max: (max: number, message = `Cannot be more than ${max}`): ValidationRule => ({
    validate: (value: number) => {
      if (value === undefined || value === null) return true;
      return Number(value) <= max;
    },
    message
  }),
  
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Let required handle empty case
      return regex.test(value);
    },
    message
  }),
  
  match: (matchField: string, message = 'Fields do not match'): ValidationRule => ({
    validate: (value: any, allValues: Record<string, any>) => {
      return value === allValues[matchField];
    },
    message
  })
};

/**
 * Validate values against schema
 * @param values - Form values to validate
 * @param schema - Validation schema
 * @returns Validation result
 */
export function validateForm(values: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};
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
 * @param reactiveValues - Reactive form values (ref or reactive)
 * @param schema - Validation schema
 * @returns Object with validate function and computed errors
 */
export function useFormValidation(reactiveValues: any, schema: ValidationSchema) {
  const errors = ref({} as Record<string, string>);
  
  const validate = () => {
    const result = validateForm(unref(reactiveValues), schema);
    errors.value = result.errors;
    return result.valid;
  };
  
  // Validate field individually
  const validateField = (field: string) => {
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
      const { [field]: _, ...rest } = errors.value;
      errors.value = rest;
    }
    
    return true;
  };
  
  return {
    errors,
    validate,
    validateField
  };
}
