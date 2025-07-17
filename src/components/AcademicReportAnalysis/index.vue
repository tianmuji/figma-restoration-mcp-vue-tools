<template>
  <div class="academic-report-analysis">
    <!-- 顶部区域 (0,0,232,64) -->
    <div class="top-area">
      <img :src="topBackgroundImg" alt="top background" class="top-background" />
      <img :src="dividerImg" alt="divider" class="top-divider" />
      <div class="logo-content">
        <img :src="logoIcon" alt="logo" class="logo-icon" />
        <span class="app-name">蜜蜂家校</span>
        <div class="campus-tag">
          <span>校园版</span>
        </div>
      </div>
    </div>

    <!-- 顶部导航 (232,0,1208,64) -->
    <div class="top-navigation">
      <div class="nav-background"></div>
      <div class="nav-content">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <div class="back-button">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M7.5 6L4.5 9L7.5 12" stroke="#666" stroke-width="1.5" fill="none"/>
            </svg>
            <span>返回</span>
          </div>
          <span class="breadcrumb-text">学情报告</span>
          <span class="separator">/</span>
          <span class="current-page">五年级2023年第五次联考</span>
        </div>

        <!-- 右侧按钮组 -->
        <div class="right-button-group">
          <div class="icon-button">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <rect x="0" y="6" width="11" height="2.75" fill="#8C8C8C"/>
              <rect x="0" y="12.25" width="11" height="2.75" fill="#8C8C8C"/>
            </svg>
            <span>课堂模式</span>
          </div>
          <div class="icon-button">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="8" stroke="#8C8C8C" fill="none"/>
              <text x="9" y="13" text-anchor="middle" font-size="12" fill="#8C8C8C">?</text>
            </svg>
            <span>帮助</span>
          </div>
          <div class="icon-button">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="7" stroke="#8C8C8C" fill="none"/>
              <circle cx="8" cy="6" r="1.5" fill="#8C8C8C"/>
              <rect x="7" y="8" width="2" height="5" fill="#8C8C8C"/>
            </svg>
            <span>客服</span>
          </div>
          <div class="user-info">
            <div class="avatar">
              <div class="avatar-bg"></div>
            </div>
            <span class="username">老师名称-学校名称</span>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 6L8 10L12 6" stroke="#666" fill="none"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="nav-divider"></div>
    </div>

    <!-- 左侧导航栏 (16,80,216,704) -->
    <div class="left-sidebar">
      <img :src="sidebarBackgroundImg" alt="sidebar background" class="sidebar-bg" />
      
      <!-- 班级选择器 (24,166,200,34) -->
      <div class="class-selector">
        <span class="label">班级：</span>
        <div class="dropdown">
          <img :src="dropdownBackgroundImg" alt="dropdown bg" class="dropdown-bg" />
          <span class="selected-text">全部</span>
          <img :src="dropdownArrowImg" alt="dropdown arrow" class="dropdown-arrow" />
        </div>
      </div>

      <!-- 导航菜单 -->
      <div class="navigation-menu">
        <div class="menu-item selected">综合成绩分析</div>
        <div class="menu-item">分数段分布</div>
        <div class="menu-item">学生成绩</div>
        <div class="menu-item">题型分析</div>
        <div class="menu-item">逐题分析</div>
        <div class="menu-item">知识点分析</div>
        <div class="menu-item">标记试题分析</div>
      </div>

      <!-- 更新按钮 -->
      <div class="update-button">
        <button class="outline-btn">更新学情</button>
      </div>

      <!-- 底部提示 -->
      <div class="bottom-tip">
        <div class="tip-icon">
          <div class="decorative-dots">
            <div class="dot dot-1"></div>
            <div class="dot dot-2"></div>
            <div class="dot dot-3"></div>
            <div class="dot dot-4"></div>
          </div>
          <div class="main-icon"></div>
        </div>
        <div class="tip-text">
          所有学科阅卷完成后,可<br>查看个性化作业。
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 (248,80,1176,704) -->
    <div class="right-content">
      <!-- 表格容器 (825,284,545,500) -->
      <div class="table-container">
        <!-- 表格头部 -->
        <div class="table-header">
          <div class="header-cell">序号</div>
          <div class="header-cell">姓名</div>
          <div class="header-cell">学号</div>
          <div class="header-cell">总分</div>
          <div class="header-cell">排名</div>
          <div class="header-cell">操作</div>
        </div>
        
        <!-- 表格数据行 -->
        <div class="table-body">
          <div v-for="i in 10" :key="i" class="table-row">
            <div class="table-cell">{{ i }}</div>
            <div class="table-cell">学生{{ i }}</div>
            <div class="table-cell">202301{{ String(i).padStart(2, '0') }}</div>
            <div class="table-cell">{{ 85 + Math.floor(Math.random() * 15) }}</div>
            <div class="table-cell">{{ i }}</div>
            <div class="table-cell">
              <button class="action-btn">查看详情</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AcademicReportAnalysis',
  setup() {
    // 图片资源
    const topBackgroundImg = new URL('./images/top_background.svg', import.meta.url).href
    const dividerImg = new URL('./images/divider.svg', import.meta.url).href
    const logoIcon = new URL('./images/logo_icon.png', import.meta.url).href
    const sidebarBackgroundImg = new URL('./images/sidebar_background.svg', import.meta.url).href
    const dropdownBackgroundImg = new URL('./images/dropdown_background.svg', import.meta.url).href
    const dropdownArrowImg = new URL('./images/dropdown_arrow.svg', import.meta.url).href

    return {
      topBackgroundImg,
      dividerImg,
      logoIcon,
      sidebarBackgroundImg,
      dropdownBackgroundImg,
      dropdownArrowImg
    }
  }
}
</script>

