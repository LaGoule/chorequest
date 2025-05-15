<template>
  <div class="icon-selector">
    <div class="selected-icon">
      <i v-if="modelValue" class="material-icons">{{ modelValue }}</i>
      <span v-else>Aucune icône sélectionnée</span>
    </div>
    
    <div class="icons-grid">
      <button 
        v-for="icon in categoryIcons" 
        :key="icon.value"
        type="button"
        class="icon-button" 
        :class="{ active: modelValue === icon.value }"
        @click="selectIcon(icon.value)"
      >
        <i class="material-icons">{{ icon.value }}</i>
        <span class="icon-label">{{ icon.label }}</span>
      </button>
    </div>
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
      default: ''
    },
    inputId: {
      type: String,
      default: 'icon-selector'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const icons = {
      // Icônes par catégorie
      cleaning: [
        { value: 'cleaning_services', label: 'Nettoyage' },
        { value: 'mop', label: 'Serpillière' },
        { value: 'wash', label: 'Lavage' },
        { value: 'bathroom', label: 'Salle de bain' }
      ],
      cooking: [
        { value: 'restaurant', label: 'Cuisine' },
        { value: 'kitchen', label: 'Cuisine' },
        { value: 'lunch_dining', label: 'Repas' }
      ],
      maintenance: [
        { value: 'build', label: 'Réparer' },
        { value: 'handyman', label: 'Dépanner' },
        { value: 'home_repair_service', label: 'Réparation maison' }
      ],
      outdoor: [
        { value: 'grass', label: 'Jardin' },
        { value: 'yard', label: 'Cour' },
        { value: 'deck', label: 'Terrasse' }
      ],
      shopping: [
        { value: 'shopping_cart', label: 'Shopping' },
        { value: 'local_grocery_store', label: 'Épicerie' }
      ],
      laundry: [
        { value: 'local_laundry_service', label: 'Laverie' },
        { value: 'dry_cleaning', label: 'Nettoyage à sec' }
      ],
      dishes: [
        { value: 'utensils', label: 'Vaisselle' },
        { value: 'wash_dishes', label: 'Laver la vaisselle' }
      ],
      pets: [
        { value: 'pets', label: 'Animaux' },
        { value: 'pet_supplies', label: 'Fournitures pour animaux' }
      ],
      childcare: [
        { value: 'child_care', label: 'Garde d\'enfants' },
        { value: 'child_friendly', label: 'Enfants bienvenus' }
      ],
      // Icônes génériques
      general: [
        { value: 'task_alt', label: 'Tâche' },
        { value: 'check_circle', label: 'Vérifier' },
        { value: 'event', label: 'Événement' },
        { value: 'home', label: 'Accueil' }
      ]
    };
    
    // Icônes à afficher selon la catégorie
    const categoryIcons = computed(() => {
      if (props.category && icons[props.category]) {
        return [...icons[props.category], ...icons.general];
      }
      return [...Object.values(icons).flat()];
    });
    
    const selectIcon = (iconValue) => {
      emit('update:modelValue', iconValue);
    };
    
    return {
      categoryIcons,
      selectIcon
    };
  }
}
</script>

<style scoped>
.icon-selector {
  margin-bottom: var(--spacing-medium);
}

.selected-icon {
  display: flex;
  align-items: center;
  padding: var(--spacing-small);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-small);
  margin-bottom: var(--spacing-small);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: var(--spacing-small);
  max-height: 200px;
  overflow-y: auto;
  padding: var(--spacing-small);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-small);
}

.icon-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-small);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--border-radius-small);
  cursor: pointer;
}

.icon-button:hover {
  background-color: var(--color-gray-vlight);
}

.icon-button.active {
  background-color: var(--color-primary-light);
  color: white;
  border-color: var(--color-primary);
}

.icon-label {
  font-size: var(--font-size-small);
  margin-top: var(--spacing-vsmall);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
