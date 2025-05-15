import { db, auth } from '@/firebase';
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
import { Task, TaskCategory } from '@/types/models';

/**
 * Service for managing tasks
 */
export const taskService = {
  /**
   * Fetch all tasks for the given household
   * @param householdId - The ID of the household
   * @returns Promise with array of tasks
   */
  async fetchTasks(householdId: string): Promise<Task[]> {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('householdId', '==', householdId)
      );
      
      const snapshot = await getDocs(tasksQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to load tasks');
    }
  },

  /**
   * Add a new task
   * @param task - The task to add (without id)
   * @returns Promise with the created task including ID
   */
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>): Promise<Task> {
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
      } as unknown as Task;
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add task');
    }
  },

  /**
   * Update an existing task
   * @param id - Task ID
   * @param updates - Fields to update
   * @returns Promise that resolves when the task is updated
   */
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'createdBy'>>): Promise<void> {
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
   * @param taskId - The task to complete
   * @param userId - User who completed the task
   * @returns Promise that resolves when the task is marked complete
   */
  async completeTask(taskId: string, userId: string): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
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
   * @param taskId - ID of the task to delete
   * @returns Promise that resolves when the task is deleted
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }
};
