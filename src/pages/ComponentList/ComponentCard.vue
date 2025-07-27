<template>
  <div 
    class="component-card"
    :class="[
      `status-${getStatusClass(component.matchPercentage)}`,
      { selected: selected, updating: isUpdating }
    ]"
    @click="handleClick"
  >
    <!-- 选择框 -->
    <div class="card-header">
      <div class="selection-area" @click.stop>
        <input 
          type="checkbox" 
          :checked="selected"
          @change="handleSelect"
          class="selection-checkbox"
        />
      </div>
      <div class="card-actions">
        <button 
          @click.stop="handleRefresh" 
          :disabled="isUpdating"
          class="action-icon-button"
          title="刷新组件"
        >
          <span class="action-icon" :class="{ spinning: isUpdating }">🔄</span>
        </button>
        <button 
          @click.stop="handleClick" 
          class="action-icon-button"
          title="查看详情"
        >
          <span class="action-icon">👁️</span>
        </button>
      </div>
    </div>

    <!-- 组件预览 -->
    <div class="card-preview">
      <div class="preview-container">
        <img 
          v-if="component.thumbnailUrl"
          :src="component.thumbnailUrl" 
          :alt="`${component.name} 预览`"
          class="preview-image"
          @error="handleImageError"
        />
        <div v-else class="preview-placeholder">
          <div class="placeholder-icon">🖼️</div>
          <div class="placeholder-text">暂无预览</div>
        </div>
        
        <!-- 状态覆盖层 -->
        <div class="status-overlay" :class="`status-${getStatusClass(component.matchPercentage)}`">
          <div class="status-icon">{{ getStatusIcon(component.matchPercentage) }}</div>
        </div>
      </div>
    </div>

    <!-- 组件信息 -->
    <div class="card-content">
      <div class="component-header">
        <h3 class="component-name" :title="component.name">
          {{ component.name }}
        </h3>
        <div class="match-percentage" :class="`status-${getStatusClass(component.matchPercentage)}`">
          {{ component.matchPercentage.toFixed(1) }}%
        </div>
      </div>
      
      <div v-if="component.description" class="component-description">
        {{ component.description }}
      </div>

      <div class="component-stats">
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-label">状态:</span>
          <span class="stat-value status-text" :class="`status-${getStatusClass(component.matchPercentage)}`">
            {{ getStatusText(component.status) }}
          </span>
        </div>
        
        <div class="stat-item">
          <span class="stat-icon">🕒</span>
          <span class="stat-label">更新:</span>
          <span class="stat-value">{{ formatTime(component.lastUpdated) }}</span>
        </div>
        
        <div v-if="component.issueCount > 0" class="stat-item">
          <span class="stat-icon">⚠️</span>
          <span class="stat-label">问题:</span>
          <span class="stat-value issue-count">{{ component.issueCount }}</span>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="`status-${getStatusClass(component.matchPercentage)}`"
            :style="{ width: `${component.matchPercentage}%` }"
          ></div>
        </div>
        <div class="progress-labels">
          <span class="progress-label">还原度</span>
          <span class="progress-value">{{ component.matchPercentage.toFixed(1) }}%</span>
        </div>
      </div>

      <!-- 标签 -->
      <div v-if="component.tags && component.tags.length > 0" class="component-tags">
        <span 
          v-for="tag in component.tags.slice(0, 3)" 
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
        <span v-if="component.tags.length > 3" class="tag more-tags">
          +{{ component.tags.length - 3 }}
        </span>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="card-footer">
      <div class="quick-actions">
        <button 
          @click.stop="handleQuickView" 
          class="quick-action-button"
          title="快速预览"
        >
          <span class="button-icon">👁️</span>
          <span class="button-text">预览</span>
        </button>
        <button 
          @click.stop="handleCompare" 
          class="quick-action-button"
          title="对比分析"
        >
          <span class="button-icon">🔍</span>
          <span class="button-text">对比</span>
        </button>
        <button 
          @click.stop="handleExport" 
          class="quick-action-button"
          title="导出报告"
        >
          <span class="button-icon">📄</span>
          <span class="button-text">导出</span>
        </button>
      </div>
    </div>

    <!-- 更新状态指示器 -->
    <div v-if="isUpdating" class="updating-overlay">
      <div class="updating-spinner"></div>
      <div class="updating-text">更新中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Props
interface Component {
  name: string;
  matchPercentage: number;
  status: string;
  lastUpdated: string;
  issueCount?: number;
  description?: string;
  thumbnailUrl?: string;
  tags?: string[];
}

