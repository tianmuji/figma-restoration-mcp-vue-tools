<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="[`notification-${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          {{ getNotificationIcon(notification.type) }}
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div v-if="notification.message" class="notification-message">
            {{ notification.message }}
          </div>
        </div>
        <button class="notification-close" @click.stop="removeNotification(notification.id)">
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Reactive data
const notifications = ref<Notification[]>([]);

// Methods
const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString();
  const newNotification = { ...notification, id };
  
  notifications.value.push(newNotification);
  
  // 自动移除通知
  const duration = notification.duration || 5000;
  setTimeout(() => {
    removeNotification(id);
  }, duration);
};

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const getNotificationIcon = (type: string) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type as keyof typeof icons] || 'ℹ️';
};

// 暴露方法给全局使用
const showSuccess = (title: string, message?: string) => {
  addNotification({ type: 'success', title, message });
};

const showError = (title: string, message?: string) => {
  addNotification({ type: 'error', title, message });
};

const showWarning = (title: string, message?: string) => {
  addNotification({ type: 'warning', title, message });
};

const showInfo = (title: string, message?: string) => {
  addNotification({ type: 'info', title, message });
};

// 全局注册通知方法
onMounted(() => {
  (window as any).$notify = {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo
  };
});
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 400px;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left-color: #10b981;
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-warning {
  border-left-color: #f59e0b;
}

.notification-info {
  border-left-color: #3b82f6;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* 动画 */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    top: 70px;
    right: 16px;
    left: 16px;
  }
  
  .notification {
    min-width: auto;
    max-width: none;
  }
}

/* 暗色主题 */
:global(.dark-mode) .notification {
  background: #1f2937;
  color: #f9fafb;
}

:global(.dark-mode) .notification-title {
  color: #f9fafb;
}

:global(.dark-mode) .notification-message {
  color: #d1d5db;
}

:global(.dark-mode) .notification-close {
  color: #9ca3af;
}

:global(.dark-mode) .notification-close:hover {
  background: #374151;
  color: #d1d5db;
}
</style>