<template>
  <AppCard title="Add New Task">
    <AppForm 
      :loading="isSubmitting" 
      :disabled="!isValid"
      @submit="handleSubmit"
      submitText="Add Task"
    >
      <AppInput 
        v-model="values.name"
        label="Task Name"
        required
        :error-message="errors.name"
        @blur="() => handleBlur('name')"
      />
      
      <AppInput 
        v-model="values.description"
        label="Description"
        type="textarea"
        help-text="Describe what needs to be done in detail."
        :error-message="errors.description"
        @blur="() => handleBlur('description')"
      />
      
      <AppSelect
        v-model="values.category"
        label="Category"
        required
        :options="categoryOptions"
        :error-message="errors.category"
        @blur="() => handleBlur('category')"
      />
      
      <div class="form-row">
        <AppInput 
          v-model.number="values.pointsValue"
          label="Points Value"
          type="number"
          required
          min="1"
          max="10"
          :error-message="errors.pointsValue"
          @blur="() => handleBlur('pointsValue')"
        />
        
        <div class="icon-field">
          <label class="field-label">
            Task Icon
            <span class="optional-label">(optional)</span>
          </label>
          <IconSelector 
            v-model="values.icon" 
            :category="values.category" 
          />
        </div>
      </div>
    </AppForm>
  </AppCard>
</template>

<script>
import { watch } from 'vue';
import AppCard from './ui/AppCard.vue';
import AppForm from './ui/AppForm.vue';
import AppInput from './ui/AppInput.vue';
import AppSelect from './ui/AppSelect.vue';
import IconSelector from './IconSelector.vue';
import { useForm } from '../composables/useForm';
import { useError } from '../composables/useError';
import { taskService } from '../services/taskService';
import { rules } from '../utils/validation';

export default {
  name: 'AddTaskFormStandardized',
  components: {
    AppCard,
    AppForm,
    AppInput,
    AppSelect,
    IconSelector
  },
  props: {
    householdId: {
      type: String,
      required: true
    }
  },
  emits: ['task-added'],
  setup(props, { emit }) {
    const { executeWithError, isLoading } = useError();
    
    const initialValues = {
      name: '',
      description: '',
      category: 'cleaning',
      pointsValue: 5,
      icon: ''
    };
    
    const validationSchema = {
      name: [
        rules.required('Please enter a task name'),
        rules.maxLength(50, 'Task name cannot exceed 50 characters')
      ],
      description: [
        rules.maxLength(500, 'Description cannot exceed 500 characters')
      ],
      category: [
        rules.required('Please select a category')
      ],
      pointsValue: [
        rules.required('Please set points value'),
        rules.min(1, 'Minimum value is 1'),
        rules.max(10, 'Maximum value is 10')
      ]
    };
    
    const onSubmit = async (formData) => {
      await executeWithError(
        async () => {
          const newTask = await taskService.addTask({
            ...formData,
            householdId: props.householdId
          });
          
          emit('task-added', newTask);
          resetForm();
        }
      );
    };
    
    const {
      values,
      errors,
      touched,
      isSubmitting,
      isValid,
      handleBlur,
      handleSubmit,
      resetForm
    } = useForm({
      initialValues,
      validationSchema,
      onSubmit
    });
    
    // Options for the category select
    const categoryOptions = [
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'cooking', label: 'Cooking' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'laundry', label: 'Laundry' },
      { value: 'dishes', label: 'Dishes' },
      { value: 'pets', label: 'Pets' },
      { value: 'childcare', label: 'Childcare' }
    ];
    
    // Watch for changes in loading state
    watch(() => isLoading.value, (loading) => {
      if (loading) {
        isSubmitting.value = true;
      } else {
        isSubmitting.value = false;
      }
    });
    
    return {
      values,
      errors,
      touched,
      isSubmitting,
      isValid,
      handleBlur,
      handleSubmit,
      resetForm,
      categoryOptions
    };
  }
}
</script>

<style scoped>
.form-row {
  display: flex;
  gap: var(--spacing-medium);
}

.form-row > * {
  flex: 1;
}

.icon-field {
  margin-bottom: var(--spacing-medium);
}

.field-label {
  display: block;
  margin-bottom: var(--spacing-vsmall);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}

.optional-label {
  font-weight: var(--font-weight-normal);
  color: var(--color-gray-dark);
  font-size: var(--font-size-small);
}
</style>