interface Props {
  component: Component;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
});

// Emits
const emit = defineEmits<{
  click: [componentName: string];
  select: [componentName: string];
  refresh: [componentName: string];
  quickView: [componentName: string];
  compare: [componentName: string];
  export: [componentName: string];
}>();

// Reactive data
const isUpdating = ref(false);
const imageError = ref(false);

// Computed
const thumbnailUrl = computed(() => {
  if (imageError.value) return null;
  return props.component.thumbnailUrl || `/api/thumbnails/${props.component.name}.png`;
});

// Methods
const handleClick = () => {
  emit('click', props.component.name);
};

const handleSelect = () => {
  emit('select', props.component.name);
};

const handleRefresh = async () => {
  isUpdating.value = true;
  try {
    emit('refresh', props.component.name);
    // 模拟更新延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  } finally {
    isUpdating.value = false;
  }
};

const handleQuickView = () => {
  emit('quickView', props.component.name);
};

const handleCompare = () => {
  emit('compare', props.component.name);
};

const handleExport = () => {
  emit('export', props.component.name);
};

const handleImageError = () => {
  imageError.value = true;
};

const getStatusClass = (percentage: number): string => {
  if (percentage >= 95) return 'excellent';
  if (percentage >= 90) return 'good';
  if (percentage >= 80) return 'needs-improvement';
  return 'poor';
};

const getStatusIcon = (percentage: number): string => {
  if (percentage >= 95) return '🎯';
  if (percentage >= 90) return '✅';
  if (percentage >= 80) return '⚠️';
  return '❌';
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
</script>

<style scoped>
.component-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.component-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #d1d5db;
}

.component-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.component-card.updating {
  pointer-events: none;
}

/* 状态边框颜色 */
.component-card.status-excellent:hover { border-color: #10b981; }
.component-card.status-good:hover { border-color: #3b82f6; }
.component-card.status-needs-improvement:hover { border-color: #f59e0b; }
.component-card.status-poor:hover { border-color: #ef4444; }

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.selection-area {
  display: flex;
  align-items: center;
}

.selection-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-icon-button {
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-icon-button:hover {
  background: #e5e7eb;
}

.action-icon {
  font-size: 14px;
  display: inline-block;
  transition: transform 0.3s;
}

.action-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 预览区域 */
.card-preview {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.component-card:hover .preview-image {
  transform: scale(1.05);
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f3f4f6;
  color: #9ca3af;
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 14px;
  font-weight: 500;
}

.status-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  backdrop-filter: blur(4px);
  border: 2px solid white;
}

.status-overlay.status-excellent { background: rgba(16, 185, 129, 0.9); }
.status-overlay.status-good { background: rgba(59, 130, 246, 0.9); }
.status-overlay.status-needs-improvement { background: rgba(245, 158, 11, 0.9); }
.status-overlay.status-poor { background: rgba(239, 68, 68, 0.9); }

/* 卡片内容 */
.card-content {
  padding: 16px;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.component-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.match-percentage {
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.match-percentage.status-excellent { color: #10b981; }
.match-percentage.status-good { color: #3b82f6; }
.match-percentage.status-needs-improvement { color: #f59e0b; }
.match-percentage.status-poor { color: #ef4444; }

.component-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.component-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.stat-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  color: #1f2937;
  font-weight: 600;
}

.stat-value.status-text.status-excellent { color: #10b981; }
.stat-value.status-text.status-good { color: #3b82f6; }
.stat-value.status-text.status-needs-improvement { color: #f59e0b; }
.stat-value.status-text.status-poor { color: #ef4444; }

.stat-value.issue-count {
  color: #ef4444;
}

/* 进度条 */
.progress-section {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.status-excellent { background: #10b981; }
.progress-fill.status-good { background: #3b82f6; }
.progress-fill.status-needs-improvement { background: #f59e0b; }
.progress-fill.status-poor { background: #ef4444; }

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.progress-value {
  font-size: 11px;
  color: #1f2937;
  font-weight: 600;
}

/* 标签 */
.component-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
}

.tag {
  padding: 2px 6px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.tag.more-tags {
  background: #e5e7eb;
  color: #9ca3af;
}

/* 卡片底部 */
.card-footer {
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.quick-action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.button-icon {
  font-size: 12px;
}

.button-text {
  font-weight: 500;
}

/* 更新覆盖层 */
.updating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.updating-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.updating-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .match-percentage {
    align-self: flex-end;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-action-button {
    justify-content: flex-start;
  }
}
</style>