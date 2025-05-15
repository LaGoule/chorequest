/**
 * Application-wide constants
 */

/**
 * Task categories with their display labels and icons
 */
export const TASK_CATEGORIES = [
  { value: 'cleaning', label: 'Cleaning', icon: 'cleaning_services' },
  { value: 'cooking', label: 'Cooking', icon: 'restaurant' },
  { value: 'maintenance', label: 'Maintenance', icon: 'build' },
  { value: 'outdoor', label: 'Outdoor', icon: 'grass' },
  { value: 'shopping', label: 'Shopping', icon: 'shopping_cart' },
  { value: 'laundry', label: 'Laundry', icon: 'local_laundry_service' },
  { value: 'dishes', label: 'Dishes', icon: 'wash' },
  { value: 'pets', label: 'Pets', icon: 'pets' },
  { value: 'childcare', label: 'Childcare', icon: 'child_care' }
];

/**
 * Category icon mapping
 */
export const CATEGORY_ICONS = TASK_CATEGORIES.reduce((acc, category) => {
  acc[category.value] = category.icon;
  return acc;
}, {});

/**
 * Task sort options
 */
export const SORT_OPTIONS = [
  { label: 'Status (Available first)', value: 'status' },
  { label: 'Points (High to Low)', value: 'points' },
  { label: 'Date Added (Newest first)', value: 'date' },
  { label: 'Name (A to Z)', value: 'name' },
  { label: 'Category', value: 'category' }
];

/**
 * Task filter options
 */
export const FILTER_TABS = [
  { label: 'All Tasks', value: 'all', icon: 'list_alt' },
  { label: 'Available', value: 'available', icon: 'assignment' },
  { label: 'Completed', value: 'completed', icon: 'assignment_turned_in' }
];

/**
 * Get formatted category name
 * @param {string} category - Category key
 * @returns {string} Formatted category name
 */
export function formatCategory(category) {
  const found = TASK_CATEGORIES.find(cat => cat.value === category);
  return found ? found.label : category;
}
