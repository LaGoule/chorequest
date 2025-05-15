<template>
  <AppForm
    @submit="submitForm"
    :loading="isSubmitting"
    :disabled="!isValidForm"
    submitText="Add Task"
  >
    <AppInput 
      v-model="formData.name"
      label="Task Name"
      :error-message="errors.name"
      required
      @blur="validateField('name')"
    />
    
    <AppInput 
      v-model="formData.description"
      label="Description"
      type="textarea"
      help-text="Describe the task in detail."
      :error-message="errors.description"
      @blur="validateField('description')"
    />
    
    <AppSelect
      v-model="formData.category"
      label="Category"
      required
      :options="categoryOptions"
      :error-message="errors.category"
      @blur="validateField('category')"
    />
    
    <AppInput 
      v-model.number="formData.pointsValue"
      label="Points Value"
      type="number"
      min="1"
      max="10"
      required
      :error-message="errors.pointsValue"
      @blur="validateField('pointsValue')"
    />
    
    <div class="form-group">
      <label for="taskIcon">Task Icon (optional)</label>
      <IconSelector 
        v-model="formData.icon" 
        :category="formData.category" 
        input-id="new-task-icon" 
      />
    </div>
  </AppForm>
</template>

<script>
import { ref, computed } from 'vue';
import AppInput from './ui/AppInput.vue';
import AppSelect from './ui/AppSelect.vue';
import AppForm from './ui/AppForm.vue';
import IconSelector from './IconSelector.vue';
import { rules } from '../utils/validation';
import { useForm } from '../composables/useForm';
import { taskService } from '../services/taskService';
import { notificationService } from '../services/notificationService';

export default {
  name: 'AddTaskForm',
  components: {
    AppInput,
    AppSelect,
    AppForm,
    IconSelector
  },
  props: {
    householdId: {
      type: String,
      required: true
    }
  },
  emits: ['task-added', 'cancel'],
  setup(props, { emit }) {
    const isSubmitting = ref(false);
    
    // Category options for the select
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
    
    // Form validation schema
    const validationSchema = {
      name: [
        rules.required('Please enter a task name'),
        rules.maxLength(50, 'Task name cannot be longer than 50 characters')
      ],
      description: [
        rules.maxLength(500, 'Description cannot be longer than 500 characters')
      ],
      category: [
        rules.required('Please select a category')
      ],
      pointsValue: [
        rules.required('Please enter points value'),
        rules.min(1, 'Points must be at least 1'),
        rules.max(10, 'Points cannot be more than 10')
      ]
    };
    
    // Initialize form with useForm composable
    const { 
      values: formData, 
      errors, 
      validateField,
      validate,
      resetForm 
    } = useForm({
      initialValues: {
        name: '',
        description: '',
        category: 'cleaning',
        pointsValue: 5,
        icon: ''
      },
      validationSchema
    });
    
    const isValidForm = computed(() => {
      return Object.keys(errors).length === 0;
    });
    
    // Submit handler
    const submitForm = async () => {
      if (!validate()) return;
      
      isSubmitting.value = true;
      try {
        const newTask = await taskService.addTask({
          ...formData,
          householdId: props.householdId
        });
        
        notificationService.success('Task created successfully');
        emit('task-added', newTask);
        resetForm();
      } catch (error) {
        notificationService.error('Failed to create task: ' + error.message);
      } finally {
        isSubmitting.value = false;
      }
    };
    
    return {
      formData,
      errors,
      categoryOptions,
      isSubmitting,
      isValidForm,
      validateField,
      submitForm
    };
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: var(--spacing-medium);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-vsmall);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
}
</style>
