<template>
  <div class="insert-text-toolbar">
    <!-- Color Picker Group -->
    <div class="group-427319645">
      <div class="frame-427319191">
        <div
          v-for="(color, index) in colors"
          :key="index"
          class="color-instance"
          :class="{ selected: selectedColor === index }"
          @click="selectColor(index)"
        >
          <div
            class="color-ellipse"
            :style="getColorStyle(color, index)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Controls -->
    <div class="frame-427319646">
      <!-- Text Preview -->
      <div class="frame-427319123">
        <div class="group-427319472">
          <!-- Text Grid Frames - Exact Figma Structure -->
          <div class="frame-427319653">
            <div v-for="n in 18" :key="`f1-${n}`" class="rectangle-3467623"></div>
          </div>
          <div class="frame-427319655">
            <div v-for="n in 17" :key="`f2-${n}`" class="rectangle-3467623"></div>
          </div>
          <div class="frame-427319654">
            <div v-for="n in 17" :key="`f3-${n}`" class="rectangle-3467623"></div>
          </div>
        </div>
        <div class="rectangle-3467637"></div>
        <div class="rectangle-3467642"></div>
      </div>

      <!-- Opacity Display -->
      <div class="frame-427319658">
        <span class="opacity-text">50%</span>
      </div>
    </div>

    <!-- Font Controls -->
    <div class="frame-427319662">
      <div class="frame-427319660">
        <span class="font-label">字体</span>
        <div class="frame-427319659">
          <span class="helvetica-text">Helvetica</span>
          <img :src="dropdownIcon" alt="dropdown" class="icon-down" />
        </div>
      </div>

      <div class="frame-427319661">
        <span class="font-size-label">字号</span>
        <div class="frame-427319659-2">
          <span class="pt-text">12pt</span>
          <img :src="dropdownIcon" alt="dropdown" class="icon-down" />
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="vector-251"></div>

    <!-- Size and Alignment -->
    <div class="frame-427319661-size">
      <span class="size-label">Size</span>
      <div class="frame-427319659-3">
        <span class="pt-text-2">12pt</span>
        <img :src="dropdownIcon" alt="dropdown" class="icon-down" />
      </div>
      <div class="frame-427319663">
        <button
          v-for="(align, index) in alignments"
          :key="index"
          class="icon-button"
          :class="{ active: selectedAlignment === index }"
          @click="selectAlignment(index)"
        >
          <div class="align-icon">
            <img :src="alignLine1Icon" alt="line 1" class="align-line-svg" />
            <img :src="alignLine2Icon" alt="line 2" class="align-line-svg" />
            <img :src="alignLine1Icon" alt="line 3" class="align-line-svg" />
          </div>
        </button>
      </div>
    </div>

    <!-- Line Thickness -->
    <div class="frame-427319232">
      <img :src="thinLineIcon" alt="thin" class="line-tool-thin" />
      <div class="slider-3">
        <div class="mask"></div>
        <div class="frame-427319235">
          <div class="slider-rect" style="width: 125.2px;"></div>
          <div class="ellipse-122" style="left: 118px;"></div>
        </div>
      </div>
      <img :src="thickLineIcon" alt="thick" class="line-tool-thick" />
    </div>

    <!-- Text Size -->
    <div class="frame-427319229">
      <div class="frame-427319236">
        <img :src="textIconSmall" alt="text small" class="text-tool-icon" />
      </div>
      <div class="slider-1">
        <div class="mask-2"></div>
        <div class="frame-427319235-2">
          <div class="slider-rect-2" style="width: 62.6px;"></div>
          <div class="ellipse-122-2" style="left: 49px;"></div>
        </div>
      </div>
      <img :src="textIconLarge" alt="text large" class="text-tool-icon-large" />
      <div class="frame-427319658-2">
        <span class="pt-text-3">12pt</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InsertTextToolbar',
  data() {
    return {
      selectedColor: 6, // Purple selected
      selectedAlignment: 0, // First alignment active
      colors: [
        { value: '#000000', border: false },
        { value: '#F74A4A', border: false },
        { value: '#FFFFFF', border: true },
        { value: '#F7D04A', border: false },
        { value: '#35C36C', border: false },
        { value: '#52CBC8', border: false },
        { value: '#6551C8', border: false }
      ],
      alignments: ['left', 'center', 'right', 'justify']
    }
  },
  computed: {
    dropdownIcon() {
      return new URL('./images/dropdown_arrow.svg', import.meta.url).href;
    },
    thinLineIcon() {
      return new URL('./images/thin_line_tool.svg', import.meta.url).href;
    },
    thickLineIcon() {
      return new URL('./images/thick_line_tool.svg', import.meta.url).href;
    },
    textIconSmall() {
      return new URL('./images/text_tool_icon.svg', import.meta.url).href;
    },
    textIconLarge() {
      return new URL('./images/text_tool_icon_large.svg', import.meta.url).href;
    },
    alignLine1Icon() {
      return new URL('./images/align_line_1.svg', import.meta.url).href;
    },
    alignLine2Icon() {
      return new URL('./images/align_line_2.svg', import.meta.url).href;
    }
  },
  methods: {
    getColorStyle(color, index) {
      const style = {
        backgroundColor: color.value
      };

      if (color.border) {
        style.border = '1px solid #DCDCDC';
      }

      if (this.selectedColor === index) {
        style.boxShadow = '0px 0px 0px 2.5px rgba(101, 81, 200, 1), 0px 0px 0px 1.5px rgba(255, 255, 255, 1)';
      }

      return style;
    },
    selectColor(index) {
      this.selectedColor = index;
      this.$emit('color-change', this.colors[index]);
    },
    selectAlignment(index) {
      this.selectedAlignment = index;
      this.$emit('alignment-change', this.alignments[index]);
    }
  }
}
</script>

