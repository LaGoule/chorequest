import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { errorService } from './errorService';

/**
 * Service for managing tasks
 */
export const taskService = {
  /**
   * Fetch all tasks for the given household
   * @param {string} householdId - The ID of the household
   * @returns {Promise<Array>} Promise with array of tasks
   */
  async fetchTasks(householdId) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('householdId', '==', householdId)
      );
      
      const snapshot = await getDocs(tasksQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      // Use error service to handle and format errors
      const appError = errorService.handleFirebaseError(error);
      errorService.logError(appError);
      throw appError;
    }
  },

  /**
   * Add a new task
   * @param {Object} task - The task to add (without id)
   * @returns {Promise<Object>} Promise with the created task including ID
   */
  async addTask(task) {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const taskData = {
        ...task,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      
      return {
        id: docRef.id,
        ...taskData,
        createdAt: Timestamp.now()
      };
    } catch (error) {
      // Use error service to handle and format errors
      const appError = errorService.handleFirebaseError(error);
      errorService.logError(appError);
      throw appError;
    }
  },

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>} Promise that resolves when the task is updated
   */
  async updateTask(id, updates) {
    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  },

  /**
   * Mark a task as complete
   * @param {string} taskId - The task to complete
   * @param {string} userId - User who completed the task
   * @returns {Promise<void>} Promise that resolves when the task is marked complete
   */
  async completeTask(taskId, userId) {
    try {
      const taskRef = doc(db, 'tasks', id);
      
      await updateDoc(taskRef, {
        completedBy: userId,
        completedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error completing task:', error);
      throw new Error('Failed to complete task');
    }
  },

  /**
   * Delete a task
   * @param {string} taskId - ID of the task to delete
   * @returns {Promise<void>} Promise that resolves when the task is deleted
   */
  async deleteTask(taskId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }
};
