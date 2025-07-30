import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import { FigmaComponentsPlugin } from '@/components';

// 创建应用实例
const app = createApp(App);

// 使用路由
app.use(router);

// 注册Figma组件插件
app.use(FigmaComponentsPlugin);

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error handler:', error, info);
  
  // 这里可以发送错误报告到监控服务
  if (typeof window !== 'undefined' && window.$notify) {
    window.$notify.error('应用错误', '应用程序遇到了意外错误，请刷新页面重试');
  }
};

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Global warning:', msg, trace);
};

// 全局属性
app.config.globalProperties.$version = '1.0.0';

// 挂载应用
app.mount('#app');

// 开发环境下的调试工具
if (process.env.NODE_ENV === 'development') {
  // 暴露应用实例到全局，方便调试
  window.__VUE_APP__ = app;
  
  // 性能监控
  if (window.performance) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('App load performance:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        loadComplete: perfData.loadEventEnd - perfData.fetchStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
      });
    });
  }
}

// Service Worker 注册（生产环境）
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}