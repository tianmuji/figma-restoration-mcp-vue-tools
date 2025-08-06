<template>
  <div class="design-v1">
    <div class="layout">
      
      <!-- Middle rectangle with text -->
      <div class="rectangle-group">
        <div class="rectangle">
          <div class="text-in-rectangle">Some Text In Here</div>
        </div>
      </div>
      
      <!-- Bottom row of squares -->
      <div class="frame-row">
        <div class="square"></div>
        <div class="square"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for this static component
</script>

<style scoped>
.design-v1,
.design-v1 * {
  box-sizing: border-box;
}

.design-v1 {
  width: 194px;
  height: 270px;
  border: 2px solid #000000;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  margin: -2px;
}

.frame-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.square {
  width: 75px;
  height: 75px;
  background-color: #D9D9D9;
}

.rectangle-group {
  width: 162px;
  height: 77.25px;
  position: relative;
}

.rectangle {
  width: 162px;
  height: 77.25px;
  background-color: #D9D9D9;
  position: relative;
}

.text-in-rectangle {
  position: absolute;
  left: 28px;
  top: 31px;
  width: 105px;
  height: 15px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.21;
  color: #000000;
  text-align: left;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>