<style scoped>
/* Main Container - Exact Figma Layout */
.insert-text-toolbar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 16px 12px;
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0px 5px 30px 0px rgba(48, 61, 60, 0.15), 0px 2px 8px 0px rgba(48, 61, 60, 0.1);
  width: fit-content;
  height: fit-content;
  box-sizing: border-box;
}

/* Group 427319645 - Color Picker */
.group-427319645 {
  width: 216px;
  height: 24px;
  position: relative;
}

.frame-427319191 {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px;
  width: fit-content;
  height: fit-content;
  position: absolute;
  left: 0;
  top: 0;
}

.color-instance {
  width: 16px;
  height: 16px;
  position: relative;
  cursor: pointer;
}

.color-ellipse {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 0;
}

/* Frame 427319646 - Main Controls */
.frame-427319646 {
  display: flex;
  gap: 8px;
  width: fit-content;
  height: fit-content;
}

/* Frame 427319123 - Text Preview */
.frame-427319123 {
  background: #F7F7F7;
  border-radius: 15px;
  width: 248px;
  height: 92px;
  position: relative;
  overflow: hidden;
}

.group-427319472 {
  position: absolute;
  left: 12px;
  top: 56px;
  width: 224px;
  height: 24px;
}

.frame-427319653 {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 0;
  top: 0;
  width: 216px;
  height: 8px;
}

.frame-427319655 {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 0;
  top: 16px;
  width: 216px;
  height: 8px;
}

.frame-427319654 {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 8px;
  top: 8px;
  width: 208px;
  height: 8px;
}

.rectangle-3467623 {
  width: 8px;
  height: 8px;
  background: #D9D9D9;
}

.rectangle-3467637 {
  position: absolute;
  left: 12px;
  top: 56px;
  width: 216px;
  height: 24px;
  background: linear-gradient(90deg, rgba(251, 29, 10, 0) 0%, rgba(251, 29, 10, 1) 100%);
}

.rectangle-3467642 {
  position: absolute;
  left: 97px;
  top: 58px;
  width: 20px;
  height: 20px;
  border: 2px solid #FFFFFF;
  border-radius: 10px;
  box-sizing: border-box;
}

/* Frame 427319658 - Opacity - Exact Figma Specs */
.frame-427319658 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 0px 4px;
  background: #F1F1F1;
  border-radius: 2px;
  width: 44px;
  box-sizing: border-box;
}

