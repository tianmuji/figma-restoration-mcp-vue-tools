import { createRouter, createWebHistory } from 'vue-router';
import ComponentShowcase from '@/ui/pages/ComponentShowcase.vue';
import ComparisonViewer from '@/ui/pages/ComparisonViewer.vue';
import DynamicComponent from '@/ui/pages/DynamicComponent.vue';

const routes = [
  // 主页 - 组件展示
  {
    path: '/',
    name: 'Home',
    component: ComponentShowcase,
    meta: {
      title: '组件展示',
      description: '查看所有Figma组件的还原情况'
    }
  },
  // 组件详情预览
  {
    path: '/component/:name',
    name: 'ComponentDetail',
    component: DynamicComponent,
    props: true,
    meta: {
      title: '组件预览',
      description: '预览Figma组件'
    }
  },
  // 组件对比分析
  {
    path: '/comparison/:name',
    name: 'ComparisonDetail',
    component: ComparisonViewer,
    props: true,
    meta: {
      title: '对比分析',
      description: '查看组件的详细对比分析'
    }
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../ui/common/NotFound.vue'),
    meta: {
      title: '页面未找到',
      description: '请检查URL是否正确'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置，恢复它
    if (savedPosition) {
      return savedPosition;
    }
    // 如果有锚点，滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      };
    }
    // 否则滚动到顶部
    return { top: 0 };
  }
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Figma 组件还原监控`;
  }

  // 验证组件名称参数
  if (to.params.name && typeof to.params.name === 'string') {
    // 验证组件名称格式
    const componentName = to.params.name;
    if (!/^[a-zA-Z0-9_-]+$/.test(componentName)) {
      console.warn('Invalid component name format:', componentName);
      next({ name: 'NotFound' });
      return;
    }
  }

  next();
});

// 全局后置钩子
router.afterEach((to, from) => {
  // 记录页面访问
  console.log(`Navigated from ${from.path} to ${to.path}`);
});

export default router;