<template>
  <div class="dynamic-component-page">
    <!-- 头部导航 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">
        ← 返回
      </button>
      <h1 class="page-title">{{ componentName }}</h1>
      <div class="header-actions">
        <button 
          v-if="hasComparison" 
          @click="goToComparison" 
          class="compare-btn"
        >
          查看对比
        </button>
      </div>
    </header>

    <!-- 组件展示区域 -->
    <main class="component-display">
      <div class="display-container">
        <div class="component-wrapper">
          <component 
            :is="componentName" 
            v-if="componentExists"
            class="displayed-component"
          />
          <div v-else class="component-error">
            <div class="error-icon">⚠️</div>
            <h3>组件未找到</h3>
            <p>组件 "{{ componentName }}" 不存在或无法加载</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 组件信息面板 -->
    <aside class="info-panel">
      <div class="panel-section">
        <h3>组件信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">名称:</span>
            <span class="info-value">{{ componentName }}</span>
          </div>
          <div v-if="metadata" class="info-item">
            <span class="info-label">描述:</span>
            <span class="info-value">{{ metadata.description || '无描述' }}</span>
          </div>
          <div v-if="metadata?.dimensions" class="info-item">
            <span class="info-label">尺寸:</span>
            <span class="info-value">
              {{ metadata.dimensions.width }}×{{ metadata.dimensions.height }}px
            </span>
          </div>
          <div v-if="metadata?.figmaNodeId" class="info-item">
            <span class="info-label">Figma ID:</span>
            <span class="info-value">{{ metadata.figmaNodeId }}</span>
          </div>
          <div v-if="metadata?.version" class="info-item">
            <span class="info-label">版本:</span>
            <span class="info-value">{{ metadata.version }}</span>
          </div>
        </div>
      </div>

      <div v-if="hasComparison" class="panel-section">
        <h3>对比摘要</h3>
        <div class="comparison-summary">
          <div class="summary-item">
            <span class="summary-label">还原度:</span>
            <span class="summary-value" :class="getRestorationClass(getRestorationPercentage())">
              {{ getRestorationPercentage() }}%
            </span>
          </div>
          <div v-if="comparisonData.diffPixels" class="summary-item">
            <span class="summary-label">差异像素:</span>
            <span class="summary-value">{{ comparisonData.diffPixels.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 对比图像展示 -->
      <div v-if="hasComparison" class="panel-section">
        <h3>对比图像</h3>
        <div class="comparison-images">
          <!-- 预期图像 -->
          <div class="image-item">
            <h4>预期 (Figma)</h4>
            <div class="image-container">
              <img 
                v-if="expectedImageUrl && imageLoadingStates.expected" 
                :src="expectedImageUrl" 
                alt="Figma 预期图"
                class="comparison-image"
                @error="imageLoadingStates.expected = false"
              />
              <div v-else class="image-placeholder">
                <span>{{ imageLoadingStates.expected === false ? '预期图加载失败' : '预期图不可用' }}</span>
              </div>
            </div>
          </div>

          <!-- 实际图像 -->
          <div class="image-item">
            <h4>实际 (Vue)</h4>
            <div class="image-container">
              <img 
                v-if="actualImageUrl && imageLoadingStates.actual" 
                :src="actualImageUrl" 
                alt="Vue 实际图"
                class="comparison-image"
                @error="imageLoadingStates.actual = false"
              />
              <div v-else class="image-placeholder">
                <span>{{ imageLoadingStates.actual === false ? '实际图加载失败' : '实际图不可用' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { components } from '@/components'

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
const metadata = ref(null)
const comparisonData = ref(null)

// 计算属性
const componentName = computed(() => props.name || route.params.name)

const componentExists = computed(() => {
  return components[componentName.value] !== undefined
})

const hasComparison = computed(() => {
  return comparisonData.value !== null
})

// 图像URL计算属性
const expectedImageUrl = computed(() => {
  if (!hasComparison.value) return null
  return `/src/components/${componentName.value}/results/expected.png`
})

const actualImageUrl = computed(() => {
  if (!hasComparison.value) return null
  return `/src/components/${componentName.value}/results/actual.png`
})

// 添加图像加载状态
const imageLoadingStates = ref({
  expected: false,
  actual: false
})

// 验证图像是否可访问
const validateImages = async () => {
  if (!hasComparison.value) return
  
  const images = [
    { key: 'expected', url: expectedImageUrl.value },
    { key: 'actual', url: actualImageUrl.value }
  ]
  
  for (const image of images) {
    try {
      const response = await fetch(image.url)
      imageLoadingStates.value[image.key] = response.ok
      console.log(`${image.key} image accessible:`, response.ok)
    } catch (error) {
      imageLoadingStates.value[image.key] = false
      console.error(`${image.key} image not accessible:`, error)
    }
  }
}

// 方法
const loadComponentData = async () => {
  try {
    // 加载元数据
    const metadataResponse = await fetch(`/src/components/${componentName.value}/metadata.json`)
    if (metadataResponse.ok) {
      metadata.value = await metadataResponse.json()
    }
  } catch (error) {
    console.log('元数据加载失败:', error)
  }

  // 检查是否有还原度数据（从metadata.json中读取）
  if (metadata.value && metadata.value.restorationData) {
    comparisonData.value = {
      matchPercentage: metadata.value.restorationData.matchPercentage,
      diffPixels: metadata.value.restorationData.diffPixels,
      totalPixels: metadata.value.restorationData.totalPixels,
      dimensions: metadata.value.restorationData.dimensions,
      timestamp: metadata.value.restorationData.timestamp
    }
    console.log('✅ 从metadata.json加载还原度数据:', comparisonData.value)
  } else {
    // 如果没有还原度数据，检查是否有diff.png作为备用
    const diffPath = `/src/components/${componentName.value}/results/diff.png`
    try {
      const diffResponse = await fetch(diffPath)
      if (diffResponse.ok) {
        comparisonData.value = {
          matchPercentage: 0, // 需要更新metadata.json获取真实数据
          diffPixels: 0,
          totalPixels: 0,
          dimensions: { width: 0, height: 0 }
        }
        console.log('⚠️ 发现diff.png但metadata.json中缺少restorationData，需要更新metadata')
      }
    } catch (error) {
      console.log('对比数据加载失败:', error)
    }
  }
  
  // 验证图像是否可访问
  await validateImages()
}

const goBack = () => {
  router.push('/')
}

const goToComparison = () => {
  router.push(`/comparison/${componentName.value}`)
}

const getSimilarityClass = (similarity) => {
  if (similarity >= 0.9) return 'excellent'
  if (similarity >= 0.8) return 'good'
  if (similarity >= 0.6) return 'fair'
  return 'poor'
}

const getRestorationPercentage = () => {
  if (!comparisonData.value) return 0
  
  // 优先使用 matchPercentage，如果没有则使用 similarity
  if (comparisonData.value.matchPercentage !== undefined) {
    return Math.round(comparisonData.value.matchPercentage)
  }
  
  if (comparisonData.value.similarity !== undefined) {
    return Math.round(comparisonData.value.similarity * 100)
  }
  
  return 0
}

const getRestorationClass = (percentage) => {
  if (percentage >= 99) return 'excellent'
  if (percentage >= 95) return 'good'
  if (percentage >= 90) return 'fair'
  return 'poor'
}

// 生命周期
onMounted(() => {
  loadComponentData()
})
</script>

<style scoped>
.dynamic-component-page {
  min-height: 100vh;
  display: grid;
  grid-template-areas: 
    "header header"
    "main sidebar";
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  background: #f9fafb;
}

.page-header {
  grid-area: header;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e5e7eb;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.compare-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.compare-btn:hover {
  background: #2563eb;
}

.component-display {
  grid-area: main;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.display-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 40px;
  min-width: 400px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.displayed-component {
  max-width: 100%;
  max-height: 100%;
}

.component-error {
  text-align: center;
  color: #6b7280;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.component-error h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.component-error p {
  margin: 0;
  font-size: 14px;
}

.info-panel {
  grid-area: sidebar;
  background: white;
  border-left: 1px solid #e5e7eb;
  padding: 24px;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 32px;
}

.panel-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 14px;
  color: #374151;
  word-break: break-all;
}

.comparison-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.summary-value.excellent {
  background: #d1fae5;
  color: #065f46;
}

.summary-value.good {
  background: #dbeafe;
  color: #1e40af;
}

.summary-value.fair {
  background: #fef3c7;
  color: #92400e;
}

.summary-value.poor {
  background: #fee2e2;
  color: #991b1b;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dynamic-component-page {
    grid-template-areas: 
      "header"
      "main"
      "sidebar";
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
  
  .info-panel {
    border-left: none;
    border-top: 1px solid #e5e7eb;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .component-display {
    padding: 20px;
  }
  
  .display-container {
    padding: 20px;
    min-width: auto;
    min-height: 200px;
  }
  
  .info-panel {
    padding: 16px;
  }
}

/* 对比图像样式 */
.comparison-images {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.image-item h4 {
  margin: 0;
  padding: 8px 12px;
  background: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.image-container {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  overflow: hidden;
}

.comparison-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 12px;
}
</style>