<template>
  <div class="design-v1">
    <!-- Frame 1: Top row of squares -->
    <div class="frame frame-1">
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>
    
    <!-- Rectangle Group: Middle section with text -->
    <div class="rectangle-group">
      <div class="text-in-rectangle">Some Text In Here</div>
    </div>
    
    <!-- Frame 2: Bottom row of squares -->
    <div class="frame frame-2">
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or reactive data needed for this static component
</script>

<style scoped>
.design-v1 {
  box-sizing: border-box;
  width: 194px;
  height: 284px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 2px solid #000000;
  background-color: transparent;
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
  align-items: flex-start;
}

.square {
  width: 75px;
  height: 75px;
  background-color: #D9D9D9;
  flex-shrink: 0;
  border-radius: 0;
}

.rectangle-group {
  width: 162px;
  height: 77.25px;
  background-color: #D9D9D9;
  position: relative;
  flex-shrink: 0;
  border-radius: 0;
}

.text-in-rectangle {
  position: absolute;
  left: 28px;
  top: 31px;
  width: 105px;
  height: 15px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.2102272510528564em;
  color: #000000;
  text-align: left;
  display: flex;
  align-items: flex-start;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>