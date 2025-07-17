<template>
  <div class="design-v1">
    <div class="layout">
      <!-- Frame 1: 两个方块 -->
      <div class="frame-row">
        <div class="square"></div>
        <div class="square"></div>
      </div>
      
      <!-- Rectangle Group: 矩形和文本 -->
      <div class="rectangle-group">
        <div class="rectangle">
          <div class="text-in-rectangle">Some Text In Here</div>
        </div>
      </div>
      
      <!-- Frame 2: 两个方块 -->
      <div class="frame-row">
        <div class="square"></div>
        <div class="square"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DesignV1',
  data() {
    return {}
  }
}
</script>

<style scoped>
.design-v1 {
  width: 198px; /* 194 + 2*2 边框 */
  height: 288px; /* 284 + 2*2 边框 */
  border: 2px solid #000000;
  box-sizing: border-box;
  background: white; /* 添加白色背景 */
}

.layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
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
  width: 100%;
  height: 100%;
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
}
</style>
