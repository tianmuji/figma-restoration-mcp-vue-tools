<template>
  <div class="document-sort-menu-shadow">
    <!-- Menu Item 1 - Selected -->
    <div class="menu-item selected">
      <div class="right-content">
        <img
          :src="checkmarkIconUrl"
          alt="Selected"
          class="checkmark-icon"
        >
        <div class="icon-text">
          <span class="item-text">修改时间（新 → 旧）</span>
        </div>
      </div>
    </div>

    <!-- Menu Item 2 -->
    <div class="menu-item">
      <div class="right-content">
        <img
          :src="checkmarkIconUrl"
          alt="Checkmark"
          class="checkmark-icon hidden"
        >
        <div class="icon-text">
          <span class="item-text">修改时间（旧 → 新）</span>
        </div>
      </div>
    </div>

    <!-- Separator 1 -->
    <div class="separator">
      <div class="separator-line"></div>
    </div>

    <!-- Menu Item 3 -->
    <div class="menu-item">
      <div class="right-content">
        <img
          :src="checkmarkIconUrl"
          alt="Checkmark"
          class="checkmark-icon hidden"
        >
        <div class="icon-text">
          <span class="item-text">创建时间（新 → 旧）</span>
        </div>
      </div>
    </div>

    <!-- Menu Item 4 -->
    <div class="menu-item">
      <div class="right-content">
        <img
          :src="checkmarkIconUrl"
          alt="Checkmark"
          class="checkmark-icon hidden"
        >
        <div class="icon-text">
          <span class="item-text">创建时间（新 → 旧）</span>
        </div>
      </div>
    </div>

    <!-- Separator 2 -->
    <div class="separator">
      <div class="separator-line"></div>
    </div>

    <!-- Menu Item 5 -->
    <div class="menu-item">
      <div class="right-content">
        <img
          :src="checkmarkIconUrl"
          alt="Checkmark"
          class="checkmark-icon hidden"
        >
        <div class="icon-text">
          <span class="item-text">文件名（ A → Z ）</span>
        </div>
      </div>
    </div>

    <!-- Menu Item 6 -->
    <div class="menu-item">
      <div class="right-content">
        <img
          :src="checkmarkIconUrl"
          alt="Checkmark"
          class="checkmark-icon hidden"
        >
        <div class="icon-text">
          <span class="item-text">文件名（ Z → A ）</span>
        </div>
      </div>
    </div>

    <!-- Separator 3 -->
    <div class="separator">
      <div class="separator-line"></div>
    </div>

    <!-- Menu Item 7 - Hover state -->
    <div class="menu-item hover">
      <div class="right-content">
        <img
          :src="checkmarkIconUrl"
          alt="Checkmark"
          class="checkmark-icon hidden"
        >
        <div class="icon-text">
          <span class="item-text">文件类型</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentSortMenuShadow',
  data() {
    return {
      checkmarkIconUrl: new URL('./images/checkmark_icon.svg', import.meta.url).href
    }
  }
}
</script>

<style scoped>
/* Main Container with Critical Box Shadow */
.document-sort-menu-shadow {
  width: 184px;
  background: #FFFFFF;
  border-radius: 4px;
  padding: 4px 0px;
  box-sizing: border-box;

  /* Critical Dual-Layer Shadow from Figma - Enhanced for snapDOM capture */
  -webkit-box-shadow:
    0px 5px 30px 0px rgba(48, 61, 60, 0.15),
    0px 2px 8px 0px rgba(48, 61, 60, 0.1);
  -moz-box-shadow:
    0px 5px 30px 0px rgba(48, 61, 60, 0.15),
    0px 2px 8px 0px rgba(48, 61, 60, 0.1);
  box-shadow:
    0px 5px 30px 0px rgba(48, 61, 60, 0.15),
    0px 2px 8px 0px rgba(48, 61, 60, 0.1);

  /* Ensure element is positioned for shadow rendering */
  position: relative;
  z-index: 1;
}

/* Menu Items */
.menu-item {
  display: flex;
  align-items: center;
  padding: 6px 16px 6px 12px;
  box-sizing: border-box;
  background: transparent;
}

.menu-item.selected {
  background: #FFFFFF;
}

.menu-item.hover {
  background: #F7F7F7;
}

/* Right Content Container */
.right-content {
  display: flex;
  align-items: center;
  gap: 0px;
  width: 100%;
}

/* Checkmark Icon */
.checkmark-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.checkmark-icon.hidden {
  opacity: 0;
}

/* Icon & Text Container */
.icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0px 0px 0px 4px;
  flex: 1;
}

/* Item Text */
.item-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #212121;
  text-align: left;
  margin: 0;
  padding: 0;
}

/* Separators */
.separator {
  width: 100%;
  height: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.separator-line {
  width: 184px;
  height: 1px;
  background: #F1F1F1;
  margin: 4px 0;
}
</style>
