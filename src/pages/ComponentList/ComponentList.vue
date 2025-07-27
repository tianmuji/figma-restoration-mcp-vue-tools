<template>
  <div class="component-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>组件还原度监控</h1>
        <p class="subtitle">实时监控所有组件的Figma设计还原情况</p>
      </div>
      <div class="header-actions">
        <button @click="refreshAll" :disabled="isRefreshing" class="action-button primary">
          <span class="button-icon">{{ isRefreshing ? '🔄' : '🔄' }}</span>
          {{ isRefreshing ? '刷新中...' : '全部刷新' }}
        </button>
        <button @click="exportSummary" class="action-button secondary">
          <span class="button-icon">📊</span>
          导出报告
        </button>
      </div>
    </div>

    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stat-card excellent">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.excellent }}</div>
          <div class="stat-label">优秀 (≥95%)</div>
        </div>
      </div>
      <div class="stat-card good">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.good }}</div>
          <div class="stat-label">良好 (90-94%)</div>
        </div>
      </div>
      <div class="stat-card needs-improvement">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.needsImprovement }}</div>
          <div class="stat-label">需改进 (80-89%)</div>
        </div>
      </div>
      <div class="stat-card poor">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.poor }}</div>
          <div class="stat-label">较差 (<80%)</div>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总组件数</div>
        </div>
      </div>
      <div class="stat-card average">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.averageMatch.toFixed(1) }}%</div>
          <div class="stat-label">平均还原度</div>
        </div>
      </div>
    </div>

    <!-- 过滤和搜索 -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索组件名称..."
          class="search-input"
        />
        <div class="search-icon">🔍</div>
      </div>
      <div class="filter-controls">
        <select v-model="statusFilter" class="filter-select">
          <option value="">所有状态</option>
          <option value="excellent">优秀</option>
          <option value="good">良好</option>
          <option value="needs_improvement">需改进</option>
          <option value="poor">较差</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="name">按名称排序</option>
          <option value="matchPercentage">按还原度排序</option>
          <option value="lastUpdated">按更新时间排序</option>
        </select>
        <select v-model="sortOrder" class="filter-select">
          <option value="asc">升序</option>
          <option value="desc">降序</option>
        </select>
      </div>
      <div class="view-controls">
        <button 
          @click="viewMode = 'grid'" 
          :class="{ active: viewMode === 'grid' }"
          class="view-button"
          title="网格视图"
        >
          🔲
        </button>
        <button 
          @click="viewMode = 'list'" 
          :class="{ active: viewMode === 'list' }"
          class="view-button"
          title="列表视图"
        >
          📋
        </button>
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedComponents.length > 0" class="batch-actions">
      <div class="selection-info">
        已选择 {{ selectedComponents.length }} 个组件
      </div>
      <div class="batch-buttons">
        <button @click="batchRefresh" class="batch-button">
          🔄 批量刷新
        </button>
        <button @click="batchExport" class="batch-button">
          📄 批量导出
        </button>
        <button @click="clearSelection" class="batch-button secondary">
          ❌ 清除选择
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载组件数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadComponents" class="retry-button">重试</button>
    </div>

    <!-- 组件列表 -->
    <div v-else-if="filteredComponents.length > 0" class="components-container">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="components-grid">
        <ComponentCard
          v-for="component in paginatedComponents"
          :key="component.name"
          :component="component"
          :selected="selectedComponents.includes(component.name)"
          @click="navigateToComponent"
          @select="toggleSelection"
          @refresh="refreshComponent"
        />
      </div>

      <!-- 列表视图 -->
      <div v-else class="components-table">
        <table>
          <thead>
            <tr>
              <th class="select-column">
                <input 
                  type="checkbox" 
                  :checked="allCurrentPageSelected"
                  @change="toggleAllSelection"
                />
              </th>
              <th>组件名称</th>
              <th>还原度</th>
              <th>状态</th>
              <th>最后更新</th>
              <th>问题数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="component in paginatedComponents" 
              :key="component.name"
              :class="{ selected: selectedComponents.includes(component.name) }"
              @click="navigateToComponent(component.name)"
            >
              <td class="select-column" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="selectedComponents.includes(component.name)"
                  @change="toggleSelection(component.name)"
                />
              </td>
              <td>
                <div class="component-name">
                  <div class="name-text">{{ component.name }}</div>
                  <div v-if="component.description" class="description-text">
                    {{ component.description }}
                  </div>
                </div>
              </td>
              <td>
                <div class="match-percentage" :class="getStatusClass(component.matchPercentage)">
                  {{ component.matchPercentage.toFixed(1) }}%
                </div>
              </td>
              <td>
                <div class="status-badge" :class="getStatusClass(component.matchPercentage)">
                  {{ getStatusText(component.status) }}
                </div>
              </td>
              <td>
                <div class="update-time">
                  {{ formatTime(component.lastUpdated) }}
                </div>
              </td>
              <td>
                <div class="issue-count" :class="{ 'has-issues': component.issueCount > 0 }">
                  {{ component.issueCount || 0 }}
                </div>
              </td>
              <td class="actions-column" @click.stop>
                <div class="table-actions">
                  <button 
                    @click="refreshComponent(component.name)" 
                    class="mini-action-button"
                    title="刷新"
                  >
                    🔄
                  </button>
                  <button 
                    @click="navigateToComponent(component.name)" 
                    class="mini-action-button"
                    title="查看详情"
                  >
                    👁️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="page-button"
        >
          ⏮️
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-button"
        >
          ⏪
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-button"
        >
          ⏩
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="page-button"
        >
          ⏭️
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>暂无组件数据</h3>
      <p>{{ searchQuery ? '没有找到匹配的组件' : '还没有任何组件数据，请先运行截图对比' }}</p>
      <button v-if="!searchQuery" @click="refreshAll" class="empty-action-button">
        开始扫描组件
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import ComponentCard from './ComponentCard.vue';
import { ComparisonDataService } from '../../services/comparison-data-service.js';

