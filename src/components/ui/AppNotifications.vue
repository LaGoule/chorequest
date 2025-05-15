<template>
  <div class="notifications-container">
    <TransitionGroup name="notification" tag="div">
      <div 
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="[`notification-${notification.type}`]"
      >
        <div class="notification-icon">
          <i class="material-icons">{{ getIconForType(notification.type) }}</i>
        </div>
        
        <div class="notification-content">
          {{ notification.message }}
        </div>
        
        <div v-if="notification.dismissible" class="notification-dismiss">
          <button 
            class="dismiss-button"
            @click="dismiss(notification.id)"
            aria-label="Dismiss"
          >
            <i class="material-icons">close</i>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { notificationService } from '../../services/notificationService';

export default {
  name: 'AppNotifications',
  setup() {
    const notifications = ref([]);
    let unsubscribe = null;
    
    const updateNotifications = (newNotifications) => {
      notifications.value = newNotifications;
    };
    
    onMounted(() => {
      // Initial notifications
      updateNotifications(notificationService.getAll());
      
      // Subscribe to changes
      unsubscribe = notificationService.subscribe(updateNotifications);
    });
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });
    
    const dismiss = (id) => {
      notificationService.remove(id);
    };
    
    const getIconForType = (type) => {
      switch(type) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'warning': return 'warning';
        case 'info': 
        default:
          return 'info';
      }
    };
    
    return {
      notifications,
      dismiss,
      getIconForType
    };
  }
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: var(--spacing-large);
  right: var(--spacing-large);
  z-index: 1000;
  width: 320px;
  max-width: calc(100vw - var(--spacing-large) * 2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small);
}

.notification {
  background-color: white;
  box-shadow: var(--shadow-medium);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
  animation: slide-in 0.3s ease;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  margin-right: var(--spacing-small);
}

.notification-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dismiss-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-gray-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.dismiss-button:hover {
  color: var(--color-gray-dark);
}

/* Notification types */
.notification-success {
  border-left: 4px solid var(--color-success);
}

.notification-success .notification-icon {
  color: var(--color-success);
}

.notification-error {
  border-left: 4px solid var(--color-error);
}

.notification-error .notification-icon {
  color: var(--color-error);
}

.notification-warning {
  border-left: 4px solid #ff9800;
}

.notification-warning .notification-icon {
  color: #ff9800;
}

.notification-info {
  border-left: 4px solid var(--color-primary);
}

.notification-info .notification-icon {
  color: var(--color-primary);
}

/* Transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes slide-in {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
