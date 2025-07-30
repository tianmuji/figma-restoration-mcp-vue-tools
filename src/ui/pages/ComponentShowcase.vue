<template>
  <div class="component-showcase">
    <!-- 头部 -->
    <header class="showcase-header">
      <h1>Figma 组件展示</h1>
      <div class="header-stats">
        <span class="stat">{{ componentCount }} 个组件</span>
        <span class="stat" v-if="componentsWithComparison > 0">
          {{ componentsWithComparison }} 个有对比数据
        </span>
      </div>
    </header>

    <!-- 搜索和过滤 -->
    <div class="showcase-filters">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索组件..."
          class="search-input"
        />
      </div>
      <div class="filter-options">
        <button 
          :class="{ active: showAll }" 
          @click="showAll = true"
          class="filter-btn"
        >
          全部
        </button>
        <button 
          :class="{ active: !showAll }" 
          @click="showAll = false"
          class="filter-btn"
        >
          有对比数据
        </button>
      </div>
    </div>

    <!-- 组件网格 -->
    <div class="components-grid">
      <ComponentCard
        v-for="component in filteredComponents"
        :key="component.name"
        :component="component"
        @click="viewComponent(component.name)"
        @compare="compareComponent(component.name)"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="filteredComponents.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>没有找到组件</h3>
      <p v-if="searchQuery">尝试调整搜索条件</p>
      <p v-else>请在 src/components 目录下添加组件</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getComponentList } from '@/components'
import ComponentCard from '../components/ComponentCard.vue'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const showAll = ref(true)
const components = ref([])

// 计算属性
const componentCount = computed(() => components.value.length)

const componentsWithComparison = computed(() => 
  components.value.filter(c => c.hasComparison).length
)

const filteredComponents = computed(() => {
  let filtered = components.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(component => 
      component.name.toLowerCase().includes(query) ||
      (component.description && component.description.toLowerCase().includes(query))
    )
  }

  // 对比数据过滤
  if (!showAll.value) {
    filtered = filtered.filter(component => component.hasComparison)
  }

  return filtered
})

// 方法
const loadComponents = async () => {
  try {
    const componentNames = getComponentList()
    
    // 为每个组件创建基本信息
    const componentData = await Promise.all(
      componentNames.map(async (name) => {
        const component = {
          name,
          description: `${name} 组件`,
          hasComparison: false,
          comparisonData: null,
          metadata: null
        }

        // 尝试加载元数据
        try {
          const metadataResponse = await fetch(`/src/components/${name}/metadata.json`)
          if (metadataResponse.ok) {
            component.metadata = await metadataResponse.json()
            component.description = component.metadata.description || component.description
          }
        } catch (error) {
          // 元数据加载失败，使用默认值
        }

        // 检查是否有还原度数据（从metadata.json中读取）
        if (component.metadata && component.metadata.restorationData) {
          component.hasComparison = true
          component.comparisonData = {
            similarity: component.metadata.restorationData.matchPercentage / 100,
            matchPercentage: component.metadata.restorationData.matchPercentage
          }
          console.log(`✅ 从metadata.json加载 ${name} 的还原度数据:`, component.metadata.restorationData.matchPercentage)
        } else {
          // 如果没有还原度数据，检查是否有diff.png作为备用
          try {
            const diffResponse = await fetch(`/src/components/${name}/results/diff.png`)
            if (diffResponse.ok) {
              component.hasComparison = true
              component.comparisonData = {
                similarity: 0, // 需要更新metadata.json获取真实数据
                matchPercentage: 0
              }
              console.log(`⚠️ ${name} 有diff.png但metadata.json中缺少restorationData，需要更新metadata`)
            }
          } catch (error) {
            // 对比数据加载失败，使用默认值
            console.log(`${name} 对比数据加载失败:`, error)
          }
        }

        return component
      })
    )

    components.value = componentData
    console.log(`✅ 加载了 ${componentData.length} 个组件`)
  } catch (error) {
    console.error('❌ 加载组件失败:', error)
  }
}

const viewComponent = (componentName) => {
  router.push(`/component/${componentName}`)
}

const compareComponent = (componentName) => {
  router.push(`/comparison/${componentName}`)
}

// 生命周期
onMounted(() => {
  loadComponents()
})
</script>

<style scoped>
.component-showcase {
  min-height: 100vh;
  background: #f9fafb;
  padding: 20px;
}

.showcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.showcase-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat {
  background: #e5e7eb;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.showcase-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-options {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f3f4f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 0 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-showcase {
    padding: 15px;
  }
  
  .showcase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .showcase-filters {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .components-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }
}
</style>