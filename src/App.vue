<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- 导航栏 -->
    <AppNavigation />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="getTransitionName(route)" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <!-- 全局通知 -->
    <NotificationContainer />
    
    <!-- 全局加载指示器 -->
    <GlobalLoader v-if="isGlobalLoading" />
    
    <!-- 错误边界 -->
    <ErrorBoundary />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';
import AppNavigation from './pages/Navigation/AppNavigation.vue';
import NotificationContainer from './pages/Common/NotificationContainer.vue';
import GlobalLoader from './pages/Common/GlobalLoader.vue';
import ErrorBoundary from './pages/Common/ErrorBoundary.vue';

// Route
const route = useRoute();

// Reactive data
const isDarkMode = ref(false);
const isGlobalLoading = ref(false);

// Provide global state
provide('isDarkMode', isDarkMode);
provide('isGlobalLoading', isGlobalLoading);

// Methods
const getTransitionName = (route: any) => {
  // 根据路由决定过渡动画
  if (route.name === 'ComponentDetail' || route.name === 'ComparisonDetail') {
    return 'slide-left';
  }
  if (route.name === 'ComponentList' || route.name === 'Home') {
    return 'slide-right';
  }
  return 'fade';
};

const initializeTheme = () => {
  // 从 localStorage 读取主题设置
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  isDarkMode.value = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode');
  }
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches;
      document.documentElement.classList.toggle('dark-mode', e.matches);
    }
  });
};

const setupGlobalErrorHandling = () => {
  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // 这里可以发送错误报告到监控服务
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // 这里可以发送错误报告到监控服务
  });
};

const setupPerformanceMonitoring = () => {
  // 性能监控
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
      }, 0);
    });
  }
};

// Lifecycle
onMounted(() => {
  initializeTheme();
  setupGlobalErrorHandling();
  setupPerformanceMonitoring();
});
</script>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background: #ffffff;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background: #f9fafb;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* 暗色主题 */
.dark-mode {
  color: #f9fafb;
  background: #111827;
}

.dark-mode .main-content {
  background: #1f2937;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark-mode ::-webkit-scrollbar-track {
  background: #374151;
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark-mode ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 选择文本样式 */
::selection {
  background: #dbeafe;
  color: #1e40af;
}

.dark-mode ::selection {
  background: #1e40af;
  color: #dbeafe;
}

/* 焦点样式 */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 打印样式 */
@media print {
  .app-navigation,
  .nav-toolbar,
  .batch-actions,
  .quick-actions {
    display: none !important;
  }
  
  .main-content {
    background: white !important;
  }
  
  .component-card,
  .comparison-viewer {
    break-inside: avoid;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .component-card {
    border-width: 2px;
  }
  
  .nav-link {
    border: 1px solid transparent;
  }
  
  .nav-link:focus {
    border-color: currentColor;
  }
}

/* 响应式字体大小 */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 13px;
  }
}

/* 工具类 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

.p-2 {
  padding: 8px;
}

.p-4 {
  padding: 16px;
}

.m-2 {
  margin: 8px;
}

.m-4 {
  margin: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style>