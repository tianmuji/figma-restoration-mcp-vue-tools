<template>
  <div class="comparison-viewer">
    <!-- 头部信息 -->
    <div class="header">
      <div class="title-section">
        <h1>{{ componentName }} - 还原度对比</h1>
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">组件列表</router-link>
          <span class="separator">></span>
          <span class="current">{{ componentName }}</span>
        </div>
      </div>
      <div class="stats-section">
        <div class="match-percentage" :class="getStatusClass(report?.summary?.matchPercentage || 0)">
          {{ (report?.summary?.matchPercentage || 0).toFixed(1) }}%
        </div>
        <div class="status-info">
          <div class="status-badge" :class="getStatusClass(report?.summary?.matchPercentage || 0)">
            {{ getStatusText(report?.summary?.status || 'unknown') }}
          </div>
          <div class="last-updated">
            更新时间: {{ formatTimestamp(report?.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载对比数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadReport" class="retry-button">重试</button>
    </div>

    <!-- 主要内容 -->
    <div v-else-if="report" class="main-content">
      <!-- 图片对比区域 -->
      <div class="image-comparison-section">
        <h2>📸 图片对比</h2>
        <div class="image-comparison">
          <div class="image-panel">
            <h3>原始设计 (Figma)</h3>
            <ImageViewer 
              :src="getImagePath(report.images.expected)" 
              :alt="`${componentName} 原始设计`"
              @error="handleImageError"
            />
          </div>
          <div class="image-panel">
            <h3>实际截图</h3>
            <ImageViewer 
              :src="getImagePath(report.images.actual)" 
              :alt="`${componentName} 实际截图`"
              @error="handleImageError"
            />
          </div>
          <div class="image-panel">
            <h3>差异对比</h3>
            <ImageViewer 
              :src="getImagePath(report.images.diff)" 
              :alt="`${componentName} 差异对比`"
              @error="handleImageError"
            />
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="statistics-section">
        <h2>📊 统计信息</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ report.summary.matchPercentage.toFixed(2) }}%</div>
            <div class="stat-label">还原度</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(report.summary.diffPixels) }}</div>
            <div class="stat-label">差异像素</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(report.summary.totalPixels) }}</div>
            <div class="stat-label">总像素</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ report.summary.totalIssues }}</div>
            <div class="stat-label">问题数量</div>
          </div>
        </div>
      </div>

      <!-- 简化的分析信息 -->
      <div v-if="report.analysis" class="analysis-summary">
        <h2>📋 分析摘要</h2>
        <div class="analysis-info">
          <p><strong>图片尺寸:</strong> {{ report.analysis.dimensions?.width || 'N/A' }} × {{ report.analysis.dimensions?.height || 'N/A' }}</p>
          <p><strong>差异像素:</strong> {{ formatNumber(report.analysis.diffPixels) }} / {{ formatNumber(report.analysis.totalPixels) }}</p>
          <p><strong>匹配度:</strong> {{ report.analysis.matchPercentage.toFixed(2) }}%</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <button @click="refreshData" class="action-button primary">
          🔄 刷新数据
        </button>
        <button @click="exportReport" class="action-button secondary">
          📄 导出报告
        </button>
        <button @click="shareReport" class="action-button secondary">
          🔗 分享链接
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ImageViewer from './ImageViewer.vue';
import { ComparisonDataService } from '../../services/comparison-data-service.js';

// Props
const props = defineProps({
  componentName: {
    type: String,
    default: ''
  }
});

// Reactive data
const route = useRoute();
const router = useRouter();
const dataService = new ComparisonDataService();

const loading = ref(false);
const error = ref(null);
const report = ref(null);

// Computed
const componentName = computed(() => {
  return props.componentName || route.params.name;
});

// 移除了 hasRecommendations computed

// Methods
const loadReport = async () => {
  if (!componentName.value) {
    error.value = '组件名称不能为空';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // 模拟加载报告数据
    const reportPath = `/src/components/${componentName.value}/results/comparison-report.json`;
    const response = await fetch(reportPath);
    
    if (!response.ok) {
      throw new Error(`无法加载报告: ${response.statusText}`);
    }
    
    report.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载报告失败';
    console.error('Failed to load comparison report:', err);
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  await loadReport();
};

const exportReport = async () => {
  try {
    // 模拟导出功能
    console.log('Exporting report for:', componentName.value);
    alert('导出功能演示 - 报告将保存为 PDF 格式');
  } catch (err) {
    console.error('Export failed:', err);
  }
};

const shareReport = async () => {
  try {
    // 模拟分享功能
    const shareUrl = `${window.location.origin}/component/${componentName.value}`;
    await navigator.clipboard.writeText(shareUrl);
    alert('分享链接已复制到剪贴板');
  } catch (err) {
    console.error('Share failed:', err);
  }
};

const handleImageError = (imagePath) => {
  console.warn('Image failed to load:', imagePath);
};

const getImagePath = (fullPath) => {
  // 转换绝对路径为相对路径，用于Web访问
  if (fullPath && fullPath.includes('/results/')) {
    const relativePath = fullPath.split('/results/')[1];
    return `/src/components/${componentName.value}/results/${relativePath}`;
  }
  return fullPath;
};

const getStatusClass = (percentage) => {
  if (percentage >= 95) return 'excellent';
  if (percentage >= 90) return 'good';
  if (percentage >= 80) return 'needs-improvement';
  return 'poor';
};

const getStatusText = (status) => {
  const statusMap = {
    excellent: '优秀',
    good: '良好',
    needs_improvement: '需要改进',
    poor: '较差',
    unknown: '未知'
  };
  return statusMap[status] || status;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '未知';
  return new Date(timestamp).toLocaleString('zh-CN');
};

const formatNumber = (num) => {
  return num.toLocaleString();
};

// Lifecycle
onMounted(() => {
  loadReport();
});

// Watch for route changes
watch(() => route.params.name, () => {
  if (route.params.name) {
    loadReport();
  }
});
</script>

<style scoped>
.comparison-viewer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.title-section h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.breadcrumb {
  font-size: 14px;
  color: #6b7280;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.match-percentage {
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
}

.match-percentage.excellent { color: #10b981; }
.match-percentage.good { color: #3b82f6; }
.match-percentage.needs-improvement { color: #f59e0b; }
.match-percentage.poor { color: #ef4444; }

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.excellent { background: #d1fae5; color: #065f46; }
.status-badge.good { background: #dbeafe; color: #1e40af; }
.status-badge.needs-improvement { background: #fef3c7; color: #92400e; }
.status-badge.poor { background: #fee2e2; color: #991b1b; }

.last-updated {
  font-size: 12px;
  color: #6b7280;
}

/* 加载和错误状态 */
.loading-state, .error-state {
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

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  margin-top: 16px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.retry-button:hover {
  background: #2563eb;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.main-content h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

/* 图片对比区域 */
.image-comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.image-panel {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.image-panel h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

/* 统计信息 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* 操作按钮 */
.actions-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.action-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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
}

/* 分析摘要样式 */
.analysis-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.analysis-info {
  background: #f9fafb;
  border-radius: 6px;
  padding: 16px;
  border-left: 4px solid #3b82f6;
}

.analysis-info p {
  margin: 0 0 8px 0;
  color: #4b5563;
  line-height: 1.5;
}

.analysis-info p:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .stats-section {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .image-comparison {
    grid-template-columns: 1fr;
  }
  
  .actions-section {
    flex-direction: column;
  }
}
</style>