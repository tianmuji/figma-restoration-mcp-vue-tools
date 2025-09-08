/**
 * Simple Figma Components Registry
 * 简化的Figma组件注册系统
 * 
 * 自动发现和注册组件，支持热更新
 */

// 🚀 自动导入所有组件 - 简单高效
const componentModules = (import.meta as any).glob('./*/index.vue', { eager: true })

// 自动提取组件名称和导出
const componentMap: Record<string, any> = {}

// 处理组件注册
for (const path in componentModules) {
  const module = componentModules[path] as any
  const componentName = path.replace('./','').replace('/index.vue','')
  
  // 简单验证组件名称
  if (componentName && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(componentName)) {
    componentMap[componentName] = module.default
  } else {
    console.warn(`⚠️ 跳过无效组件名称: ${componentName}`)
  }
}


// 🎯 导出所有发现的组件
export const components = componentMap

// 📦 默认导出 - 自动包含所有组件
export default componentMap

// 🚀 简化的Vue插件 - 自动注册所有组件
export const FigmaComponentsPlugin = {
  install(app: any) {
    // 自动注册所有组件
    Object.entries(componentMap).forEach(([name, component]) => {
      app.component(name, component)
    })
    
    console.log(`🎉 自动注册了 ${Object.keys(componentMap).length} 个Figma组件:`, Object.keys(componentMap))
  }
}

// 📊 导出组件信息函数
export const getComponentList = (): string[] => Object.keys(componentMap)
export const getComponentCount = (): number => Object.keys(componentMap).length

// 🔍 开发时调试信息
if (typeof window !== 'undefined') {
  console.log('📋 已发现的Figma组件:', Object.keys(componentMap))
}
