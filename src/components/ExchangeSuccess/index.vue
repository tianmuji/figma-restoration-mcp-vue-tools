<template>
  <div class="exchange-success">
    <!-- Status Bar -->
    <div class="status-bar">
      <img src="./images/status-bar.svg" alt="状态栏" class="status-bar-img" />
    </div>

    <!-- Logo -->
    <div class="logo-section">
      <img src="./images/logo.svg" alt="扫描全能王" class="logo-img" />
    </div>

    <!-- Success Message -->
    <div class="success-message">
      <img src="./images/success-message-complete.svg" alt="高级会员兑换成功" class="success-message-img" />
    </div>

    <!-- Description -->
    <p class="description">下载扫描全能王 App 查看高级会员特权</p>

    <!-- Membership Card -->
    <div class="card-container">
      <img src="./images/membership-card-complete.svg" alt="会员卡" class="card-complete-img" />
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-header">
        <div class="star-icon">
          <img src="./images/star-icon-left.svg" alt="星标" class="star-img" />
        </div>
        <span class="features-title">尊享 20+ 高级会员特权</span>
        <div class="star-icon">
          <img src="./images/star-icon-right.svg" alt="星标" class="star-img" />
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-ocr.svg" alt="证件扫描" class="icon-img" />
          </div>
          <span class="feature-text">证件扫描</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-ocr.svg" alt="PDF功能" class="icon-img" />
          </div>
          <span class="feature-text">PDF功能</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-ocr.svg" alt="拍图识字" class="icon-img" />
          </div>
          <span class="feature-text">拍图识字</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-remove-watermark.svg" alt="去水印" class="icon-img" />
          </div>
          <span class="feature-text">去水印</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-word.svg" alt="PDF转Word" class="icon-img" />
          </div>
          <span class="feature-text">PDF转Word</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-excel.svg" alt="表格识别" class="icon-img" />
          </div>
          <span class="feature-text">表格识别</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-folder.svg" alt="文档管理" class="icon-img" />
          </div>
          <span class="feature-text">文档管理</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <img src="./images/ic-remove-ad.svg" alt="去广告" class="icon-img" />
          </div>
          <span class="feature-text">去广告</span>
        </div>
      </div>
    </div>

    <!-- Navigation Bar -->
    <div class="nav-bar">
      <div class="nav-background"></div>
      <div class="nav-content">
        <button class="back-button">
          <img src="./images/ic-back.svg" alt="返回" class="back-icon" />
        </button>
        <!-- Mini-program capsule controls - using CSS implementation as requested -->
      </div>
    </div>

    <!-- Home Indicator -->
    <div class="home-indicator">
      <img src="./images/home-indicator.svg" alt="主页指示器" class="indicator-img" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
.exchange-success,
.exchange-success * {
  box-sizing: border-box;
}

.exchange-success {
  width: 375px;
  height: 812px;
  background: #1E2334;
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Status Bar */
.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 375px;
  height: 44px;
}

.status-bar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Logo Section */
.logo-section {
  position: absolute;
  top: 104px;
  left: 120px;
  width: 134px;
  height: 32px;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Success Message */
.success-message {
  position: absolute;
  top: 160px;
  left: 73.5px;
}

.success-message-img {
  height: 28px;
  object-fit: contain;
}

/* Description */
.description {
  position: absolute;
  top: 208px;
  left: 47px;
  width: 281px;
  height: 24px;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
  color: #D5B87F;
  margin: 0;
}

/* Card Container */
.card-container {
  position: absolute;
  top: 256px;
  left: 14px;
  width: 347px;
  height: 295px;
}

.card-complete-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Features Section */
.features-section {
  position: absolute;
  top: 573px;
  left: 24px;
  width: 327px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.features-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star-icon {
  width: 20px;
  height: 12px;
}

.star-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.features-title {
  font-weight: 500;
  font-size: 18px;
  line-height: 1.44;
  text-align: center;
  color: #D5B87F;
}

.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 21px;
  width: 100%;
  justify-content: space-between;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 66px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: #333949;
  border: 1px solid #5B6171;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.feature-text {
  font-size: 12px;
  line-height: 1.33;
  text-align: center;
  color: #D5B87F;
  width: 66px;
}

/* Navigation Bar */
.nav-bar {
  position: absolute;
  top: 44px;
  left: 0;
  width: 375px;
  height: 44px;
}

.nav-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.nav-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.back-button {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.back-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 0.5px solid #EAEAEA;
  border-radius: 16px;
  padding: 8px 16px;
  height: 32px;
}

.control-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #000000;
  border-radius: 50%;
}

.dot:nth-child(2),
.dot:nth-child(3) {
  width: 4px;
  height: 4px;
}

.control-divider {
  width: 3px;
  height: 20px;
  background: #D8D8D8;
  border: 0.5px solid #CCCCCC;
}

.control-close {
  width: 16px;
  height: 16px;
}

/* Home Indicator */
.home-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 375px;
  height: 34px;
}

.indicator-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>