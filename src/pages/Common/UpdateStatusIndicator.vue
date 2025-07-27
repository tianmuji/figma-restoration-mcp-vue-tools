<template>
  <div class="update-status-indicator" :class="[`status-${status}`, { visible: isVisible }]">
    <div class="indicator-content">
      <div class="status-icon">
        <span v-if="status === 'updating'" class="spinner">🔄</span>
        <span v-else-if="status === 'success'">✅</span>
        <span v-else-if="status === 'error'">❌</span>
        <span v-else-if="status === 'connecting'">🔗</span>
        <span v-else>📡</span>
      </div>
      
      <div class="status-content">
        <div class="status-title">{{ getStatusTitle() }}</div>
        <div v-if="message" class="status-message">{{ message }}</div>
        
        <!-- 进度条 -->
        <div v-if="progress !== null && status === 'updating'" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="progress-text">{{ progress }}%</div>
        </div>
        
        <!-- 更新详情 -->
        <div v-if="details && details.length > 0" class="update-details">
          <div class="details-toggle" @click="showDetails = !showDetails">
            <span>{{ showDetails ? '隐藏' : '显示' }}详情</span>
            <span class="toggle-icon" :class="{ expanded: showDetails }">▼</span>
          </div>
          <div v-if="showDetails" class="details-list">
            <div v-for="(detail, index) in details" :key="index" class="detail-item">
              <span class="detail-icon">{{ getDetailIcon(detail.type) }}</span>
              <span class="detail-text">{{ detail.message }}</span>
              <span class="detail-time">{{ formatTime(detail.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="status-actions">
        <button 
          v-if="status === 'error'" 
          @click="retry" 
          class="action-button retry"
          title="重试"
        >
          🔄
        </button>
        <button 
          v-if="canCancel" 
          @click="cancel" 
          class="action-button cancel"
          title="取消"
        >
          ❌
        </button>
        <button 
          @click="hide" 
          class="action-button close"
          title="关闭"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Props
interface UpdateDetail {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface Props {
  status: 'idle' | 'connecting' | 'updating' | 'success' | 'error';
  message?: string;
  progress?: number | null;
  details?: UpdateDetail[];
  autoHide?: boolean;
  autoHideDelay?: number;
  canCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'idle',
  message: '',
  progress: null,
  details: () => [],
  autoHide: true,
  autoHideDelay: 3000,
  canCancel: false
});

// Emits
const emit = defineEmits<{
  retry: [];
  cancel: [];
  hide: [];
}>();

// Reactive data
const isVisible = ref(false);
const showDetails = ref(false);
const autoHideTimer = ref<number | null>(null);

// Computed
const shouldShow = computed(() => {
  return props.status !== 'idle' || props.message || (props.details && props.details.length > 0);
});

// Methods
const getStatusTitle = () => {
  const titles = {
    idle: '就绪',
    connecting: '连接中...',
    updating: '更新中...',
    success: '更新成功',
    error: '更新失败'
  };
  return titles[props.status] || '未知状态';
};

const getDetailIcon = (type: string) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  return icons[type as keyof typeof icons] || 'ℹ️';
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const show = () => {
  isVisible.value = true;
  clearAutoHideTimer();
};

const hide = () => {
  isVisible.value = false;
  showDetails.value = false;
  emit('hide');
};

const retry = () => {
  emit('retry');
};

const cancel = () => {
  emit('cancel');
};

const clearAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value);
    autoHideTimer.value = null;
  }
};

const startAutoHideTimer = () => {
  if (props.autoHide && (props.status === 'success' || props.status === 'error')) {
    clearAutoHideTimer();
    autoHideTimer.value = window.setTimeout(() => {
      hide();
    }, props.autoHideDelay);
  }
};

// Watchers
watch(shouldShow, (newValue) => {
  if (newValue) {
    show();
  } else {
    hide();
  }
});

watch(() => props.status, (newStatus) => {
  if (newStatus === 'success' || newStatus === 'error') {
    startAutoHideTimer();
  } else {
    clearAutoHideTimer();
  }
});

// Lifecycle
onMounted(() => {
  if (shouldShow.value) {
    show();
  }
});

onUnmounted(() => {
  clearAutoHideTimer();
});
</script>

<style scoped>
.update-status-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  min-width: 320px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  pointer-events: none;
}

.update-status-indicator.visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.update-status-indicator.status-updating {
  border-left: 4px solid #3b82f6;
}

.update-status-indicator.status-success {
  border-left: 4px solid #10b981;
}

.update-status-indicator.status-error {
  border-left: 4px solid #ef4444;
}

.update-status-indicator.status-connecting {
  border-left: 4px solid #f59e0b;
}

.indicator-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.status-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.status-icon .spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
}

.status-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 8px;
}

.progress-container {
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}

.update-details {
  margin-top: 8px;
}

.details-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
  user-select: none;
}

.details-toggle:hover {
  color: #1d4ed8;
}

.toggle-icon {
  transition: transform 0.2s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.details-list {
  max-height: 120px;
  overflow-y: auto;
  margin-top: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.detail-text {
  flex: 1;
  color: #374151;
  line-height: 1.4;
}

.detail-time {
  color: #9ca3af;
  font-size: 11px;
  flex-shrink: 0;
}

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.action-button {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-button.retry {
  background: #dbeafe;
  color: #1e40af;
}

.action-button.retry:hover {
  background: #bfdbfe;
}

.action-button.cancel {
  background: #fee2e2;
  color: #991b1b;
}

.action-button.cancel:hover {
  background: #fecaca;
}

.action-button.close {
  background: #f3f4f6;
  color: #6b7280;
}

.action-button.close:hover {
  background: #e5e7eb;
  color: #374151;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .update-status-indicator {
    bottom: 16px;
    right: 16px;
    left: 16px;
    min-width: auto;
    max-width: none;
  }
  
  .indicator-content {
    padding: 12px;
  }
  
  .details-list {
    max-height: 80px;
  }
}

/* 暗色主题 */
:global(.dark-mode) .update-status-indicator {
  background: #1f2937;
  border-color: #374151;
}

:global(.dark-mode) .status-title {
  color: #f9fafb;
}

:global(.dark-mode) .status-message {
  color: #d1d5db;
}

:global(.dark-mode) .progress-bar {
  background: #374151;
}

:global(.dark-mode) .progress-text {
  color: #d1d5db;
}

:global(.dark-mode) .details-toggle {
  color: #60a5fa;
}

:global(.dark-mode) .details-toggle:hover {
  color: #93c5fd;
}

:global(.dark-mode) .details-list {
  background: #111827;
  border-color: #374151;
}

:global(.dark-mode) .detail-item {
  border-bottom-color: #374151;
}

:global(.dark-mode) .detail-text {
  color: #f3f4f6;
}

:global(.dark-mode) .detail-time {
  color: #9ca3af;
}
</style>