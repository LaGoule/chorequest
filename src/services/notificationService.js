/**
 * @typedef {Object} Notification
 * @property {string} id - Unique identifier
 * @property {string} message - Notification message
 * @property {'info' | 'success' | 'warning' | 'error'} type - Notification type
 * @property {number} timeout - Auto-dismiss timeout in milliseconds
 * @property {boolean} dismissible - Whether notification can be dismissed
 */

// Store for notifications
const notifications = [];
let nextId = 1;

/**
 * Service for managing notifications
 */
export const notificationService = {
  /**
   * Add a notification
   * @param {Object} notification - Notification data
   * @param {string} notification.message - Notification message
   * @param {'info' | 'success' | 'warning' | 'error'} [notification.type=info] - Notification type
   * @param {number} [notification.timeout=5000] - Auto-dismiss timeout (0 for no auto-dismiss)
   * @param {boolean} [notification.dismissible=true] - Whether notification can be dismissed
   * @returns {string} Notification ID
   */
  add({ message, type = 'info', timeout = 5000, dismissible = true }) {
    const id = String(nextId++);
    
    const notification = {
      id,
      message,
      type,
      timeout,
      dismissible,
      timestamp: Date.now()
    };
    
    notifications.push(notification);
    
    // Auto-dismiss
    if (timeout > 0) {
      setTimeout(() => {
        this.remove(id);
      }, timeout);
    }
    
    return id;
  },
  
  /**
   * Show success notification
   * @param {string} message - Notification message
   * @param {Object} [options] - Additional options
   * @returns {string} Notification ID
   */
  success(message, options = {}) {
    return this.add({
      message,
      type: 'success',
      ...options
    });
  },
  
  /**
   * Show error notification
   * @param {string} message - Notification message
   * @param {Object} [options] - Additional options
   * @returns {string} Notification ID
   */
  error(message, options = {}) {
    return this.add({
      message,
      type: 'error',
      timeout: 8000, // Longer timeout for errors
      ...options
    });
  },
  
  /**
   * Show warning notification
   * @param {string} message - Notification message
   * @param {Object} [options] - Additional options
   * @returns {string} Notification ID
   */
  warning(message, options = {}) {
    return this.add({
      message,
      type: 'warning',
      ...options
    });
  },
  
  /**
   * Show info notification
   * @param {string} message - Notification message
   * @param {Object} [options] - Additional options
   * @returns {string} Notification ID
   */
  info(message, options = {}) {
    return this.add({
      message,
      type: 'info',
      ...options
    });
  },
  
  /**
   * Remove a notification
   * @param {string} id - Notification ID
   * @returns {boolean} Whether the notification was found and removed
   */
  remove(id) {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.splice(index, 1);
      return true;
    }
    return false;
  },
  
  /**
   * Get all current notifications
   * @returns {Notification[]} Array of notifications
   */
  getAll() {
    return [...notifications];
  },
  
  /**
   * Register a callback to be called when notifications change
   * @param {Function} callback - Function to call when notifications change
   * @returns {Function} Function to unsubscribe
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    const unsubscribe = () => {
      const index = this._subscribers.indexOf(callback);
      if (index !== -1) {
        this._subscribers.splice(index, 1);
      }
    };
    
    this._subscribers = this._subscribers || [];
    this._subscribers.push(callback);
    
    return unsubscribe;
  },
  
  /**
   * Notify all subscribers of a change
   * @private
   */
  _notifySubscribers() {
    if (!this._subscribers) return;
    
    const currentNotifications = this.getAll();
    for (const callback of this._subscribers) {
      callback(currentNotifications);
    }
  }
};

// Monkey-patch methods to notify subscribers
const methodsToWrap = ['add', 'remove'];
for (const method of methodsToWrap) {
  const originalMethod = notificationService[method];
  notificationService[method] = function(...args) {
    const result = originalMethod.apply(this, args);
    this._notifySubscribers();
    return result;
  };
}
