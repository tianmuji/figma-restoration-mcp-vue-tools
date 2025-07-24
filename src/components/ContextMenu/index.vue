<template>
  <div class="context-menu" :style="menuStyle">
    <template v-for="(element, index) in elements" :key="index">
      <!-- 菜单项 -->
      <div 
        v-if="element.type === 'menu-item'"
        class="menu-item"
        :class="getMenuItemClass(element.state)"
        @click="handleMenuClick(element.id)"
        @mouseenter="hoveredItem = element.id"
        @mouseleave="hoveredItem = null"
      >
        <div class="icon-container">
          <img 
            :src="getIconUrl(element.icon)"
            class="menu-icon"
            :class="getIconClass(element.state)"
            alt=""
          />
          <span class="menu-text">{{ element.text }}</span>
        </div>
        <span 
          v-if="element.showShortcut" 
          class="shortcut"
        >
          {{ element.shortcut }}
        </span>
      </div>
      
      <!-- 分割线 -->
      <div 
        v-else-if="element.type === 'divider'"
        class="divider"
      >
        <div class="divider-line"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 使用new URL方式导入SVG图标
const eraseRectangleUrl = new URL('./images/erase-rectangle.svg', import.meta.url).href
const shareIosUrl = new URL('./images/share-ios.svg', import.meta.url).href
const downloadUrl = new URL('./images/download.svg', import.meta.url).href
const copyUrl = new URL('./images/copy.svg', import.meta.url).href
const renameUrl = new URL('./images/rename.svg', import.meta.url).href
const tagsUrl = new URL('./images/tags.svg', import.meta.url).href
const deleteUrl = new URL('./images/delete.svg', import.meta.url).href

// 图标映射
const iconMap = {
  'cs_ic_common_erase_rectangle_矩形擦除': eraseRectangleUrl,
  'cs_ic_common_share_ios_分享、共享': shareIosUrl,
  'cs_ic_common_download_下载': downloadUrl,
  'cs_ic_common_copy_复制': copyUrl,
  'cs_ic_common_rename_重命名': renameUrl,
  'cs_ic_common_tags_标签': tagsUrl,
  'cs_ic_common_delete_删除、垃圾桶': deleteUrl,
}

// Props
interface Props {
  visible?: boolean
  x?: number
  y?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  x: 0,
  y: 0
})

// Emits
interface Emits {
  menuClick: [action: string]
  close: []
}

const emit = defineEmits<Emits>()

// 响应式数据
const hoveredItem = ref<string | null>(null)

// 菜单元素数据
const elements = [
  {
    id: "menu-item-open",
    type: "menu-item",
    text: "打开",
    icon: "cs_ic_common_erase_rectangle_矩形擦除",
    shortcut: "⇧⌘C",
    state: "default",
    showShortcut: false
  },
  {
    id: "menu-item-share", 
    type: "menu-item",
    text: "分享",
    icon: "cs_ic_common_share_ios_分享、共享",
    shortcut: "⇧⌘C",
    state: "default",
    showShortcut: false
  },
  {
    id: "menu-item-download",
    type: "menu-item", 
    text: "下载",
    icon: "cs_ic_common_download_下载",
    shortcut: "⇧⌘C",
    state: "hover",
    showShortcut: false
  },
  {
    id: "divider-1",
    type: "divider"
  },
  {
    id: "menu-item-copy",
    type: "menu-item",
    text: "复制", 
    icon: "cs_ic_common_copy_复制",
    shortcut: "⌘C",
    state: "default",
    showShortcut: true
  },
  {
    id: "menu-item-cut",
    type: "menu-item",
    text: "剪切",
    icon: "cs_ic_common_erase_rectangle_矩形擦除", 
    shortcut: "⌘X",
    state: "default",
    showShortcut: true
  },
  {
    id: "menu-item-paste",
    type: "menu-item",
    text: "粘贴",
    icon: "cs_ic_common_erase_rectangle_矩形擦除",
    shortcut: "⌘V", 
    state: "disabled",
    showShortcut: true
  },
  {
    id: "menu-item-rename",
    type: "menu-item",
    text: "重命名",
    icon: "cs_ic_common_rename_重命名",
    shortcut: "⇧⌘C",
    state: "default",
    showShortcut: false
  },
  {
    id: "menu-item-tags",
    type: "menu-item", 
    text: "标签",
    icon: "cs_ic_common_tags_标签",
    shortcut: "⇧⌘C",
    state: "default",
    showShortcut: false
  },
  {
    id: "divider-2", 
    type: "divider"
  },
  {
    id: "menu-item-delete",
    type: "menu-item",
    text: "删除",
    icon: "cs_ic_common_delete_删除、垃圾桶",
    shortcut: "⇧⌘C", 
    state: "danger",
    showShortcut: false
  }
]

// 计算属性
const menuStyle = computed(() => ({
  display: props.visible ? 'flex' : 'none'
}))

// 方法
const getIconUrl = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || eraseRectangleUrl
}

const getMenuItemClass = (state: string) => {
  const classes = []
  if (state === 'hover') classes.push('menu-item--hover')
  if (state === 'disabled') classes.push('menu-item--disabled')
  if (state === 'danger') classes.push('menu-item--danger')
  return classes
}

const getIconClass = (state: string) => {
  return state === 'danger' ? 'menu-icon--danger' : ''
}

const handleMenuClick = (action: string) => {
  const item = elements.find(el => el.id === action)
  if (item?.state === 'disabled') return
  
  emit('menuClick', action)
  emit('close')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.context-menu {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  gap: 0;
  background-color: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0px 5px 30px 0px rgba(48, 61, 60, 0.15), 0px 2px 8px 0px rgba(48, 61, 60, 0.1);

  width: 156px;
  height: auto;
  max-height: none;
  user-select: none;
  overflow: visible;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 6px 16px 6px 12px;
  min-height: 32px;
  cursor: pointer;
  font-size: 14px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  line-height: 1.43;
  color: #212121;
  transition: background-color 0.15s ease;
}

.menu-item:hover:not(.menu-item--disabled) {
  background-color: #F7F7F7;
}

.menu-item--hover {
  background-color: #F7F7F7;
}

.menu-item--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.menu-item--danger {
  color: #FE501E;
}

.icon-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 4px;
  flex: 1;
}

.menu-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  filter: brightness(0) saturate(100%) invert(35%) sepia(0%) saturate(1482%) hue-rotate(158deg) brightness(93%) contrast(87%);
}

.menu-icon--danger {
  filter: brightness(0) saturate(100%) invert(45%) sepia(98%) saturate(2684%) hue-rotate(3deg) brightness(101%) contrast(98%) !important;
}

.menu-text {
  white-space: nowrap;
}

.shortcut {
  font-size: 14px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-align: right;
  color: #212121;
  width: 42px;
  flex-shrink: 0;
}

.divider {
  height: 9px;
  width: 100%;
  position: relative;
}

.divider-line {
  position: absolute;
  top: 4px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #F1F1F1;
}

/* 字体抗锯齿优化 */
.context-menu {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  image-rendering: -webkit-optimize-contrast;
  transform: translateZ(0);
}

/* 更精确的字体渲染 */
.menu-text, .shortcut {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  letter-spacing: -0.01em;
}
</style> 