<template>
  <div class="text-editor-toolbar">
    <!-- 颜色选择器 -->
    <div class="color-picker-section">
      <div class="color-palette">
        <div 
          v-for="(color, index) in colors" 
          :key="index"
          class="color-item"
          :class="{ selected: selectedColor === color.value }"
          :style="{ backgroundColor: color.value, border: color.border }"
          @click="selectColor(color.value)"
        ></div>
      </div>
    </div>

    <!-- 透明度滑块和预览 -->
    <div class="opacity-section">
      <div class="opacity-preview">
        <!-- 文本行组 -->
        <div class="text-lines-group">
          <!-- 第一行文本 -->
          <div class="text-line-row">
            <div class="text-rect" v-for="i in 18" :key="`row1-${i}`"></div>
          </div>
          <!-- 第二行文本 -->
          <div class="text-line-row">
            <div class="text-rect" v-for="i in 17" :key="`row2-${i}`"></div>
          </div>
          <!-- 第三行文本 -->
          <div class="text-line-row">
            <div class="text-rect" v-for="i in 17" :key="`row3-${i}`"></div>
          </div>
        </div>
        <!-- 渐变覆盖层 -->
        <div class="gradient-overlay"></div>
        <!-- 滑块控制点 -->
        <div class="opacity-slider-handle"></div>
      </div>
      <div class="opacity-value">50%</div>
    </div>

    <!-- 字体和字号设置 -->
    <div class="font-settings">
      <div class="font-family-group">
        <label class="setting-label">字体</label>
        <div class="dropdown-field">
          <span class="dropdown-text">Helvetica</span>
          <svg class="dropdown-arrow" width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 3L5 6L8 3" stroke="#5A5A5A" fill="none"/>
          </svg>
        </div>
      </div>
      <div class="font-size-group">
        <label class="setting-label">字号</label>
        <div class="dropdown-field">
          <span class="dropdown-text">12pt</span>
          <svg class="dropdown-arrow" width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 3L5 6L8 3" stroke="#5A5A5A" fill="none"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 文本大小和对齐工具 -->
    <div class="text-tools">
      <div class="size-group">
        <label class="setting-label">Size</label>
        <div class="dropdown-field">
          <span class="dropdown-text">12pt</span>
          <svg class="dropdown-arrow" width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 3L5 6L8 3" stroke="#5A5A5A" fill="none"/>
          </svg>
        </div>
        <div class="alignment-buttons">
          <button class="align-btn active">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="2" y1="3" x2="10" y2="3" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="6" x2="8" y2="6" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="9" x2="10" y2="9" stroke="#5A5A5A" stroke-width="1.4"/>
            </svg>
          </button>
          <button class="align-btn">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="2" y1="3" x2="10" y2="3" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="6" x2="8" y2="6" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="9" x2="10" y2="9" stroke="#5A5A5A" stroke-width="1.4"/>
            </svg>
          </button>
          <button class="align-btn">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="2" y1="3" x2="10" y2="3" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="6" x2="8" y2="6" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="9" x2="10" y2="9" stroke="#5A5A5A" stroke-width="1.4"/>
            </svg>
          </button>
          <button class="align-btn">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="2" y1="3" x2="10" y2="3" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="6" x2="8" y2="6" stroke="#5A5A5A" stroke-width="1.4"/>
              <line x1="2" y1="9" x2="10" y2="9" stroke="#5A5A5A" stroke-width="1.4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 线条工具 -->
    <div class="line-tools">
      <div class="line-thickness">
        <svg class="thin-line-icon" width="14" height="11" viewBox="0 0 14 11">
          <path d="M1 5.5L13 5.5" stroke="#5A5A5A" stroke-width="1"/>
        </svg>
        <div class="thickness-slider">
          <div class="slider-track"></div>
          <div class="slider-progress"></div>
          <div class="slider-handle"></div>
        </div>
        <svg class="thick-line-icon" width="14" height="11" viewBox="0 0 14 11">
          <path d="M1 5.5L13 5.5" stroke="#5A5A5A" stroke-width="3"/>
        </svg>
      </div>
    </div>

    <!-- 字体大小工具 -->
    <div class="font-size-tools">
      <svg class="small-text-icon" width="10" height="10" viewBox="0 0 10 10">
        <text x="5" y="7" text-anchor="middle" font-size="6" fill="#5A5A5A">A</text>
      </svg>
      <div class="size-slider">
        <div class="slider-track"></div>
        <div class="slider-progress"></div>
        <div class="slider-handle"></div>
      </div>
      <svg class="large-text-icon" width="12" height="12" viewBox="0 0 12 12">
        <text x="6" y="9" text-anchor="middle" font-size="8" fill="#5A5A5A">A</text>
      </svg>
      <div class="size-value">12pt</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextEditorToolbar',
  data() {
    return {
      selectedColor: '#6551C8',
      colors: [
        { value: '#000000', border: 'none' },
        { value: '#F74A4A', border: 'none' },
        { value: '#FFFFFF', border: '1px solid #DCDCDC' },
        { value: '#F7D04A', border: 'none' },
        { value: '#35C36C', border: 'none' },
        { value: '#52CBC8', border: 'none' },
        { value: '#6551C8', border: 'none' }
      ]
    }
  },
  methods: {
    selectColor(color) {
      this.selectedColor = color
    }
  }
}
</script>

