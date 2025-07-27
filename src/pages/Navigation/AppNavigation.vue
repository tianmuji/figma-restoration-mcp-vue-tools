<template>
  <nav class="app-navigation">
    <div class="nav-container">
      <!-- Logo 和标题 -->
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <div class="brand-icon">🎯</div>
          <div class="brand-text">
            <div class="brand-title">Figma 还原监控</div>
            <div class="brand-subtitle">Component Restoration Monitor</div>
          </div>
        </router-link>
      </div>

      <!-- 主导航菜单 -->
      <div class="nav-menu">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ active: $route.name === 'Home' || $route.name === 'ComponentList' }"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">组件列表</span>
        </router-link>
        
        <!-- 当前组件导航（仅在详情页显示） -->
        <div v-if="currentComponent" class="nav-current">
          <span class="nav-separator">></span>
          <router-link 
            :to="`/component/${currentComponent}`"
            class="nav-link current-component"
          >
            <span class="nav-icon">🔍</span>
            <span class="nav-text">{{ currentComponent }}</span>
          </router-link>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="nav-toolbar">
        <!-- 搜索框 -->
        <div class="search-container" v-if="showSearch">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="搜索组件..."
            class="search-input"
            @keyup.enter="handleSearch"
            @blur="handleSearchBlur"
          />
          <button @click="handleSearch" class="search-button">
            🔍
          </button>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <button 
            @click="toggleSearch" 
            class="toolbar-button"
            :class="{ active: showSearch }"
            title="搜索"
          >
            🔍
          </button>
          
          <button 
            @click="refreshCurrentPage" 
            class="toolbar-button"
            :disabled="isRefreshing"
            title="刷新"
          >
            <span :class="{ spinning: isRefreshing }">🔄</span>
          </button>
          
          <button 
            @click="toggleTheme" 
            class="toolbar-button"
            title="切换主题"
          >
            {{ isDarkMode ? '🌞' : '🌙' }}
          </button>
          
          <div class="toolbar-divider"></div>
          
          <button 
            @click="showSettings" 
            class="toolbar-button"
            title="设置"
          >
            ⚙️
          </button>
          
          <button 
            @click="showHelp" 
            class="toolbar-button"
            title="帮助"
          >
            ❓
          </button>
        </div>
      </div>
    </div>

    <!-- 面包屑导航 -->
    <div v-if="breadcrumbs.length > 1" class="breadcrumb-container">
      <div class="breadcrumb-nav">
        <span 
          v-for="(crumb, index) in breadcrumbs" 
          :key="index"
          class="breadcrumb-item"
        >
          <router-link 
            v-if="crumb.to && index < breadcrumbs.length - 1"
            :to="crumb.to"
            class="breadcrumb-link"
          >
            {{ crumb.text }}
          </router-link>
          <span v-else class="breadcrumb-current">
            {{ crumb.text }}
          </span>
          <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">></span>
        </span>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-info">
        <span class="status-item">
          <span class="status-icon">📊</span>
          <span class="status-text">{{ totalComponents }} 个组件</span>
        </span>
        <span class="status-item">
          <span class="status-icon">📈</span>
          <span class="status-text">平均还原度 {{ averageMatch }}%</span>
        </span>
        <span class="status-item">
          <span class="status-icon">🕒</span>
          <span class="status-text">最后更新: {{ lastUpdateTime }}</span>
        </span>
      </div>
      
      <div class="status-actions">
        <button 
          v-if="hasUpdates" 
          @click="applyUpdates"
          class="status-button update-available"
        >
          <span class="button-icon">🔄</span>
          <span class="button-text">有更新</span>
        </button>
        
        <div class="connection-status" :class="connectionStatus">
          <span class="status-dot"></span>
          <span class="status-label">{{ getConnectionStatusText() }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ComparisonDataService } from '../../services/comparison-data-service.js';

// Router
const route = useRoute();
const router = useRouter();

// Services
const dataService = new ComparisonDataService();

// Reactive data
const searchQuery = ref('');
const showSearch = ref(false);
const isRefreshing = ref(false);
const isDarkMode = ref(false);
const totalComponents = ref(0);
const averageMatch = ref(0);
const lastUpdateTime = ref('');
const hasUpdates = ref(false);
const connectionStatus = ref<'connected' | 'disconnected' | 'connecting'>('connected');

// Computed
const currentComponent = computed(() => {
  return route.params.name as string || null;
});

const breadcrumbs = computed(() => {
  const crumbs = [
    { text: '首页', to: '/' }
  ];
  
  if (route.name === 'ComponentDetail' || route.name === 'ComparisonDetail') {
    crumbs.push(
      { text: '组件列表', to: '/components' },
      { text: currentComponent.value || '组件详情', to: null }
    );
  }
  
  return crumbs;
});

// Methods
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  if (!showSearch.value) {
    searchQuery.value = '';
  }
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'ComponentList',
      query: { search: searchQuery.value.trim() }
    });
  }
};

const handleSearchBlur = () => {
  // 延迟隐藏搜索框，允许点击搜索按钮
  setTimeout(() => {
    if (!searchQuery.value.trim()) {
      showSearch.value = false;
    }
  }, 200);
};

const refreshCurrentPage = async () => {
  isRefreshing.value = true;
  try {
    // 根据当前页面类型执行不同的刷新逻辑
    if (currentComponent.value) {
      await dataService.refreshComponent(currentComponent.value);
    } else {
      // 刷新组件列表
      window.location.reload();
    }
  } catch (error) {
    console.error('Failed to refresh:', error);
  } finally {
    isRefreshing.value = false;
  }
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value);
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

