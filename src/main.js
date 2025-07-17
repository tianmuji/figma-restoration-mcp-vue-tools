import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// 动态导入所有组件
const componentModules = import.meta.glob('./components/*/index.vue', { eager: true })

// 创建路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/component/:component',
    name: 'ComponentView',
    component: () => import('./views/ComponentView.vue'),
    beforeEnter: (to, from, next) => {
      // 如果是智能组件，重定向到智能组件视图
      if (to.params.component?.endsWith('-Smart')) {
        next({ name: 'SmartComponentView', params: to.params })
      } else {
        next()
      }
    }
  },
  {
    path: '/smart/:component',
    name: 'SmartComponentView',
    component: () => import('./views/SmartComponentView.vue')
  },
  {
    path: '/screenshot/:component',
    name: 'ScreenshotView',
    component: () => import('./views/ScreenshotView.vue')
  },
  {
    path: '/report/:component',
    name: 'ComparisonReport',
    component: () => import('./views/ComparisonReport.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
