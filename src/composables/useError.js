import { ref } from 'vue';
import { errorService } from '../services/errorService';

/**
 * Error handling composable
 * @returns {Object} Error helpers
 */
export function useError() {
  const error = ref(null);
  const isLoading = ref(false);
  
  /**
   * Handle async operation with error handling
   * @param {Function} asyncFn - Async function to execute
   * @param {Object} options - Options
   * @param {boolean} options.showLoading - Whether to show loading state
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onError - Error callback
   * @returns {Promise<*>} Operation result
   */
  const executeWithError = async (asyncFn, { showLoading = true, onSuccess, onError } = {}) => {
    if (showLoading) {
      isLoading.value = true;
    }
    
    error.value = null;
    
    try {
      const result = await asyncFn();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (e) {
      const formattedError = errorService.handleFirebaseError(e);
      error.value = formattedError;
      
      if (onError) {
        onError(formattedError);
      } else {
        // Log error by default
        errorService.logError(e);
      }
      
      throw formattedError;
    } finally {
      if (showLoading) {
        isLoading.value = false;
      }
    }
  };
  
  /**
   * Reset the error state
   */
  const resetError = () => {
    error.value = null;
  };
  
  return {
    error,
    isLoading,
    executeWithError,
    resetError
  };
}
