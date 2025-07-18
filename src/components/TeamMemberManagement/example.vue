<template>
  <div class="example-container">
    <div class="example-header">
      <h2>📱 TeamMemberManagement Component</h2>
      <p>团队成员管理页面 - 从Figma设计高精度还原</p>
    </div>

    <!-- Testing Benchmark Container -->
    <div 
      id="benchmark-container-for-screenshot"
      class="benchmark-container"
    >
      <TeamMemberManagement 
        :search-placeholder="searchPlaceholder"
        :info-message="infoMessage"
        :show-help-button="showHelpButton"
        :title="title"
        @back="handleBack"
        @help="handleHelp"
        @search="handleSearch"
      >
        <template #content>
          <div class="member-list">
            <div v-for="member in members" :key="member.id" class="member-item">
              <div class="member-avatar">
                {{ member.name.charAt(0) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-contact">{{ member.phone || member.email }}</div>
              </div>
              <div class="member-role">{{ member.role }}</div>
            </div>
          </div>
        </template>
      </TeamMemberManagement>
    </div>

    <!-- Controls for Testing -->
    <div class="controls">
      <div class="control-group">
        <label>页面标题:</label>
        <input v-model="title" type="text" />
      </div>

      <div class="control-group">
        <label>搜索占位符:</label>
        <input v-model="searchPlaceholder" type="text" />
      </div>

      <div class="control-group">
        <label>信息提示:</label>
        <textarea v-model="infoMessage" rows="3"></textarea>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showHelpButton" />
          显示帮助按钮
        </label>
      </div>

      <div class="control-group">
        <button @click="resetToDefaults" class="reset-button">
          重置为默认值
        </button>
      </div>
    </div>

    <!-- Event Log -->
    <div class="event-log">
      <h3>事件日志:</h3>
      <div class="log-entries">
        <div 
          v-for="(event, index) in eventLog" 
          :key="index"
          class="log-entry"
        >
          <span class="timestamp">{{ event.timestamp }}</span>
          <span class="event-type">{{ event.type }}</span>
          <span class="event-data">{{ event.data }}</span>
        </div>
      </div>
    </div>

    <!-- Component Info -->
    <div class="component-info">
      <h3>组件信息:</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Figma源:</strong>
          <span>Node ID: 3946-35350</span>
        </div>
        <div class="info-item">
          <strong>尺寸:</strong>
          <span>375×770px (移动端)</span>
        </div>
        <div class="info-item">
          <strong>功能:</strong>
          <span>搜索、返回导航、信息提示</span>
        </div>
        <div class="info-item">
          <strong>交互元素:</strong>
          <span>返回按钮、搜索框、帮助按钮</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TeamMemberManagement from './index.vue'

// Reactive state
const title = ref('成员管理')
const searchPlaceholder = ref('搜索姓名/手机号/邮箱')
const infoMessage = ref('管理员可在电脑端登录后，前往企业版控制台- 成员管理 管理成员')
const showHelpButton = ref(false)

const eventLog = ref<Array<{timestamp: string, type: string, data: string}>>([])

// Sample member data
const members = ref([
  { id: 1, name: '张三', phone: '138****1234', email: 'zhangsan@company.com', role: '管理员' },
  { id: 2, name: '李四', phone: '139****5678', email: 'lisi@company.com', role: '成员' },
  { id: 3, name: '王五', phone: '137****9012', email: 'wangwu@company.com', role: '成员' }
])

// Methods
const addLogEntry = (type: string, data: any) => {
  eventLog.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    type,
    data: JSON.stringify(data)
  })
  
  // Keep only last 10 entries
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10)
  }
}

const handleBack = () => {
  addLogEntry('back', { action: 'Back button clicked' })
}

const handleHelp = () => {
  addLogEntry('help', { action: 'Help button clicked' })
}

const handleSearch = (query: string) => {
  addLogEntry('search', { query })
}

const resetToDefaults = () => {
  title.value = '成员管理'
  searchPlaceholder.value = '搜索姓名/手机号/邮箱'
  infoMessage.value = '管理员可在电脑端登录后，前往企业版控制台- 成员管理 管理成员'
  showHelpButton.value = false
  addLogEntry('reset', { action: 'Reset to defaults' })
}
</script>

<style scoped>
.example-container {
  padding: 20px;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

.example-header {
  margin-bottom: 30px;
  text-align: center;
}

.example-header h2 {
  color: #212121;
  margin-bottom: 8px;
}

.example-header p {
  color: #666;
  margin: 0;
}

.benchmark-container {
  display: inline-block;
  margin: 20px 0;
  padding: 0;
  background: transparent;
}

.member-list {
  padding: 16px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #19BCAA;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 12px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #212121;
  margin-bottom: 4px;
}

.member-contact {
  font-size: 12px;
  color: #9C9C9C;
}

.member-role {
  font-size: 12px;
  color: #19BCAA;
  padding: 2px 8px;
  background: rgba(25, 188, 170, 0.1);
  border-radius: 4px;
}

.controls {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: #374151;
}

.control-group input,
.control-group textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.reset-button {
  padding: 8px 16px;
  background: #19BCAA;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.reset-button:hover {
  background: #16a394;
}

.event-log {
  margin-top: 30px;
}

.event-log h3 {
  color: #212121;
  margin-bottom: 12px;
}

.log-entries {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #e5e7eb;
  font-family: monospace;
  font-size: 12px;
}

.log-entry:last-child {
  border-bottom: none;
}

.timestamp {
  color: #6b7280;
  min-width: 80px;
}

.event-type {
  color: #059669;
  font-weight: 600;
  min-width: 80px;
}

.event-data {
  color: #374151;
}

.component-info {
  margin-top: 30px;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 8px;
}

.component-info h3 {
  color: #212121;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0f2fe;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  color: #374151;
}

.info-item span {
  color: #6b7280;
}
</style>
