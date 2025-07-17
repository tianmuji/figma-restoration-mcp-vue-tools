<template>
  <div class="component-view">
    <div class="nav-bar">
      <h2>Component: {{ componentName }}</h2>
      <div class="nav-actions">
        <router-link to="/" class="back-link">← Back to Home</router-link>
        <router-link :to="`/report/${componentName}`" class="report-link">View Report</router-link>
      </div>
    </div>
    
    <div 
      id="benchmark-container-for-screenshot"
      class="component-container"
    >
      <component 
        v-if="currentComponent" 
        :is="currentComponent" 
      />
      <div v-else class="error">
        Component "{{ componentName }}" not found
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentView',
  data() {
    return {
      currentComponent: null
    }
  },
  computed: {
    componentName() {
      return this.$route.params.component
    }
  },
  async mounted() {
    await this.loadComponent()
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
        const componentName = this.componentName
        if (componentName) {
          let modulePath = `../components/${componentName}/index.vue`

          // 处理特殊版本的组件
          if (componentName.endsWith('-Smart')) {
            const baseName = componentName.replace('-Smart', '')
            modulePath = `../components/${baseName}/smart-index.vue`
          } else if (componentName.endsWith('-Optimized')) {
            const baseName = componentName.replace('-Optimized', '')
            modulePath = `../components/${baseName}/optimized-index.vue`
          } else if (componentName.endsWith('-Ultra')) {
            const baseName = componentName.replace('-Ultra', '')
            modulePath = `../components/${baseName}/ultra-optimized-index.vue`
          } else if (componentName.endsWith('-99')) {
            const baseName = componentName.replace('-99', '')
            modulePath = `../components/${baseName}/final-99-index.vue`
          }

          // 动态导入组件
          const module = await import(/* @vite-ignore */ modulePath)
          this.currentComponent = module.default
        }
      } catch (error) {
        console.error('Failed to load component:', error)
        this.currentComponent = null
      }
    }
  }
}
</script>

<style scoped>
.component-view {
  min-height: 100vh;
  background-color: transparent;
  margin: 0;
  padding: 0;
}

.nav-bar {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-bar h2 {
  margin: 0;
  color: #1a1a1a;
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.back-link, .report-link {
  color: #3b82f6;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-link:hover, .report-link:hover {
  background-color: #3b82f6;
  color: white;
}

.component-container {
  display: inline-block;
  padding: 0;
  margin: 0;
  background-color: transparent;
  /* Remove min-height for better screenshot sizing */
}

.error {
  color: #ef4444;
  font-size: 18px;
  text-align: center;
}
</style>
