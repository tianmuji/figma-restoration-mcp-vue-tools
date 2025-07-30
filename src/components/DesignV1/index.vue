<template>
  <div class="design-v1">
    <!-- Frame 1 -->
    <div class="frame frame-1">
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>
    
    <!-- Rectangle Group -->
    <div class="rectangle-group">
      <div class="text-in-rectangle">Some Text In Here</div>
    </div>
    
    <!-- Frame 2 -->
    <div class="frame frame-2">
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// DesignV1 Component
// Based on Figma design: Design v1
// Component dimensions: 194x271 (content area)
// Border strategy: outer stroke using outline (doesn't affect layout)
// Optimized for high fidelity reproduction
</script>

<style scoped>
.design-v1 {
  /* Figma: 194×271px 内容 + 2px边框 = 198×275px 总尺寸 */
  width: 198px;  /* 194 + 2×2 */
  height: 275px; /* 271 + 2×2 */
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  /* 使用border实现边框，调整总尺寸以匹配Figma视觉效果 */
  border: 2px solid #000000;
  box-sizing: border-box;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: antialiased;
  text-rendering: optimizeLegibility;
}

.design-v1 * {
  box-sizing: border-box;
}

.frame {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.square {
  width: 75px;
  height: 75px;
  background-color: #D9D9D9;
  flex-shrink: 0;
}

.rectangle-group {
  width: 162px;
  height: 77.25px;
  background-color: #D9D9D9;
  position: relative;
  flex-shrink: 0;
}

.text-in-rectangle {
  position: absolute;
  left: 28px;
  top: 31px;
  width: 105px;
  height: 15px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2102272510528564em;
  color: #000000;
  /* 更激进的字体渲染优化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: antialiased;
  text-rendering: optimizeLegibility;
  /* 尝试减少文本渲染差异 */
  font-feature-settings: "liga" 0, "kern" 0;
  letter-spacing: 0;
  word-spacing: 0;
  /* 强制像素对齐 */
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style> 