<style scoped>
.text-editor-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 12px;
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0px 5px 30px 0px rgba(48, 61, 60, 0.15), 0px 2px 8px 0px rgba(48, 61, 60, 0.1);
  font-family: 'PingFang SC', sans-serif;
  width: fit-content;
}

/* 颜色选择器 */
.color-picker-section {
  width: 216px;
  height: 24px;
}

.color-palette {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px;
}

.color-item {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
}

.color-item.selected {
  box-shadow: 0px 0px 0px 2.5px rgba(101, 81, 200, 1), 0px 0px 0px 1.5px rgba(255, 255, 255, 1);
}

/* 透明度预览区域 */
.opacity-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.opacity-preview {
  width: 248px;
  height: 104px;
  background: #F7F7F7;
  border-radius: 15px;
  position: relative;
  padding: 12px;
  box-sizing: border-box;
}

.text-lines-group {
  position: absolute;
  top: 56px;
  left: 12px;
  width: 224px;
  height: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-line-row {
  display: flex;
  gap: 8px;
  height: 8px;
}

.text-rect {
  width: 8px;
  height: 8px;
  background: #D9D9D9;
  flex-shrink: 0;
}

.gradient-overlay {
  position: absolute;
  top: 56px;
  left: 12px;
  width: 216px;
  height: 24px;
  background: linear-gradient(90deg, rgba(251, 29, 10, 0) 0%, rgba(251, 29, 10, 1) 100%);
  border-radius: 2px;
}

.opacity-slider-handle {
  position: absolute;
  top: 58px;
  left: 97px;
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  cursor: pointer;
}

.opacity-value {
  width: 44px;
  height: 24px;
  background: #F1F1F1;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 400;
  color: #000000;
}

/* 字体设置 */
.font-settings {
  display: flex;
  gap: 16px;
  align-items: center;
}

.font-family-group,
.font-size-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  white-space: nowrap;
}

.dropdown-field {
  width: 94px;
  height: 24px;
  background: #F1F1F1;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  cursor: pointer;
}

.dropdown-text {
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  width: 60px;
}

.dropdown-arrow {
  width: 10px;
  height: 10px;
}

/* 分割线 */
.divider {
  width: 278px;
  height: 1px;
  background: rgba(220, 220, 220, 0.5);
}

/* 文本工具 */
.text-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alignment-buttons {
  display: flex;
  gap: 2px;
}

.align-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
}

.align-btn.active {
  background: rgba(55, 55, 55, 0.07);
}

.align-btn:hover {
  background: rgba(55, 55, 55, 0.05);
}

/* 线条工具 */
.line-tools {
  width: 268px;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.line-thickness {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.thin-line-icon,
.thick-line-icon {
  flex-shrink: 0;
}

.thickness-slider {
  flex: 1;
  height: 20px;
  position: relative;
  display: flex;
  align-items: center;
}

.slider-track {
  width: 100%;
  height: 2px;
  background: #DCDCDC;
  border-radius: 2px;
  opacity: 0.4;
}

.slider-progress {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  width: 57%;
  background: #19BCAA;
  border-radius: 2px;
}

.slider-handle {
  position: absolute;
  left: 54%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #19BCAA;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  cursor: pointer;
}

/* 字体大小工具 */
.font-size-tools {
  width: 276px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.small-text-icon,
.large-text-icon {
  flex-shrink: 0;
}

.size-slider {
  width: 172px;
  height: 20px;
  position: relative;
  display: flex;
  align-items: center;
}

.size-slider .slider-track {
  width: 100%;
  height: 2px;
  background: #DCDCDC;
  border-radius: 2px;
  opacity: 0.4;
}

.size-slider .slider-progress {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  width: 36%;
  background: #139D90;
  border-radius: 2px;
}

.size-slider .slider-handle {
  position: absolute;
  left: 28%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #19BCAA;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  cursor: pointer;
}

.size-value {
  width: 44px;
  height: 24px;
  background: #F1F1F1;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 400;
  color: #000000;
}
</style>