const showSettings = () => {
  // 显示设置对话框
  console.log('Show settings');
};

const showHelp = () => {
  // 显示帮助对话框
  console.log('Show help');
};

const applyUpdates = () => {
  hasUpdates.value = false;
  // 应用更新逻辑
  console.log('Apply updates');
};

const getConnectionStatusText = () => {
  const statusMap = {
    connected: '已连接',
    disconnected: '已断开',
    connecting: '连接中'
  };
  return statusMap[connectionStatus.value];
};

const loadSystemStats = async () => {
  try {
    const stats = await dataService.getSystemStats();
    totalComponents.value = stats.totalComponents || 0;
    averageMatch.value = Math.round(stats.averageMatchPercentage || 0);
    lastUpdateTime.value = formatTime(stats.lastUpdate);
  } catch (error) {
    console.error('Failed to load system stats:', error);
  }
};

const formatTime = (timestamp: string) => {
  if (!timestamp) return '未知';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// WebSocket 连接状态监控
const setupConnectionMonitoring = () => {
  // 模拟连接状态监控
  const checkConnection = () => {
    // 这里可以实现真实的连接检查逻辑
    connectionStatus.value = navigator.onLine ? 'connected' : 'disconnected';
  };
  
  window.addEventListener('online', checkConnection);
  window.addEventListener('offline', checkConnection);
  
  // 定期检查连接状态
  const connectionInterval = setInterval(checkConnection, 30000);
  
  // 清理函数
  return () => {
    window.removeEventListener('online', checkConnection);
    window.removeEventListener('offline', checkConnection);
    clearInterval(connectionInterval);
  };
};

// 监听路由变化
watch(route, () => {
  // 路由变化时可以执行一些操作
  loadSystemStats();
});

// 生命周期
let cleanupConnection: (() => void) | null = null;

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark-mode');
  }
  
  // 加载系统统计
  loadSystemStats();
  
  // 设置连接监控
  cleanupConnection = setupConnectionMonitoring();
  
  // 定期更新统计信息
  const statsInterval = setInterval(loadSystemStats, 60000); // 每分钟更新
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(statsInterval);
    if (cleanupConnection) {
      cleanupConnection();
    }
  });
});
</script>

<style scoped>
.app-navigation {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 主导航容器 */
.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 品牌区域 */
.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 32px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  margin-left: 40px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.active {
  background: #dbeafe;
  color: #1e40af;
}

.nav-link.current-component {
  background: #f0fdf4;
  color: #166534;
  font-weight: 600;
}

.nav-icon {
  font-size: 16px;
}

.nav-separator {
  color: #d1d5db;
  margin: 0 8px;
  font-weight: 300;
}

/* 工具栏 */
.nav-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-container {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.search-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input {
  padding: 8px 12px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  width: 200px;
}

.search-button {
  padding: 8px 12px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.search-button:hover {
  background: #2563eb;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-button {
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  color: #6b7280;
}

.toolbar-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.toolbar-button.active {
  background: #dbeafe;
  color: #1e40af;
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-button .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 4px;
}

/* 面包屑导航 */
.breadcrumb-container {
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  padding: 8px 20px;
}

.breadcrumb-nav {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.breadcrumb-current {
  color: #1f2937;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #d1d5db;
  margin: 0 4px;
}

/* 状态栏 */
.status-bar {
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  padding: 6px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.status-info {
  display: flex;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
}

.status-icon {
  font-size: 14px;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.status-button.update-available {
  background: #fef3c7;
  color: #92400e;
}

.status-button.update-available:hover {
  background: #fde68a;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.connection-status.connected .status-dot {
  background: #10b981;
}

.connection-status.disconnected .status-dot {
  background: #ef4444;
}

.connection-status.connecting .status-dot {
  background: #f59e0b;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-label {
  color: #6b7280;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
    height: 56px;
  }
  
  .nav-menu {
    margin-left: 20px;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .search-input {
    width: 150px;
  }
  
  .status-bar {
    padding: 6px 16px;
  }
  
  .status-info {
    gap: 12px;
  }
  
  .status-item .status-text {
    display: none;
  }
  
  .breadcrumb-container {
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    display: none;
  }
  
  .search-container {
    display: none;
  }
  
  .quick-actions {
    gap: 2px;
  }
  
  .toolbar-button {
    padding: 6px;
    font-size: 14px;
  }
}

/* 暗色主题 */
:global(.dark-mode) .app-navigation {
  background: #1f2937;
  border-bottom-color: #374151;
}

:global(.dark-mode) .brand-title {
  color: #f9fafb;
}

:global(.dark-mode) .nav-link {
  color: #d1d5db;
}

:global(.dark-mode) .nav-link:hover {
  background: #374151;
  color: #f3f4f6;
}

:global(.dark-mode) .nav-link.active {
  background: #1e40af;
  color: #dbeafe;
}

:global(.dark-mode) .breadcrumb-container,
:global(.dark-mode) .status-bar {
  background: #111827;
  border-bottom-color: #374151;
}

:global(.dark-mode) .search-container {
  background: #374151;
  border-color: #4b5563;
}

:global(.dark-mode) .search-input {
  color: #f9fafb;
}

:global(.dark-mode) .toolbar-button {
  color: #d1d5db;
}

:global(.dark-mode) .toolbar-button:hover {
  background: #374151;
  color: #f3f4f6;
}
</style>