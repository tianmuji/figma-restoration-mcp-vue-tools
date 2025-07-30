<template>
  <div class="comparison-viewer">
    <!-- 头部导航 -->
    <header class="viewer-header">
      <button @click="goBack" class="back-btn">
        ← 返回
      </button>
      <h1 class="viewer-title">{{ componentName }} - 对比分析</h1>
      <div class="header-actions">
        <button @click="goToComponent" class="view-btn">
          查看组件
        </button>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载对比数据中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadComparisonData" class="retry-btn">重试</button>
    </div>

    <!-- 对比内容 -->
    <main v-else-if="comparisonData" class="comparison-content">
      <!-- 对比图像 -->
      <section class="image-comparison">
        <div class="comparison-grid">
          <!-- 原始图像 -->
          <div class="image-panel">
            <h3>Figma 原图</h3>
            <div class="image-container">
              <img 
                v-if="comparisonData.originalImage" 
                :src="comparisonData.originalImage" 
                alt="Figma 原图"
                class="comparison-image"
              />
              <div v-else class="image-placeholder">
                <span>原图不可用</span>
              </div>
            </div>
          </div>

          <!-- 渲染图像 -->
          <div class="image-panel">
            <h3>Vue 渲染</h3>
            <div class="image-container">
              <img 
                v-if="comparisonData.renderedImage" 
                :src="comparisonData.renderedImage" 
                alt="Vue 渲染图"
                class="comparison-image"
              />
              <div v-else class="image-placeholder">
                <span>渲染图不可用</span>
              </div>
            </div>
          </div>

          <!-- 差异图像 -->
          <div class="image-panel">
            <h3>差异对比</h3>
            <div class="image-container">
              <img 
                v-if="comparisonData.diffImage" 
                :src="comparisonData.diffImage" 
                alt="差异图"
                class="comparison-image"
              />
              <div v-else class="image-placeholder">
                <span>差异图不可用</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 对比指标 -->
      <section class="metrics-section">
        <h2>对比指标</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value" :class="getSimilarityClass(comparisonData.similarity)">
              {{ Math.round(comparisonData.similarity * 100) }}%
            </div>
            <div class="metric-label">相似度</div>
          </div>
          
          <div v-if="comparisonData.restorationRatio" class="metric-card">
            <div class="metric-value" :class="getRestorationClass(comparisonData.restorationRatio)">
              {{ Math.round(comparisonData.restorationRatio * 100) }}%
            </div>
            <div class="metric-label">还原度</div>
          </div>

          <div v-if="comparisonData.metrics?.pixelDifference" class="metric-card">
            <div class="metric-value">
              {{ comparisonData.metrics.pixelDifference }}
            </div>
            <div class="metric-label">像素差异</div>
          </div>

          <div v-if="comparisonData.metrics?.structuralSimilarity" class="metric-card">
            <div class="metric-value">
              {{ Math.round(comparisonData.metrics.structuralSimilarity * 100) }}%
            </div>
            <div class="metric-label">结构相似度</div>
          </div>
        </div>
      </section>

      <!-- 详细分析 -->
      <section v-if="comparisonData.analysis" class="analysis-section">
        <h2>详细分析</h2>
        <div class="analysis-content">
          <div v-if="comparisonData.analysis.majorDifferences?.length" class="analysis-item">
            <h3>主要差异</h3>
            <ul class="difference-list">
              <li v-for="diff in comparisonData.analysis.majorDifferences" :key="diff">
                {{ diff }}
              </li>
            </ul>
          </div>

          <div v-if="comparisonData.analysis.suggestions?.length" class="analysis-item">
            <h3>改进建议</h3>
            <ul class="suggestion-list">
              <li v-for="suggestion in comparisonData.analysis.suggestions" :key="suggestion">
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <div v-if="comparisonData.analysis.confidence" class="analysis-item">
            <h3>分析置信度</h3>
            <div class="confidence-bar">
              <div 
                class="confidence-fill" 
                :style="{ width: comparisonData.analysis.confidence * 100 + '%' }"
              ></div>
            </div>
            <span class="confidence-text">
              {{ Math.round(comparisonData.analysis.confidence * 100) }}%
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- 无数据状态 -->
    <div v-else class="no-data-state">
      <div class="no-data-icon">📊</div>
      <h3>暂无对比数据</h3>
      <p>组件 "{{ componentName }}" 还没有对比分析数据</p>
      <button @click="goToComponent" class="view-component-btn">查看组件</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

