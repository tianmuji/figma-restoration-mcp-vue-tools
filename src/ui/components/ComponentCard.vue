<template>
  <div class="component-card" @click="$emit('click')">
    <!-- 组件预览区域 -->
    <div class="card-preview">
      <div class="preview-container">
        <component 
          :is="componentName" 
          v-if="componentExists"
          class="component-preview"
        />
        <div v-else class="preview-placeholder">
          <div class="placeholder-icon">🎨</div>
          <span>{{ componentName }}</span>
        </div>
      </div>
      
      <!-- 对比状态指示器 -->
      <div v-if="component.hasComparison" class="comparison-badge">
        <span class="badge-icon">📊</span>
        <span class="badge-text">
          {{ getRestorationPercentage(component.comparisonData) }}%
        </span>
      </div>
    </div>

    <!-- 组件信息 -->
    <div class="card-info">
      <h3 class="component-name">{{ component.name }}</h3>
      <p class="component-description">{{ component.description }}</p>
      
      <!-- 元数据信息 -->
      <div v-if="component.metadata" class="metadata-info">
        <div v-if="component.metadata.dimensions" class="metadata-item">
          <span class="metadata-label">尺寸:</span>
          <span class="metadata-value">
            {{ component.metadata.dimensions.width }}×{{ component.metadata.dimensions.height }}px
          </span>
        </div>
        <div v-if="component.metadata.figmaNodeId" class="metadata-item">
          <span class="metadata-label">Figma ID:</span>
          <span class="metadata-value">{{ component.metadata.figmaNodeId }}</span>
        </div>
      </div>

      <!-- 对比结果摘要 -->
      <div v-if="component.comparisonData" class="comparison-summary">
        <div class="similarity-score">
          <span class="score-label">相似度:</span>
          <span class="score-value" :class="getSimilarityClass(component.comparisonData.similarity)">
            {{ Math.round(component.comparisonData.similarity * 100) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions">
      <button 
        @click.stop="$emit('click')" 
        class="action-btn primary"
      >
        查看
      </button>
      <button 
        v-if="component.hasComparison"
        @click.stop="$emit('compare')" 
        class="action-btn secondary"
      >
        对比
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { components } from '@/components'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'compare'])

// 计算属性
const componentName = computed(() => props.component.name)

const componentExists = computed(() => {
  return components[props.component.name] !== undefined
})

// 方法
const getSimilarityClass = (similarity) => {
  if (similarity >= 0.9) return 'excellent'
  if (similarity >= 0.8) return 'good'
  if (similarity >= 0.6) return 'fair'
  return 'poor'
}

const getRestorationPercentage = (comparisonData) => {
  if (!comparisonData) return 0
  
  // 优先使用 matchPercentage，如果没有则使用 similarity
  if (comparisonData.matchPercentage !== undefined) {
    return Math.round(comparisonData.matchPercentage)
  }
  
  if (comparisonData.similarity !== undefined) {
    return Math.round(comparisonData.similarity * 100)
  }
  
  return 0
}
</script>

<style scoped>
.component-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.component-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.card-preview {
  position: relative;
  height: 200px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e5e7eb;
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.component-preview {
  max-width: 100%;
  max-height: 100%;
  transform-origin: center;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.placeholder-icon {
  font-size: 32px;
}

.comparison-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-icon {
  font-size: 10px;
}

.card-info {
  padding: 16px;
}

.component-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.component-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.metadata-info {
  margin-bottom: 12px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 4px;
}

.metadata-label {
  color: #6b7280;
  font-weight: 500;
}

.metadata-value {
  color: #374151;
  font-family: monospace;
}

.comparison-summary {
  margin-bottom: 12px;
}

.similarity-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.score-value {
  font-size: 14px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.score-value.excellent {
  background: #d1fae5;
  color: #065f46;
}

.score-value.good {
  background: #dbeafe;
  color: #1e40af;
}

.score-value.fair {
  background: #fef3c7;
  color: #92400e;
}

.score-value.poor {
  background: #fee2e2;
  color: #991b1b;
}

.card-actions {
  padding: 12px 16px;
  background: #f9fafb;
  display: flex;
  gap: 8px;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #f3f4f6;
  color: #374151;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .card-preview {
    height: 150px;
  }
  
  .preview-container {
    padding: 15px;
  }
  
  .card-info {
    padding: 12px;
  }
  
  .component-name {
    font-size: 16px;
  }
  
  .card-actions {
    padding: 10px 12px;
  }
}
</style>