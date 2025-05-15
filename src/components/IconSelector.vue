<template>
  <div class="icon-selector">
    <div class="icon-selector-grid">
      <div class="icon-option">
        <input 
          type="radio" 
          name="icon" 
          :id="`${inputId}-default`" 
          v-model="selectedIcon" 
          value="" 
        />
        <label :for="`${inputId}-default`" class="icon-button" :class="{ active: !selectedIcon }">
          <i class="material-icons">{{ getCategoryIcon(category) }}</i>
          <span>Default</span>
        </label>
      </div>
      
      <div 
        v-for="icon in commonIcons" 
        :key="icon.value" 
        class="icon-option"
      >
        <input 
          type="radio" 
          name="icon" 
          :id="`${inputId}-${icon.value}`" 
          v-model="selectedIcon" 
          :value="icon.value" 
        />
        <label :for="`${inputId}-${icon.value}`" class="icon-button" :class="{ active: selectedIcon === icon.value }">
          <i class="material-icons">{{ icon.value }}</i>
          <span>{{ icon.label }}</span>
        </label>
      </div>
    </div>
    
    <details class="more-icons">
      <summary>More icons</summary>
      <div class="icon-selector-grid">
        <div 
          v-for="icon in otherIcons" 
          :key="icon.value" 
          class="icon-option"
        >
          <input 
            type="radio" 
            name="icon" 
            :id="`${inputId}-${icon.value}`" 
            v-model="selectedIcon" 
            :value="icon.value" 
          />
          <label :for="`${inputId}-${icon.value}`" class="icon-button" :class="{ active: selectedIcon === icon.value }">
            <i class="material-icons">{{ icon.value }}</i>
            <span>{{ icon.label }}</span>
          </label>
        </div>
      </div>
    </details>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'IconSelector',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'cleaning'
    },
    inputId: {
      type: String,
      default: 'icon-selector'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // Liste d'icônes communes pour les tâches - avec "Mopping" supprimé
    const commonIcons = [
      { value: 'cleaning_services', label: 'Clean' },
      { value: 'wash', label: 'Dishes' },
      { value: 'local_laundry_service', label: 'Laundry' },
      { value: 'restaurant', label: 'Cooking' },
      { value: 'shopping_cart', label: 'Shopping' },
      { value: 'pets', label: 'Pets' },
      { value: 'child_care', label: 'Children' },
      { value: 'grass', label: 'Garden' },
      { value: 'build', label: 'Fix/Repair' }
      // L'élément "Mopping" a été supprimé
    ];
    
    // Liste d'icônes supplémentaires
    const otherIcons = [
      { value: 'bed', label: 'Bed' },
      { value: 'bathtub', label: 'Bathroom' },
      { value: 'kitchen', label: 'Kitchen' },
      { value: 'chair', label: 'Living Room' },
      { value: 'menu_book', label: 'Book/Study' },
      { value: 'commute', label: 'Transport' },
      { value: 'payments', label: 'Payments' },
      { value: 'lightbulb', label: 'Light' },
      { value: 'water_drop', label: 'Water' },
      { value: 'call', label: 'Phone Call' }
    ];
    
    // Fonction pour obtenir l'icône de catégorie
    const getCategoryIcon = (category) => {
      const icons = {
        cleaning: 'cleaning_services',
        cooking: 'restaurant',
        maintenance: 'build',
        outdoor: 'grass',
        shopping: 'shopping_cart',
        laundry: 'local_laundry_service',
        dishes: 'wash', // Mis à jour pour être cohérent
        pets: 'pets',
        childcare: 'child_care'
      };
      
      return icons[category] || 'task_alt';
    };
    
    const selectedIcon = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    return {
      commonIcons,
      otherIcons,
      getCategoryIcon,
      selectedIcon
    };
  }
}
</script>

<style scoped>
.icon-selector {
  margin: var(--spacing-small) 0;
  display: flex;
  flex-direction: column;
  align-items: stretch !important;
}

.icon-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-small);
}

.icon-option {
  position: relative;
}

.icon-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.icon-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-small);
  border: 1px solid var(--color--gray-light);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.icon-button i {
  font-size: 24px;
  margin-bottom: var(--spacing-vsmall);
  color: var(--color-secondary);
}

.icon-button span {
  font-size: 10px;
  color: var(--color-gray-dark);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
}

.icon-button.active {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
}

.icon-button.active i,
.icon-button.active span {
  color: white;
}

.more-icons {
  margin-top: var(--spacing-small);
}

.more-icons summary {
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-small);
  user-select: none;
}
</style>
