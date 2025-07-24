<template>
  <div class="document-list-menu" :class="{ visible: isVisible }">
    <!-- 菜单项: 打开 -->
    <div class="menu-item" @click="handleMenuClick('open')">
      <div class="icon-container">
        <div class="icon-placeholder">📂</div>
      </div>
      <div class="text-container">打开</div>
    </div>

    <!-- 菜单项: 分享 -->
    <div class="menu-item" @click="handleMenuClick('share')">
      <div class="icon-container">
        <div class="icon-placeholder">📤</div>
      </div>
      <div class="text-container">分享</div>
    </div>

    <!-- 菜单项: 下载 (hover状态) -->
    <div class="menu-item menu-item-hover" @click="handleMenuClick('download')">
      <div class="icon-container">
        <div class="icon-placeholder">⬇️</div>
      </div>
      <div class="text-container">下载</div>
    </div>

    <!-- 分割线 -->
    <div class="divider">
      <div class="divider-line"></div>
    </div>

    <!-- 菜单项: 复制 -->
    <div class="menu-item" @click="handleMenuClick('copy')">
      <div class="icon-container">
        <div class="icon-placeholder">📋</div>
      </div>
      <div class="text-container">复制</div>
      <div class="shortcut">⌘C</div>
    </div>

    <!-- 菜单项: 剪切 -->
    <div class="menu-item" @click="handleMenuClick('cut')">
      <div class="icon-container">
        <div class="icon-placeholder">✂️</div>
      </div>
      <div class="text-container">剪切</div>
      <div class="shortcut">⌘X</div>
    </div>

    <!-- 菜单项: 粘贴 (禁用状态) -->
    <div class="menu-item menu-item-disabled">
      <div class="icon-container">
        <div class="icon-placeholder">📄</div>
      </div>
      <div class="text-container">粘贴</div>
      <div class="shortcut">⌘V</div>
    </div>

    <!-- 菜单项: 重命名 -->
    <div class="menu-item" @click="handleMenuClick('rename')">
      <div class="icon-container">
        <div class="icon-placeholder">✏️</div>
      </div>
      <div class="text-container">重命名</div>
    </div>

    <!-- 菜单项: 标签 -->
    <div class="menu-item" @click="handleMenuClick('tags')">
      <div class="icon-container">
        <div class="icon-placeholder">🏷️</div>
      </div>
      <div class="text-container">标签</div>
    </div>

    <!-- 分割线 -->
    <div class="divider">
      <div class="divider-line"></div>
    </div>

    <!-- 菜单项: 删除 (危险状态) -->
    <div class="menu-item menu-item-danger" @click="handleMenuClick('delete')">
      <div class="icon-container">
        <div class="icon-placeholder danger">🗑️</div>
      </div>
      <div class="text-container">删除</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MenuClickEvent {
  action: string
}

// Props
defineProps<{
  isVisible?: boolean
}>()

// Emits
const emit = defineEmits<{
  menuClick: [event: MenuClickEvent]
}>()

// Methods
const handleMenuClick = (action: string) => {
  emit('menuClick', { action })
}
</script>

<style scoped>
.document-list-menu {
  width: 156px;
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0px 5px 30px 0px rgba(48, 61, 60, 0.15), 0px 2px 8px 0px rgba(48, 61, 60, 0.1);
  padding: 4px 0px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

.document-list-menu.visible {
  opacity: 1;
  visibility: visible;
}

.menu-item {
  height: 32px;
  padding: 6px 16px 6px 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  line-height: 1.43em;
  color: #212121;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.15s;
}

.menu-item:hover:not(.menu-item-disabled) {
  background-color: #F7F7F7;
}

.menu-item-hover {
  background-color: #F7F7F7;
}

.menu-item-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.menu-item-danger {
  color: #FE501E;
}

.menu-item-danger .icon-placeholder.danger {
  filter: hue-rotate(15deg) saturate(1.5);
}

.icon-container {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  flex-shrink: 0;
}

.icon-placeholder {
  font-size: 12px;
  line-height: 1;
  opacity: 0.7;
}

.text-container {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shortcut {
  font-size: 14px;
  color: #212121;
  letter-spacing: 0.2em;
  width: 42px;
  text-align: right;
  flex-shrink: 0;
}

.divider {
  width: 100%;
  height: 9px;
  position: relative;
  flex-shrink: 0;
}

.divider-line {
  width: 100%;
  height: 1px;
  background-color: #F1F1F1;
  position: absolute;
  top: 4px;
}

/* 响应式字体渲染优化 */
.document-list-menu * {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 确保所有元素使用border-box */
.document-list-menu,
.document-list-menu * {
  box-sizing: border-box;
}
</style> 