<template>
  <div class="not-found">
    <div class="not-found-container">
      <div class="error-illustration">
        <div class="error-code">404</div>
        <div class="error-icon">🔍</div>
      </div>
      
      <div class="error-content">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        
        <div class="error-suggestions">
          <h3>您可以尝试：</h3>
          <ul>
            <li>检查URL是否正确</li>
            <li>返回<router-link to="/" class="link">首页</router-link>查看所有组件</li>
            <li>使用搜索功能查找特定组件</li>
          </ul>
        </div>
        
        <div class="error-actions">
          <button @click="goBack" class="action-button secondary">
            ← 返回上页
          </button>
          <router-link to="/" class="action-button primary">
            🏠 回到首页
          </router-link>
        </div>
      </div>
      
      <!-- 推荐组件 -->
      <div v-if="recentComponents.length > 0" class="recent-components">
        <h3>最近查看的组件</h3>
        <div class="component-grid">
          <router-link 
            v-for="component in recentComponents" 
            :key="component.name"
            :to="`/component/${component.name}`"
            class="component-card"
          >
            <div class="component-icon">🧩</div>
            <div class="component-info">
              <div class="component-name">{{ component.name }}</div>
              <div class="component-match">{{ component.matchPercentage }}% 还原度</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();

// Reactive data
const recentComponents = ref<any[]>([]);

// Methods
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
};

const loadRecentComponents = () => {
  // 从 localStorage 获取最近访问的组件
  try {
    const recent = localStorage.getItem('recentComponents');
    if (recent) {
      recentComponents.value = JSON.parse(recent).slice(0, 4);
    }
  } catch (error) {
    console.error('Failed to load recent components:', error);
  }
};

// Lifecycle
onMounted(() => {
  loadRecentComponents();
});
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 20px;
}

.not-found-container {
  max-width: 600px;
  text-align: center;
}

.error-illustration {
  position: relative;
  margin-bottom: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  color: #e5e7eb;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 64px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
  50% { transform: translate(-50%, -50%) translateY(-10px); }
}

.error-content {
  margin-bottom: 40px;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 18px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.error-suggestions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.error-suggestions h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
}

.error-suggestions li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 16px;
}

.action-button.primary {
  background: #3b82f6;
  color: white;
}

.action-button.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-button.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-button.secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.recent-components {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.recent-components h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.component-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border: 1px solid #f3f4f6;
}

.component-card:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
  transform: translateY(-1px);
}

.component-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.component-info {
  flex: 1;
  min-width: 0;
}

.component-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-match {
  font-size: 12px;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found {
    padding: 16px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-icon {
    font-size: 48px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 16px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .component-grid {
    grid-template-columns: 1fr;
  }
}

/* 暗色主题 */
:global(.dark-mode) .not-found {
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
}

:global(.dark-mode) .error-title {
  color: #f9fafb;
}

:global(.dark-mode) .error-description {
  color: #d1d5db;
}

:global(.dark-mode) .error-suggestions,
:global(.dark-mode) .recent-components {
  background: #1f2937;
  border-color: #374151;
}

:global(.dark-mode) .error-suggestions h3,
:global(.dark-mode) .recent-components h3 {
  color: #f3f4f6;
}

:global(.dark-mode) .error-suggestions ul {
  color: #d1d5db;
}

:global(.dark-mode) .component-card {
  background: #374151;
  border-color: #4b5563;
}

:global(.dark-mode) .component-card:hover {
  background: #4b5563;
  border-color: #6b7280;
}

:global(.dark-mode) .component-name {
  color: #f9fafb;
}

:global(.dark-mode) .component-match {
  color: #d1d5db;
}
</style>