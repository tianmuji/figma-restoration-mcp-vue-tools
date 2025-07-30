<template>
  <div class="design-v1">
    <div class="frame frame-1">
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>
    
    <div class="rectangle-group">
      <div class="text-in-rectangle">
        <span>Some Text In Here</span>
      </div>
    </div>
    
    <div class="frame frame-2">
      <div class="square square-3"></div>
      <div class="square square-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// DesignV1 Component
// Simple layout component with squares and text rectangle
// Figma Node ID: 2836-1478
// Figma File Key: hdyf6u2eqRkmXY0I7d9S98

interface Props {
  // Add any props if needed
}

defineProps<Props>()
</script>

<style scoped>
.design-v1 {
  width: 194px;
  height: 271px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 2px solid #000000;
  box-sizing: border-box;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
  color: #000000;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2102272510528564em;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-in-rectangle span {
  display: inline-block;
  width: 100%;
  height: 100%;
  line-height: 15px;
  vertical-align: top;
}
</style> 