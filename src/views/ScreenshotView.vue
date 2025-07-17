<template>
  <div class="screenshot-view">
    <div 
      id="component-screenshot-container"
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
  name: 'ScreenshotView',
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
          const module = await import(modulePath)
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
.screenshot-view {
  /* 移除所有外边距和内边距 */
  margin: 0;
  padding: 0;
  /* 确保容器能够适应内容 */
  display: inline-block;
  min-width: 100vw;
  min-height: 100vh;
  background: transparent;
}

.component-container {
  /* 移除所有样式限制，让组件自然渲染 */
  display: inline-block;
  margin: 0;
  padding: 0;
  background: transparent;
  /* 确保容器不会限制组件尺寸 */
  width: auto;
  height: auto;
  min-width: 0;
  min-height: 0;
}

.error {
  color: #ef4444;
  font-size: 18px;
  text-align: center;
  padding: 20px;
}

/* 特殊处理模态框组件 */
.screenshot-view :deep(.modal-overlay) {
  /* 将fixed定位改为relative，确保在截图中可见 */
  position: relative !important;
  width: auto !important;
  height: auto !important;
  background: transparent !important;
  display: inline-block !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
}

/* 确保移动端组件正确显示 */
.screenshot-view :deep(.exchange-success-page) {
  position: relative !important;
  display: inline-block !important;
}

/* 确保桌面端组件正确显示 */
.screenshot-view :deep(.assignment-complete-page) {
  position: relative !important;
  display: inline-block !important;
}

/* 确保统计组件正确显示 */
.screenshot-view :deep(.scan-complete-container) {
  position: relative !important;
  display: inline-block !important;
}
</style>
