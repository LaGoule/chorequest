/**
 * Types for the ChoreQuest application
 */

/**
 * Task model representing a household chore
 */
export interface Task {
  id: string;
  name: string;
  description?: string;
  category: TaskCategory;
  pointsValue: number;
  icon?: string;
  createdAt: Date | firebase.firestore.Timestamp;
  createdBy: string; // User ID
  completedBy?: string; // User ID of the person who completed the task
  completedAt?: Date | firebase.firestore.Timestamp;
  householdId: string;
}

/**
 * Available task categories
 */
export type TaskCategory = 
  | 'cleaning'
  | 'cooking'
  | 'maintenance'
  | 'outdoor'
  | 'shopping'
  | 'laundry'
  | 'dishes'
  | 'pets'
  | 'childcare';

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  householdId?: string;
  badges?: string[];
  createdAt: Date | firebase.firestore.Timestamp;
}

/**
 * Household model representing a group of users
 */
export interface Household {
  id: string;
  name: string;
  adminId: string; // User ID of the household admin
  createdAt: Date | firebase.firestore.Timestamp;
}

/**
 * Badge model for achievements
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  criteria?: BadgeCriteria;
}

/**
 * Criteria for badge achievements
 */
export interface BadgeCriteria {
  type: 'tasks_completed' | 'points_earned' | 'category_completed';
  count: number;
  category?: TaskCategory;
}
