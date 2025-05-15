<template>
  <div class="task-filters-container">
    <TabFilter 
      v-model="localFilter"
      :tabs="[
        { label: 'All Tasks', value: 'all', icon: 'list_alt' },
        { label: 'Available Tasks', value: 'available', icon: 'assignment' },
        { label: 'Completed Tasks', value: 'completed', icon: 'assignment_turned_in' }
      ]"
    />
    
    <div class="task-sorting">
      <label for="sortOption">Sort by:</label>
      <div class="select-wrapper">
        <select id="sortOption" v-model="localSortOption" class="sort-select">
          <option value="status">Status (Available first)</option>
          <option value="points">Points (High to Low)</option>
          <option value="date">Date Added (Newest first)</option>
          <option value="name">Name (A to Z)</option>
          <option value="category">Category</option>
        </select>
        <i class="material-icons select-icon">sort</i>
      </div>
    </div>
  </div>
</template>

<script>
import TabFilter from './TabFilter.vue';
import { computed } from 'vue';

export default {
  name: 'TaskFilters',
  components: {
    TabFilter
  },
  props: {
    filter: {
      type: String,
      default: 'all'
    },
    sortOption: {
      type: String,
      default: 'status'
    }
  },
  emits: ['update:filter', 'update:sortOption'],
  setup(props, { emit }) {
    const localFilter = computed({
      get: () => props.filter,
      set: (value) => emit('update:filter', value)
    });

    const localSortOption = computed({
      get: () => props.sortOption,
      set: (value) => emit('update:sortOption', value)
    });

    return {
      localFilter,
      localSortOption
    };
  }
}
</script>

<style scoped>
.task-filters-container {
  margin-bottom: var(--spacing-medium);
}

.task-sorting {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: var(--spacing-medium);
  padding: 0 var(--spacing-medium);
}

.task-sorting label {
  margin-right: var(--spacing-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary);
}

.select-wrapper {
  position: relative;
  display: inline-block;
}

.select-icon {
  position: absolute;
  right: var(--spacing-small);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-gray-dark);
}

.sort-select {
  padding: var(--spacing-vsmall) var(--spacing-medium);
  padding-right: calc(var(--spacing-medium) * 2);
  border-radius: var(--border-radius-small);
  border: 1px solid var(--color-gray-light);
  background-color: white;
  color: var(--color-secondary);
  font-family: var(--font-family-body);
  font-size: var(--font-size-small);
  cursor: pointer;
  width: auto;
}
</style>
