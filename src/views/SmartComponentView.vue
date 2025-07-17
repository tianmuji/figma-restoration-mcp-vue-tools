<template>
  <div class="smart-component-view">
    <div class="header">
      <h1>智能组件预览: {{ componentName }}</h1>
      <div class="info">
        <span class="badge">基于Figma JSON数据分析</span>
        <span class="badge">Flex布局</span>
        <span class="badge">素材自动下载</span>
      </div>
    </div>
    
    <div class="content">
      <div class="component-container" id="smart-component-container">
        <component 
          v-if="currentComponent" 
          :is="currentComponent"
          @close="handleClose"
          @cancel="handleCancel" 
          @confirm="handleConfirm"
        />
        <div v-else class="error">
          智能组件 "{{ componentName }}" 加载失败
        </div>
      </div>
      
      <div class="analysis-panel">
        <h3>分析结果</h3>
        <div v-if="analysis" class="analysis-content">
          <div class="stat-item">
            <span class="label">素材:</span>
            <span class="value">{{ analysis.materials?.length || 0 }} 个</span>
          </div>
          <div class="stat-item">
            <span class="label">图标:</span>
            <span class="value">{{ analysis.icons?.length || 0 }} 个</span>
          </div>
          <div class="stat-item">
            <span class="label">布局节点:</span>
            <span class="value">{{ countNodes(analysis.layout) }} 个</span>
          </div>
          
          <div v-if="analysis.icons?.length > 0" class="icons-list">
            <h4>图标列表:</h4>
            <ul>
              <li v-for="icon in analysis.icons" :key="icon.nodeId">
                {{ icon.name }} ({{ icon.nodeId }})
              </li>
            </ul>
          </div>
          
          <div v-if="analysis.materials?.length > 0" class="materials-list">
            <h4>素材列表:</h4>
            <ul>
              <li v-for="material in analysis.materials" :key="material.nodeId">
                {{ material.name }} ({{ material.nodeId }})
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="no-analysis">
          未找到分析数据
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmartComponentView',
  data() {
    return {
      currentComponent: null,
      analysis: null
    }
  },
  computed: {
    componentName() {
      return this.$route.params.component
    },
    baseComponentName() {
      // 移除 -Smart 后缀
      return this.componentName?.replace('-Smart', '') || ''
    }
  },
  async mounted() {
    await this.loadComponent()
    await this.loadAnalysis()
  },
  watch: {
    '$route.params.component': {
      handler: 'loadComponent',
      immediate: true
    }
  },
  methods: {
    async loadComponent() {
      try {
        const componentName = this.baseComponentName
        if (componentName) {
          // 加载智能组件
          const module = await import(`../components/${componentName}/smart-index.vue`)
          this.currentComponent = module.default
        }
      } catch (error) {
        console.error('Failed to load smart component:', error)
        this.currentComponent = null
      }
    },
    
    async loadAnalysis() {
      try {
        const componentName = this.baseComponentName
        if (componentName) {
          // 加载分析数据
          const response = await fetch(`/results/${componentName}/smart-analysis.json`)
          if (response.ok) {
            this.analysis = await response.json()
          }
        }
      } catch (error) {
        console.error('Failed to load analysis:', error)
        this.analysis = null
      }
    },
    
    countNodes(node) {
      if (!node) return 0
      let count = 1
      if (node.children) {
        for (const child of node.children) {
          count += this.countNodes(child)
        }
      }
      return count
    },
    
    handleClose() {
      console.log('Close event received')
    },
    
    handleCancel() {
      console.log('Cancel event received')
    },
    
    handleConfirm() {
      console.log('Confirm event received')
    }
  }
}
</script>

<style scoped>
.smart-component-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  color: #333;
  margin-bottom: 10px;
}

.info {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.component-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.analysis-panel {
  width: 300px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.analysis-panel h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.icons-list,
.materials-list {
  margin-top: 15px;
}

.icons-list h4,
.materials-list h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.icons-list ul,
.materials-list ul {
  margin: 0;
  padding-left: 20px;
}

.icons-list li,
.materials-list li {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.error {
  color: #ef4444;
  font-size: 18px;
  text-align: center;
}

.no-analysis {
  color: #999;
  font-style: italic;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  
  .analysis-panel {
    width: 100%;
  }
}
</style>