// Router
const router = useRouter();

// Services
const dataService = new ComparisonDataService();

// Reactive data
const loading = ref(false);
const error = ref<string | null>(null);
const components = ref<any[]>([]);
const selectedComponents = ref<string[]>([]);
const isRefreshing = ref(false);

// Filters and search
const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref('matchPercentage');
const sortOrder = ref('desc');
const viewMode = ref<'grid' | 'list'>('grid');

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);

// Computed
const stats = computed(() => {
  const total = components.value.length;
  const excellent = components.value.filter(c => c.matchPercentage >= 95).length;
  const good = components.value.filter(c => c.matchPercentage >= 90 && c.matchPercentage < 95).length;
  const needsImprovement = components.value.filter(c => c.matchPercentage >= 80 && c.matchPercentage < 90).length;
  const poor = components.value.filter(c => c.matchPercentage < 80).length;
  const averageMatch = total > 0 ? components.value.reduce((sum, c) => sum + c.matchPercentage, 0) / total : 0;

  return {
    total,
    excellent,
    good,
    needsImprovement,
    poor,
    averageMatch
  };
});

const filteredComponents = computed(() => {
  let filtered = [...components.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(component => 
      component.name.toLowerCase().includes(query) ||
      (component.description && component.description.toLowerCase().includes(query))
    );
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(component => {
      const status = getStatusFromPercentage(component.matchPercentage);
      return status === statusFilter.value;
    });
  }

  // 排序
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'matchPercentage':
        aValue = a.matchPercentage;
        bValue = b.matchPercentage;
        break;
      case 'lastUpdated':
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortOrder.value === 'desc') {
      return aValue < bValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredComponents.value.length / pageSize.value);
});

const paginatedComponents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredComponents.value.slice(start, end);
});

const allCurrentPageSelected = computed(() => {
  return paginatedComponents.value.length > 0 && 
         paginatedComponents.value.every(c => selectedComponents.value.includes(c.name));
});

// Methods
const loadComponents = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const summary = await dataService.getComponentsSummary();
    components.value = summary.map(item => ({
      name: item.componentName,
      matchPercentage: item.matchPercentage || 0,
      status: item.status || 'unknown',
      lastUpdated: item.lastUpdated || new Date().toISOString(),
      issueCount: item.issueCount || 0,
      description: item.description || ''
    }));
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载组件列表失败';
    console.error('Failed to load components:', err);
  } finally {
    loading.value = false;
  }
};

const refreshAll = async () => {
  isRefreshing.value = true;
  try {
    const componentNames = components.value.map(c => c.name);
    await dataService.refreshComponents(componentNames);
    await loadComponents();
  } catch (err) {
    console.error('Failed to refresh all components:', err);
    // 显示错误提示
  } finally {
    isRefreshing.value = false;
  }
};

const refreshComponent = async (componentName: string) => {
  try {
    await dataService.refreshComponent(componentName);
    // 更新单个组件数据
    const index = components.value.findIndex(c => c.name === componentName);
    if (index !== -1) {
      const report = await dataService.getComparisonReport(componentName);
      components.value[index] = {
        ...components.value[index],
        matchPercentage: report.summary.matchPercentage,
        status: report.summary.status,
        lastUpdated: report.timestamp,
        issueCount: report.summary.totalIssues
      };
    }
  } catch (err) {
    console.error('Failed to refresh component:', err);
    // 显示错误提示
  }
};

const navigateToComponent = (componentName: string) => {
  router.push(`/component/${componentName}`);
};

const toggleSelection = (componentName: string) => {
  const index = selectedComponents.value.indexOf(componentName);
  if (index > -1) {
    selectedComponents.value.splice(index, 1);
  } else {
    selectedComponents.value.push(componentName);
  }
};

