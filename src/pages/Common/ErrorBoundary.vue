<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">💥</div>
      <h2 class="error-title">出现了一个错误</h2>
      <p class="error-message">
        应用程序遇到了意外错误。我们已经记录了这个问题，请稍后再试。
      </p>
      
      <div class="error-details" v-if="showDetails">
        <h3>错误详情:</h3>
        <pre class="error-stack">{{ errorInfo }}</pre>
      </div>
      
      <div class="error-actions">
        <button @click="reload" class="action-button primary">
          🔄 重新加载
        </button>
        <button @click="goHome" class="action-button secondary">
          🏠 返回首页
        </button>
        <button @click="toggleDetails" class="action-button secondary">
          {{ showDetails ? '隐藏' : '显示' }}详情
        </button>
      </div>
      
      <div class="error-help">
        <p>如果问题持续存在，请联系技术支持或提交问题报告。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();

// Reactive data
const hasError = ref(false);
const errorInfo = ref('');
const showDetails = ref(false);

// Error capture
onErrorCaptured((error, instance, info) => {
  hasError.value = true;
  errorInfo.value = `${error.message}\n\n${error.stack}\n\nComponent: ${info}`;
  
  // 记录错误到控制台
  console.error('Error captured by ErrorBoundary:', error, info);
  
  // 这里可以发送错误报告到监控服务
  reportError(error, info);
  
  return false; // 阻止错误继续传播
});

// Methods
const reload = () => {
  window.location.reload();
};

const goHome = () => {
  hasError.value = false;
  router.push('/');
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const reportError = (error: Error, info: string) => {
  // 发送错误报告到监控服务
  try {
    // 这里可以集成 Sentry、LogRocket 等错误监控服务
    console.log('Reporting error:', { error, info });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};
</script>

<style scoped>
.error-boundary {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.error-container {
  max-width: 600px;
  text-align: center;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.error-message {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.error-details {
  text-align: left;
  margin-bottom: 32px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.error-details h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.error-stack {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #ef4444;
  background: #fef2f2;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #fecaca;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.action-button.primary {
  background: #3b82f6;
  color: white;
}

.action-button.primary:hover {
  background: #2563eb;
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-button.secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.error-help {
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.error-help p {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-container {
    padding: 24px;
    margin: 16px;
  }
  
  .error-title {
    font-size: 20px;
  }
  
  .error-message {
    font-size: 14px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .error-stack {
    font-size: 11px;
  }
}

/* 暗色主题 */
:global(.dark-mode) .error-boundary {
  background: #111827;
}

:global(.dark-mode) .error-container {
  background: #1f2937;
  border-color: #374151;
}

:global(.dark-mode) .error-title {
  color: #f9fafb;
}

:global(.dark-mode) .error-message {
  color: #d1d5db;
}

:global(.dark-mode) .error-details {
  background: #111827;
  border-color: #374151;
}

:global(.dark-mode) .error-details h3 {
  color: #f3f4f6;
}

:global(.dark-mode) .error-stack {
  background: #1f2937;
  border-color: #374151;
  color: #fca5a5;
}

:global(.dark-mode) .error-help {
  border-top-color: #374151;
}

:global(.dark-mode) .error-help p {
  color: #9ca3af;
}
</style>