<style scoped>
.academic-report-analysis {
  width: 1440px;
  height: 800px;
  background: #F5F5F5;
  position: relative;
  font-family: 'PingFang SC', sans-serif;
}

/* 顶部区域 (0,0,232,64) */
.top-area {
  position: absolute;
  left: 0;
  top: 0;
  width: 232px;
  height: 64px;
  z-index: 10;
}

.top-background {
  position: absolute;
  left: 0;
  top: 0;
  width: 232px;
  height: 64px;
  object-fit: cover;
}

.top-divider {
  position: absolute;
  left: 0;
  top: 63px;
  width: 232px;
  height: 1px;
  object-fit: cover;
}

.logo-content {
  position: absolute;
  left: 29px;
  top: 17px;
  width: 164px;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.app-name {
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
  color: #262626;
}

.campus-tag {
  width: 42px;
  height: 20px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.campus-tag span {
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: #8C8C8C;
}

/* 顶部导航 (232,0,1208,64) */
.top-navigation {
  position: absolute;
  left: 232px;
  top: 0;
  width: 1208px;
  height: 64px;
  z-index: 5;
}

.nav-background {
  position: absolute;
  left: 0;
  top: 0;
  width: 1208px;
  height: 64px;
  background: #FFFFFF;
}

.nav-content {
  position: absolute;
  left: 0;
  top: 0;
  width: 1208px;
  height: 63px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
}

.back-button:hover {
  background: #F5F5F5;
}

.breadcrumb-text, .separator {
  font-weight: 400;
  font-size: 14px;
  color: #8C8C8C;
}

.current-page {
  font-weight: 400;
  font-size: 14px;
  color: #262626;
}

.right-button-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  color: #8C8C8C;
}

.icon-button:hover {
  background: #F5F5F5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  position: relative;
}

.avatar-bg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #40A9FF 0%, #1890FF 100%);
}

.username {
  font-weight: 400;
  font-size: 14px;
  color: #262626;
}

.nav-divider {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1208px;
  height: 1px;
  background: #F0F0F0;
}

/* 左侧导航栏 (16,80,216,704) */
.left-sidebar {
  position: absolute;
  left: 16px;
  top: 80px;
  width: 216px;
  height: 704px;
}

