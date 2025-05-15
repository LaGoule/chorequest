/**
 * @typedef {Object} AppError
 * @property {'auth'|'data'|'network'|'unknown'} type - Error type
 * @property {string} code - Error code
 * @property {string} message - User-friendly error message
 * @property {Error} [originalError] - Original error object
 */

/**
 * Service for handling and formatting errors
 */
export const errorService = {
  /**
   * Handle and format Firebase errors
   * @param {Error} error - The error object
   * @returns {AppError} Formatted error object
   */
  handleFirebaseError(error) {
    // Check if it's a Firebase error
    if (error && error.code) {
      // Authentication errors
      if (error.code.startsWith('auth/')) {
        return {
          type: 'auth',
          code: error.code,
          message: this.getAuthErrorMessage(error.code),
          originalError: error
        };
      }
      
      // Firestore errors
      if (error.code.startsWith('firestore/')) {
        return {
          type: 'data',
          code: error.code,
          message: this.getDataErrorMessage(error.code),
          originalError: error
        };
      }
    }
    
    // Network errors
    if (error instanceof Error && (error.message.includes('network') || error.message.includes('connection'))) {
      return {
        type: 'network',
        code: 'network-error',
        message: 'Please check your internet connection and try again.',
        originalError: error
      };
    }
    
    // Default error
    return {
      type: 'unknown',
      code: 'unknown-error',
      message: 'An unexpected error occurred. Please try again later.',
      originalError: error instanceof Error ? error : new Error(String(error))
    };
  },

  /**
   * Get user-friendly message for authentication errors
   * @param {string} code - Error code
   * @returns {string} User-friendly error message
   */
  getAuthErrorMessage(code) {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or try signing in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/invalid-email':
        return 'The email address is not valid. Please enter a valid email.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/requires-recent-login':
        return 'For security reasons, please sign in again before performing this action.';
      default:
        return 'Authentication error. Please try again later.';
    }
  },

  /**
   * Get user-friendly message for data errors
   * @param {string} code - Error code
   * @returns {string} User-friendly error message
   */
  getDataErrorMessage(code) {
    switch (code) {
      case 'firestore/permission-denied':
        return 'You don\'t have permission to perform this action.';
      case 'firestore/not-found':
        return 'The requested information could not be found.';
      case 'firestore/aborted':
        return 'Operation aborted. Please try again.';
      case 'firestore/unavailable':
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Error accessing data. Please try again later.';
    }
  },

  /**
   * Log error to console and potentially to monitoring service
   * @param {Error} error - Error to log
   */
  logError(error) {
    console.error('Application error:', error);
    
    // Here we could add logging to a monitoring service like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error);
    // }
  }
};
