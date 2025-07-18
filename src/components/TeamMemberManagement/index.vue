<template>
  <div class="team-member-management">
    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-left">
        <span class="time">9:41</span>
      </div>
      <div class="status-right">
        <div class="battery-icon"></div>
        <div class="wifi-icon"></div>
        <div class="signal-icon"></div>
      </div>
    </div>

    <!-- Title Bar -->
    <div class="title-bar">
      <div class="title-left">
        <button class="back-button" @click="handleBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="title-text">成员管理</h1>
      </div>
      <button class="help-button" @click="handleHelp" v-if="showHelpButton">
        使用说明
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <img :src="searchIconUrl" alt="Search" class="search-icon" />
          <input 
            type="text" 
            class="search-input"
            :placeholder="searchPlaceholder"
            v-model="searchQuery"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner">
      <img :src="infoIconUrl" alt="Info" class="info-icon" />
      <p class="info-text">
        {{ infoMessage }}
      </p>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <slot name="content">
        <!-- Default content or member list would go here -->
        <div class="empty-state">
          <p>团队成员列表将在这里显示</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props interface
export interface TeamMemberManagementProps {
  /** Search placeholder text */
  searchPlaceholder?: string
  /** Info banner message */
  infoMessage?: string
  /** Show help button */
  showHelpButton?: boolean
  /** Page title */
  title?: string
}

// Props with defaults
const props = withDefaults(defineProps<TeamMemberManagementProps>(), {
  searchPlaceholder: '搜索姓名/手机号/邮箱',
  infoMessage: '管理员可在电脑端登录后，前往企业版控制台- 成员管理 管理成员',
  showHelpButton: false,
  title: '成员管理'
})

// Emits
const emit = defineEmits<{
  back: []
  help: []
  search: [query: string]
}>()

// Reactive state
const searchQuery = ref('')

// Static asset URLs
const searchIconUrl = new URL('./images/search-icon.svg', import.meta.url).href
const infoIconUrl = new URL('./images/info-icon.svg', import.meta.url).href

// Methods
const handleBack = () => {
  emit('back')
}

const handleHelp = () => {
  emit('help')
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

// Export types for external use
export type { TeamMemberManagementProps }
</script>

<style scoped>
/* Main Container */
.team-member-management {
  width: 375px;
  height: 770px;
  background: #F7F7F7;
  position: relative;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* Status Bar */
.status-bar {
  width: 375px;
  height: 44px;
  background: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 21px;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
}

.status-left .time {
  font-weight: 600;
  font-size: 14px;
  color: #000000;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.battery-icon,
.wifi-icon,
.signal-icon {
  width: 24px;
  height: 11px;
  background: #000000;
  border-radius: 2px;
}

/* Title Bar */
.title-bar {
  width: 375px;
  height: 44px;
  background: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  box-sizing: border-box;
  position: absolute;
  top: 44px;
  left: 0;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.back-button {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-text {
  font-weight: 500;
  font-size: 18px;
  line-height: 1.4444444444444444;
  color: #212121;
  margin: 0;
  text-align: center;
  flex: 1;
}

.help-button {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4285714285714286;
  color: #00B796;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* Search Section */
.search-section {
  width: 375px;
  background: #FFFFFF;
  padding: 6px 16px;
  box-sizing: border-box;
  position: absolute;
  top: 154px;
  left: 0;
}

.search-container {
  width: 343px;
  height: 32px;
  background: #F1F1F1;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.search-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5714285714285714;
  color: #212121;
}

.search-input::placeholder {
  color: #9C9C9C;
}

/* Info Banner */
.info-banner {
  width: 375px;
  height: 48px;
  background: rgba(25, 188, 170, 0.1);
  display: flex;
  align-items: center;
  padding: 8px 16px;
  box-sizing: border-box;
  position: absolute;
  top: 98px;
  left: 0;
  gap: 8px;
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.info-text {
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333;
  color: #19BCAA;
  margin: 0;
  flex: 1;
}

/* Content Area */
.content-area {
  position: absolute;
  top: 218px;
  left: 0;
  width: 375px;
  height: calc(770px - 218px);
  background: #F7F7F7;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-state p {
  color: #9C9C9C;
  font-size: 14px;
  margin: 0;
}

/* White background sections */
.white-section {
  width: 375px;
  height: 118px;
  background: #FFFFFF;
  position: absolute;
  top: 88px;
  left: 0;
}
</style>
