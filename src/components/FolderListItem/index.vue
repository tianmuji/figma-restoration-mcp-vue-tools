<template>
  <div class="folder-list-item">
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 文件夹图标 -->
      <div class="folder-icon">
        <img src="./images/folder-icon.svg" alt="文件夹图标" />
      </div>
      
      <!-- 主标题 -->
      <div class="title-text">
        {{ title }}
      </div>
      
      <!-- 元信息容器 -->
      <div class="meta-info">
        <!-- 时间信息 -->
        <span class="timestamp">{{ timestamp }}</span>
        
        <!-- 项目信息 -->
        <div class="project-info">
          <img src="./images/project-icon.svg" alt="项目图标" class="project-icon" />
          <span class="count">{{ count }}</span>
        </div>
      </div>
    </div>
    
    <!-- 复选框区 -->
    <div class="checkbox-area">
              <img src="./images/checkbox-rect.svg" alt="复选框" class="checkbox" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'

interface Props {
  title?: string
  timestamp?: string  
  count?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  title: '新建文件夹',
  timestamp: '2023-09-01  14:36',
  count: '0'
})
</script>

<style scoped>
.folder-list-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0px;
  padding: 0px;
  background-color: transparent;
  width: 100%;
  height: 64px;
  box-sizing: border-box;
}

.folder-list-item * {
  box-sizing: border-box;
}

/* 主内容区 - 311px × 62px，绝对定位内部元素 */
.main-content {
  position: relative;
  width: 311px;
  height: 62px;
  background-color: #F7F7F7;
  border-radius: 4px;
  flex-shrink: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: translateZ(0);
}

/* 文件夹图标 - 绝对定位 */
.folder-icon {
  position: absolute;
  left: 8px;
  top: 10px;
  width: 40px;
  height: 40px;
}

.folder-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  transform: translateZ(0);
}

/* 主标题 - 绝对定位 */
.title-text {
  position: absolute;
  left: 56px;
  top: 8px;
  width: 80px;
  height: 24px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5em;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 元信息容器 - 绝对定位 */
.meta-info {
  position: absolute;
  left: 56px;
  top: 36px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timestamp {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.33em;
  color: #9C9C9C;
  white-space: nowrap;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 2px;
}

.project-icon {
  width: 12px;
  height: 12px;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.count {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.33em;
  color: #9C9C9C;
}

/* 复选框区 - 48px × 64px */
.checkbox-area {
  width: 48px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox {
  width: 16px;
  height: 16px;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    width: 280px;
    height: 56px;
  }
  
  .folder-icon {
    width: 32px;
    height: 32px;
    left: 6px;
    top: 8px;
  }
  
  .title-text {
    left: 44px;
    top: 6px;
    font-size: 14px;
  }
  
  .meta-info {
    left: 44px;
    top: 28px;
    gap: 4px;
  }
  
  .timestamp,
  .count {
    font-size: 11px;
  }
  
  .checkbox-area {
    width: 40px;
    height: 56px;
  }
}
</style> 