.opacity-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333;
  text-align: center;
  color: #000000;
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

/* Frame 427319662 - Font Controls */
.frame-427319662 {
  display: flex;
  gap: 16px;
  width: fit-content;
  height: fit-content;
}

.frame-427319660,
.frame-427319661 {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  height: fit-content;
}

.font-label,
.font-size-label,
.size-label {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
  color: #000000;
  width: fit-content;
  height: fit-content;
}

.frame-427319659,
.frame-427319659-2,
.frame-427319659-3 {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0px 8px;
  background: #F1F1F1;
  border-radius: 2px;
  width: 94px;
  height: 24px;
  box-sizing: border-box;
}

.helvetica-text,
.pt-text,
.pt-text-2 {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
  color: #000000;
  width: 60px;
  height: fit-content;
}

.icon-down {
  width: 10px;
  height: fit-content;
}

/* Vector 251 - Divider */
.vector-251 {
  width: 278px;
  height: 1px;
  background: rgba(220, 220, 220, 0.5);
}

/* Frame 427319661 Size - Size and Alignment */
.frame-427319661-size {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  height: fit-content;
}

.frame-427319663 {
  display: flex;
  align-items: center;
  gap: 2px;
  width: fit-content;
  height: fit-content;
}

.icon-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  width: fit-content;
  height: fit-content;
  cursor: pointer;
  box-sizing: border-box;
}

.icon-button.active {
  background: rgba(55, 55, 55, 0.07);
}

.align-icon {
  width: 16px;
  height: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  justify-content: center;
  padding: 2px;
}

.align-line-svg {
  width: 12px;
  height: 1.4px;
  display: block;
}

.align-line-svg:nth-child(2) {
  width: 9px;
}

/* Frame 427319232 - Line Thickness */
.frame-427319232 {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 268px;
  height: 20px;
}

.line-tool-thin,
.line-tool-thick {
  width: 16px;
  height: 16px;
}

.slider-3 {
  width: 220px;
  height: 20px;
  position: relative;
}

.mask {
  position: absolute;
  left: 0;
  top: 8.94px;
  width: 220px;
  height: 2.11px;
  background: #DCDCDC;
  border-radius: 2px;
  opacity: 0.4;
}

.frame-427319235 {
  position: absolute;
  left: 0;
  top: 0;
  width: 138px;
  height: 20px;
}

.slider-rect {
  position: absolute;
  left: 0;
  top: 8.94px;
  width: 125.2px;
  height: 2.11px;
  background: #19BCAA;
  border-radius: 2px;
}

.ellipse-122 {
  position: absolute;
  left: 118px;
  top: 0;
  width: 20px;
  height: 20px;
  background: #19BCAA;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  box-sizing: border-box;
}

/* Frame 427319229 - Text Size */
.frame-427319229 {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 2px 0px;
  width: 276px;
  height: 24px;
  box-sizing: border-box;
}

.frame-427319236 {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-tool-icon {
  width: 10px;
  height: 10px;
}

.slider-1 {
  width: 172px;
  height: 20px;
  position: relative;
}

.mask-2 {
  position: absolute;
  left: 0;
  top: 8.94px;
  width: 172px;
  height: 2.11px;
  background: #DCDCDC;
  border-radius: 2px;
  opacity: 0.4;
}

.frame-427319235-2 {
  position: absolute;
  left: 0;
  top: 0;
  width: 69px;
  height: 20px;
}

.slider-rect-2 {
  position: absolute;
  left: 0;
  top: 8.94px;
  width: 62.6px;
  height: 2.11px;
  background: #139D90;
  border-radius: 2px;
}

.ellipse-122-2 {
  position: absolute;
  left: 49px;
  top: 0;
  width: 20px;
  height: 20px;
  background: #19BCAA;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  box-sizing: border-box;
}

.text-tool-icon-large {
  width: 16px;
  height: 16px;
}

.frame-427319658-2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 0px 4px;
  background: #F1F1F1;
  border-radius: 2px;
  width: 44px;
  box-sizing: border-box;
}

.pt-text-3 {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333;
  text-align: center;
  color: #000000;
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}
</style>