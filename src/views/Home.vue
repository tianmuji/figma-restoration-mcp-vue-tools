<template>
  <div class="home">
    <h1>MCP Vue Component Renderer</h1>
    <p>Available Components:</p>
    <div class="components-grid">
      <div v-for="component in components" :key="component" class="component-card">
        <h3>{{ component }}</h3>
        <div class="component-actions">
          <router-link :to="`/component/${component}`" class="action-btn primary">
            View Component
          </router-link>
          <router-link :to="`/report/${component}`" class="action-btn secondary">
            View Report
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      components: []
    }
  },
  mounted() {
    // 获取所有可用的组件
    this.loadComponents()
  },
  methods: {
    async loadComponents() {
      try {
        // 动态获取所有组件
        const componentModules = import.meta.glob('../components/*/index.vue')
        const componentNames = Object.keys(componentModules).map(path => {
          const match = path.match(/\.\.\/components\/(.+)\/index\.vue$/)
          return match ? match[1] : null
        }).filter(Boolean)

        this.components = componentNames.sort()
      } catch (error) {
        console.error('Failed to load components:', error)
        // 回退到硬编码列表
        this.components = [
          'DesignV1',
          'DesignV2',
          'RedemptionSuccess',
          'ModalRemoveMember',
          'ModalRemoveMember-Smart',
          'ExchangeSuccess',
          'ExchangeSuccess-Optimized',
          'ExchangeSuccess-Ultra',
          'AssignmentComplete',
          'AssignmentComplete-Optimized',
          'AssignmentComplete-Ultra',
          'AssignmentComplete-99',
          'ScanComplete',
          'ScanResult',
          'ExchangeSuccess-Ultra',
          'ExchangeSuccess-Minimal'
        ]
      }
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.home h1 {
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 32px;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.component-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
}

.component-card h3 {
  margin: 0 0 16px 0;
  color: #374151;
  text-align: center;
}

.component-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
  flex: 1;
}

.action-btn.primary {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.action-btn.primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.action-btn.secondary {
  background-color: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.action-btn.secondary:hover {
  background-color: #f0f9ff;
}
</style>
