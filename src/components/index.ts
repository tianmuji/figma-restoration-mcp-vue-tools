/**
 * Figma Restored Components Library
 * Auto-register all Vue components from Figma designs
 */

// 🚀 自动导入所有组件 - 无需手动维护！
const componentModules = import.meta.glob<{ default: any }>('./*/index.vue', { eager: true })

// 自动提取组件名称和导出
const componentMap: Record<string, any> = {}

for (const path in componentModules) {
  const module = componentModules[path] as any
  const componentName = path.replace('./','').replace('/index.vue','')
  
  // 注册组件
  componentMap[componentName] = module.default
}

// 🎯 导出所有发现的组件
export const components = componentMap

// 📦 默认导出 - 自动包含所有组件
export default componentMap

// 🚀 Vue插件 - 自动注册所有组件
export const FigmaComponentsPlugin = {
  install(app: any) {
    // 自动注册所有组件
    Object.entries(componentMap).forEach(([name, component]) => {
      app.component(name, component)
    })
    
    console.log(`🎉 自动注册了 ${Object.keys(componentMap).length} 个Figma组件:`, Object.keys(componentMap))
  }
}

// 📊 导出组件信息
export const getComponentList = () => Object.keys(componentMap)
export const getComponentCount = () => Object.keys(componentMap).length

// 🔍 开发时调试信息
if (typeof window !== 'undefined') {
  console.log('📋 已发现的Figma组件:', Object.keys(componentMap))
}