const toggleAllSelection = () => {
  if (allCurrentPageSelected.value) {
    // 取消选择当前页面的所有组件
    paginatedComponents.value.forEach(c => {
      const index = selectedComponents.value.indexOf(c.name);
      if (index > -1) {
        selectedComponents.value.splice(index, 1);
      }
    });
  } else {
    // 选择当前页面的所有组件
    paginatedComponents.value.forEach(c => {
      if (!selectedComponents.value.includes(c.name)) {
        selectedComponents.value.push(c.name);
      }
    });
  }
};

const clearSelection = () => {
  selectedComponents.value = [];
};

const batchRefresh = async () => {
  try {
    await dataService.refreshComponents(selectedComponents.value);
    await loadComponents();
    clearSelection();
  } catch (err) {
    console.error('Failed to batch refresh:', err);
  }
};

const batchExport = async () => {
  try {
    // 实现批量导出逻辑
    console.log('Batch export:', selectedComponents.value);
  } catch (err) {
    console.error('Failed to batch export:', err);
  }
};

const exportSummary = async () => {
  try {
    // 实现汇总导出逻辑
    const summaryData = {
      timestamp: new Date().toISOString(),
      stats: stats.value,
      components: components.value
    };
    
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `components-summary-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export summary:', err);
  }
};

const getStatusClass = (percentage: number): string => {
  if (percentage >= 95) return 'excellent';
  if (percentage >= 90) return 'good';
  if (percentage >= 80) return 'needs-improvement';
  return 'poor';
};

const getStatusFromPercentage = (percentage: number): string => {
  if (percentage >= 95) return 'excellent';
  if (percentage >= 90) return 'good';
  if (percentage >= 80) return 'needs_improvement';
  return 'poor';
};

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    needs_improvement: '需改进',
    poor: '较差',
    unknown: '未知'
  };
  return statusMap[status] || status;
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
};

// Watchers
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1; // 重置到第一页
});

// Lifecycle
onMounted(() => {
  loadComponents();
});
</script>

<style scoped>
.component-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-button.primary {
  background: #3b82f6;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: #2563eb;
}

.action-button.primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-button.secondary:hover {
  background: #e5e7eb;
}

.button-icon {
  font-size: 16px;
}

/* 统计面板 */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-card.excellent { border-left: 4px solid #10b981; }
.stat-card.good { border-left: 4px solid #3b82f6; }
.stat-card.needs-improvement { border-left: 4px solid #f59e0b; }
.stat-card.poor { border-left: 4px solid #ef4444; }
.stat-card.total { border-left: 4px solid #8b5cf6; }
.stat-card.average { border-left: 4px solid #06b6d4; }

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* 过滤和搜索 */
.filters-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.view-controls {
  display: flex;
  gap: 4px;
}

.view-button {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.view-button:hover {
  background: #f3f4f6;
}

.view-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* 批量操作 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 20px;
}

.selection-info {
  font-weight: 500;
  color: #1e40af;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

.batch-button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: #3b82f6;
  color: white;
}

.batch-button:hover {
  background: #2563eb;
}

.batch-button.secondary {
  background: #6b7280;
}

.batch-button.secondary:hover {
  background: #4b5563;
}

/* 加载和错误状态 */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.retry-button, .empty-action-button {
  margin-top: 16px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-button:hover, .empty-action-button:hover {
  background: #2563eb;
}

/* 网格视图 */
.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* 列表视图 */
.components-table {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 32px;
}

.components-table table {
  width: 100%;
  border-collapse: collapse;
}

.components-table th,
.components-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.components-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.components-table tr:hover {
  background: #f9fafb;
  cursor: pointer;
}

.components-table tr.selected {
  background: #dbeafe;
}

.select-column {
  width: 40px;
  text-align: center;
}

.component-name .name-text {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.component-name .description-text {
  font-size: 12px;
  color: #6b7280;
}

.match-percentage {
  font-weight: 700;
  font-size: 16px;
}

.match-percentage.excellent { color: #10b981; }
.match-percentage.good { color: #3b82f6; }
.match-percentage.needs-improvement { color: #f59e0b; }
.match-percentage.poor { color: #ef4444; }

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.excellent { background: #d1fae5; color: #065f46; }
.status-badge.good { background: #dbeafe; color: #1e40af; }
.status-badge.needs-improvement { background: #fef3c7; color: #92400e; }
.status-badge.poor { background: #fee2e2; color: #991b1b; }

.update-time {
  font-size: 14px;
  color: #6b7280;
}

.issue-count {
  font-weight: 600;
  color: #10b981;
}

.issue-count.has-issues {
  color: #ef4444;
}

.actions-column {
  width: 80px;
}

.table-actions {
  display: flex;
  gap: 4px;
}

.mini-action-button {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.mini-action-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.page-button {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.page-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
  margin: 0 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-section {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .filter-controls {
    flex-wrap: wrap;
  }
  
  .components-table {
    overflow-x: auto;
  }
  
  .components-table table {
    min-width: 800px;
  }
  
  .batch-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>