// 响应式数据
const loading = ref(true)
const error = ref(null)
const comparisonData = ref(null)

// 计算属性
const componentName = computed(() => props.name || route.params.name)

// 方法
const loadComparisonData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/src/components/${componentName.value}/results/comparison-report.json`)
    
    if (!response.ok) {
      throw new Error('对比数据不存在')
    }

    const data = await response.json()
    
    // 处理图像路径
    if (data.originalImage && !data.originalImage.startsWith('http')) {
      data.originalImage = `/src/components/${componentName.value}/results/${data.originalImage}`
    }
    if (data.renderedImage && !data.renderedImage.startsWith('http')) {
      data.renderedImage = `/src/components/${componentName.value}/results/${data.renderedImage}`
    }
    if (data.diffImage && !data.diffImage.startsWith('http')) {
      data.diffImage = `/src/components/${componentName.value}/results/${data.diffImage}`
    }

    comparisonData.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

const goToComponent = () => {
  router.push(`/component/${componentName.value}`)
}

const getSimilarityClass = (similarity) => {
  if (similarity >= 0.9) return 'excellent'
  if (similarity >= 0.8) return 'good'
  if (similarity >= 0.6) return 'fair'
  return 'poor'
}

const getRestorationClass = (ratio) => {
  if (ratio >= 0.9) return 'excellent'
  if (ratio >= 0.8) return 'good'
  if (ratio >= 0.6) return 'fair'
  return 'poor'
}

// 生命周期
onMounted(() => {
  loadComparisonData()
})
</script>

<style scoped>
.comparison-viewer {
  min-height: 100vh;
  background: #f9fafb;
}

.viewer-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn, .view-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover, .view-btn:hover {
  background: #e5e7eb;
}

.view-btn {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.view-btn:hover {
  background: #2563eb;
}

.viewer-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.loading-state, .error-state, .no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #6b7280;
}

.loading-spinner {
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

.error-icon, .no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn, .view-component-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-top: 16px;
  transition: all 0.2s;
}

.retry-btn:hover, .view-component-btn:hover {
  background: #2563eb;
}

.comparison-content {
  padding: 24px;
}

.image-comparison {
  margin-bottom: 40px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.image-panel h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.image-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.comparison-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-placeholder {
  color: #6b7280;
  font-style: italic;
}

.metrics-section, .analysis-section {
  margin-bottom: 40px;
}

.metrics-section h2, .analysis-section h2 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.metric-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  text-align: center;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.metric-value.excellent {
  color: #065f46;
}

.metric-value.good {
  color: #1e40af;
}

.metric-value.fair {
  color: #92400e;
}

.metric-value.poor {
  color: #991b1b;
}

.metric-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.analysis-content {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.analysis-item {
  margin-bottom: 24px;
}

.analysis-item:last-child {
  margin-bottom: 0;
}

.analysis-item h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.difference-list, .suggestion-list {
  margin: 0;
  padding-left: 20px;
}

.difference-list li, .suggestion-list li {
  margin-bottom: 8px;
  color: #374151;
  line-height: 1.5;
}

.confidence-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.confidence-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.confidence-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .viewer-header {
    padding: 12px 16px;
  }
  
  .viewer-title {
    font-size: 20px;
  }
  
  .comparison-content {
    padding: 16px;
  }
  
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .viewer-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .viewer-title {
    text-align: center;
  }
}
</style>