.sidebar-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 216px;
  height: 704px;
  object-fit: cover;
  border-radius: 8px;
}

/* 班级选择器 (24,166,200,34) -> 相对于sidebar: (8,86,200,34) */
.class-selector {
  position: absolute;
  left: 8px;
  top: 86px;
  width: 200px;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 400;
  font-size: 14px;
  color: #262626;
  white-space: nowrap;
}

.dropdown {
  position: relative;
  flex: 1;
  height: 34px;
}

.dropdown-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.selected-text {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 400;
  font-size: 14px;
  color: #262626;
}

.dropdown-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
}

/* 导航菜单 (24,224,200,48*7) -> 相对于sidebar: (8,144,200,336) */
.navigation-menu {
  position: absolute;
  left: 8px;
  top: 144px;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  width: 200px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #FFFFFF;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  color: #262626;
}

.menu-item.selected {
  background: #E6F7FF;
}

.menu-item:hover {
  background: #F5F5F5;
}

.menu-item.selected:hover {
  background: #E6F7FF;
}

/* 更新按钮 */
.update-button {
  position: absolute;
  left: 8px;
  bottom: 120px;
  width: 200px;
}

.outline-btn {
  width: 100%;
  height: 32px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  background: #FFFFFF;
  font-weight: 400;
  font-size: 14px;
  color: #262626;
  cursor: pointer;
}

.outline-btn:hover {
  border-color: #40A9FF;
  color: #40A9FF;
}

/* 底部提示 (25,712,201,58) -> 相对于sidebar: (9,632,201,58) */
.bottom-tip {
  position: absolute;
  left: 9px;
  bottom: 16px;
  width: 201px;
  height: 58px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tip-icon {
  width: 62px;
  height: 55px;
  position: relative;
}

.decorative-dots {
  position: relative;
  width: 100%;
  height: 100%;
}

.dot {
  position: absolute;
  border-radius: 50%;
}

.dot-1 {
  left: 5px;
  bottom: 7px;
  width: 7px;
  height: 7px;
  background: #FFE58F;
}

.dot-2 {
  right: 3px;
  top: 14px;
  width: 3px;
  height: 3px;
  background: #D3F261;
}

.dot-3 {
  left: 0;
  bottom: 8px;
  width: 3px;
  height: 3px;
  background: #D3F261;
}

.dot-4 {
  right: 1px;
  top: 5px;
  width: 2px;
  height: 2px;
  background: #D3F261;
}

.main-icon {
  position: absolute;
  left: 8px;
  top: 0;
  width: 48px;
  height: 53px;
  background: #87E8DE;
  border-radius: 4px;
}

.tip-text {
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #8C8C8C;
  opacity: 0.45;
}

/* 右侧内容区域 (248,80,1176,704) */
.right-content {
  position: absolute;
  left: 248px;
  top: 80px;
  width: 1176px;
  height: 704px;
  background: #F5F5F5;
  padding: 16px;
  box-sizing: border-box;
}

/* 表格容器 (825,284,545,500) -> 相对于right-content: (577,204,545,500) */
.table-container {
  position: absolute;
  left: 577px;
  top: 204px;
  width: 545px;
  height: 500px;
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #F0F0F0;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F0;
}

.header-cell {
  flex: 1;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  color: #262626;
  text-align: left;
  border-right: 1px solid #F0F0F0;
}

.header-cell:last-child {
  border-right: none;
}

.table-body {
  max-height: 446px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #F0F0F0;
}

.table-row:hover {
  background: #F5F5F5;
}

.table-cell {
  flex: 1;
  padding: 12px 16px;
  font-weight: 400;
  font-size: 14px;
  color: #262626;
  border-right: 1px solid #F0F0F0;
  display: flex;
  align-items: center;
}

.table-cell:last-child {
  border-right: none;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: #E6F7FF;
  font-weight: 400;
  font-size: 12px;
  color: #1890FF;
  cursor: pointer;
}

.action-btn:hover {
  background: #BAE7FF;
}
</style>
