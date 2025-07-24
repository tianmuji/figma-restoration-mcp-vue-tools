<template>
  <div class="exchange-page">
    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-left">
        <span class="time">9:41</span>
      </div>
      <div class="status-right">
        <div class="signal-icons">
          <div class="cellular"></div>
          <div class="wifi"></div>
          <div class="battery"></div>
        </div>
      </div>
    </div>

    <!-- Navigation Bar -->
    <div class="navigation-bar">
      <button class="back-button" @click="goBack">
        <img :src="backIconUrl" alt="返回" class="back-icon" />
      </button>
      <div class="action-buttons">
        <div class="action-dots"></div>
        <div class="divider-line"></div>
        <div class="action-more"></div>
      </div>
    </div>

    <!-- Logo Section -->
    <div class="logo-section">
      <img :src="logoUrl" alt="扫描全能王" class="logo-image" />
    </div>

    <!-- Main Title -->
    <div class="main-title">
      <h1>欢迎兑换<br/>扫描全能王高级会员</h1>
    </div>

    <!-- Phone Illustration -->
    <div class="phone-illustration">
      <img 
        :src="phoneIllustrationUrl" 
        alt="3D手机装饰图" 
        class="illustration-image"
      />
    </div>

    <!-- Status Message -->
    <div class="status-message">
      <span>高级会员兑换中...</span>
    </div>

    <!-- Home Indicator -->
    <div class="home-indicator">
      <div class="indicator-bar"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 使用new URL方式导入素材
const backIconUrl = new URL('./images/ic_back_arrow.svg', import.meta.url).href
const logoUrl = new URL('./images/logo_combination.svg', import.meta.url).href
const phoneIllustrationUrl = new URL('./images/phone_illustration.png', import.meta.url).href

// Props
interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: true
})

// Emits
interface Emits {
  back: []
  retry: []
}

const emit = defineEmits<Emits>()

// Methods
const goBack = () => {
  emit('back')
}

// Computed
const statusText = computed(() => {
  return props.loading ? '高级会员兑换中...' : '兑换完成'
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.exchange-page {
  display: flex;
  flex-direction: column;
  width: 375px;
  height: 812px;
  background-color: #1E2334;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 21px 0 21px;
  position: relative;
  z-index: 10;
}

.status-left .time {
  color: #FFFFFF;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.status-right {
  display: flex;
  align-items: center;
}

.signal-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cellular, .wifi, .battery {
  background-color: #FFFFFF;
  opacity: 0.8;
}

.cellular {
  width: 17px;
  height: 10.67px;
  background: linear-gradient(to right, #FFFFFF 25%, rgba(255,255,255,0.3) 25%);
}

.wifi {
  width: 15.27px;
  height: 10.97px;
  border-radius: 2px;
}

.battery {
  width: 24.33px;
  height: 11.33px;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 2.67px;
  position: relative;
}

.battery::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 3.67px;
  width: 1.33px;
  height: 4px;
  background-color: rgba(255,255,255,0.4);
  border-radius: 0 1px 1px 0;
}

/* Navigation Bar */
.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 16px;
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.back-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

.action-buttons {
  display: flex;
  align-items: center;
  width: 87px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border: 0.5px solid #EAEAEA;
  border-radius: 16px;
  padding: 0 13.5px;
  gap: 12px;
}

.action-dots {
  position: relative;
  width: 18px;
  height: 7px;
  display: flex;
  align-items: center;
}

.action-dots::before,
.action-dots::after {
  content: '';
  position: absolute;
  width: 7px;
  height: 7px;
  background-color: #FFFFFF;
  border-radius: 50%;
  top: 0;
}

.action-dots::before {
  left: 0;
}

.action-dots::after {
  left: 11px;
}

.divider-line {
  width: 0.5px;
  height: 20px;
  background-color: #CCCCCC;
}

.action-more {
  width: 16px;
  height: 16px;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  position: relative;
}

.action-more::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 6px;
  height: 6px;
  background-color: #FFFFFF;
  border-radius: 50%;
}

/* Logo Section */
.logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 32px;
  margin-top: 16px;
}

.logo-image {
  width: 134px;
  height: 32px;
  object-fit: contain;
}

/* Main Title */
.main-title {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 24px;
  padding: 0 60px;
}

.main-title h1 {
  font-family: 'HarmonyOS Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.29;
  text-align: center;
  margin: 0;
  background: linear-gradient(180deg, #F6E2A7 0%, #CCAD74 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Phone Illustration */
.phone-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 77px;
  padding: 0 14px;
}

.illustration-image {
  width: 347px;
  height: 240px;
  object-fit: contain;
  border-radius: 8px;
}

/* Status Message */
.status-message {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 24px;
}

.status-message span {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.4;
  text-align: center;
  color: #D5B87F;
}

/* Home Indicator */
.home-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.indicator-bar {
  width: 134px;
  height: 5px;
  background-color: #FFFFFF;
  border-radius: 100px;
}

/* 字体抗锯齿优化 */
.exchange-page {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .exchange-page {
    width: 100vw;
    height: 100vh;
  }
}
</style> 