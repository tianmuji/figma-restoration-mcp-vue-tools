<template>
  <div class="document-sort-menu">
    <!-- Sort Indicator -->
    <div class="sort-indicator">
      <div class="sort-content">
        <img 
          :src="descendingIconUrl" 
          alt="降序" 
          class="descending-icon"
        >
        <span class="sort-text">按修改时间</span>
      </div>
      <div class="arrow-button">
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M1.5 3.5L5 7L8.5 3.5"
            stroke="#5A5A5A"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <!-- Menu Container -->
    <div class="menu-container">
      <!-- Menu Item 1 - Default -->
      <div class="menu-item">
        <div class="menu-content">
          <div class="icon-text">
            <span class="menu-text">修改时间（新 → 旧）</span>
          </div>
        </div>
        <div class="right-content">
          <div class="checkmark-container hidden">
            <img 
              :src="checkmarkIconUrl" 
              alt="选中" 
              class="checkmark-icon"
            >
          </div>
        </div>
      </div>

      <!-- Menu Item 2 - Selected -->
      <div class="menu-item selected">
        <div class="menu-content">
          <div class="icon-text">
            <span class="menu-text">修改时间（旧 → 新）</span>
          </div>
        </div>
        <div class="right-content">
          <div class="checkmark-container">
            <img 
              :src="checkmarkIconUrl" 
              alt="选中" 
              class="checkmark-icon"
            >
          </div>
        </div>
      </div>

      <!-- Separator 1 -->
      <div class="separator">
        <div class="separator-line" />
      </div>

      <!-- Menu Item 3 -->
      <div class="menu-item">
        <div class="menu-content">
          <div class="icon-text">
            <span class="menu-text">创建时间（新 → 旧）</span>
          </div>
        </div>
        <div class="right-content">
          <div class="checkmark-container hidden">
            <img 
              :src="checkmarkIconUrl" 
              alt="选中" 
              class="checkmark-icon"
            >
          </div>
        </div>
      </div>

      <!-- Menu Item 4 -->
      <div class="menu-item">
        <div class="menu-content">
          <div class="icon-text">
            <span class="menu-text">创建时间（旧 → 新）</span>
          </div>
        </div>
        <div class="right-content">
          <div class="checkmark-container hidden">
            <img
              :src="checkmarkIconUrl"
              alt="选中"
              class="checkmark-icon"
            >
          </div>
        </div>
      </div>

      <!-- Separator 2 -->
      <div class="separator">
        <div class="separator-line" />
      </div>

      <!-- Menu Item 5 -->
      <div class="menu-item">
        <div class="menu-content">
          <div class="icon-text">
            <span class="menu-text">文件名（ A → Z ）</span>
          </div>
        </div>
        <div class="right-content">
          <div class="checkmark-container hidden">
            <img 
              :src="checkmarkIconUrl" 
              alt="选中" 
              class="checkmark-icon"
            >
          </div>
        </div>
      </div>

      <!-- Menu Item 6 -->
      <div class="menu-item">
        <div class="menu-content">
          <div class="icon-text">
            <span class="menu-text">文件名（ Z → A ）</span>
          </div>
        </div>
        <div class="right-content">
          <div class="checkmark-container hidden">
            <img 
              :src="checkmarkIconUrl" 
              alt="选中" 
              class="checkmark-icon"
            >
          </div>
        </div>
      </div>

      <!-- Separator 3 -->
      <div class="separator">
        <div class="separator-line" />
      </div>

      <!-- Menu Item 7 - Hover state -->
      <div class="menu-item hover-state">
        <div class="menu-content">
          <div class="icon-text">
            <span class="menu-text">文件类型</span>
          </div>
        </div>
        <div class="right-content">
          <div class="checkmark-container hidden">
            <img 
              :src="checkmarkIconUrl" 
              alt="选中" 
              class="checkmark-icon"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentSortMenu',
  data() {
    return {
      checkmarkIconUrl: new URL('./images/checkmark-icon.svg', import.meta.url).href,
      descendingIconUrl: new URL('./images/descending-icon.svg', import.meta.url).href
    }
  }
}
</script>

<style scoped>
/* Main Container */
.document-sort-menu {
  position: relative;
  width: 244px;
  height: 326px;
  box-sizing: border-box;
}

/* Sort Indicator */
.sort-indicator {
  position: absolute;
  top: 0;
  left: 45.67px; /* Precisely calculated for 244px width */
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
  height: 28px;
  background: rgba(25, 188, 170, 0.14);
  border-radius: 4px;
  width: fit-content;
  box-sizing: border-box;
}

.sort-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.descending-icon {
  width: 16px;
  height: 16px;
}

.sort-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #5A5A5A;
}

.arrow-button {
  width: 10px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Menu Container */
.menu-container {
  position: absolute;
  top: 32px;
  left: 0;
  width: 244px;
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0px 5px 30px 0px rgba(48, 61, 60, 0.15), 0px 2px 8px 0px rgba(48, 61, 60, 0.1);
  padding: 4px 0;
  display: flex;
  flex-direction: column;
}

/* Menu Items */
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 16px 6px 12px;
  min-height: 32px;
  box-sizing: border-box;
}

.menu-item.selected {
  /* Selected state - no background change needed as it's white */
  background: #FFFFFF;
}

.menu-item.hover-state {
  background: #F7F7F7;
}

.menu-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 4px;
  flex: 1;
}

.menu-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #212121;
}

.right-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.checkmark-container {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark-container.hidden {
  opacity: 0;
}

.checkmark-icon {
  width: 16px;
  height: 16px;
}

/* Separators */
.separator {
  height: 9px;
  display: flex;
  align-items: center;
  padding: 0;
}

.separator-line {
  width: 100%;
  height: 1px;
  background: #F1F1F1;
  margin-top: 4px;
}
</style>
