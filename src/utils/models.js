/**
 * Models for the ChoreQuest application
 */

/**
 * Task categories
 * @enum {string}
 */
export const TaskCategories = {
  CLEANING: 'cleaning',
  COOKING: 'cooking',
  MAINTENANCE: 'maintenance',
  OUTDOOR: 'outdoor',
  SHOPPING: 'shopping',
  LAUNDRY: 'laundry',
  DISHES: 'dishes',
  PETS: 'pets',
  CHILDCARE: 'childcare',
};

/**
 * @typedef {Object} Task
 * @property {string} id - Task ID
 * @property {string} name - Task name
 * @property {string} [description] - Task description
 * @property {string} category - Task category
 * @property {number} pointsValue - Points value
 * @property {string} [icon] - Icon name
 * @property {Date|firebase.firestore.Timestamp} createdAt - Creation date
 * @property {string} createdBy - Creator user ID
 * @property {string} [completedBy] - User ID of person who completed the task
 * @property {Date|firebase.firestore.Timestamp} [completedAt] - Completion date
 * @property {string} householdId - Household ID
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {number} points - User points
 * @property {string} [householdId] - Household ID
 * @property {string[]} [badges] - Badge IDs
 * @property {Date|firebase.firestore.Timestamp} createdAt - Creation date
 */

/**
 * @typedef {Object} Household
 * @property {string} id - Household ID
 * @property {string} name - Household name
 * @property {string} adminId - Admin user ID
 * @property {Date|firebase.firestore.Timestamp} createdAt - Creation date
 */

/**
 * @typedef {Object} Badge
 * @property {string} id - Badge ID
 * @property {string} name - Badge name
 * @property {string} description - Badge description
 * @property {string} [icon] - Badge icon
 * @property {Object} [criteria] - Badge criteria
 */
