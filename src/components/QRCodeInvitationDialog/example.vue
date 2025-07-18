<template>
  <div class="example-container">
    <div class="example-header">
      <h2>📱 QRCodeInvitationDialog Component</h2>
      <p>Restored from Figma design with high accuracy</p>
    </div>

    <!-- Testing Benchmark Container -->
    <div 
      id="benchmark-container-for-screenshot"
      class="benchmark-container"
    >
      <QRCodeInvitationDialog 
        :qr-code-url="qrCodeUrl"
        :invite-url="inviteUrl"
        :title="title"
        :description="description"
        @copy-url="handleCopyUrl"
        @save-qr-code="handleSaveQRCode"
        @share-qr-code="handleShareQRCode"
      />
    </div>

    <!-- Controls for Testing -->
    <div class="controls">
      <div class="control-group">
        <label>Title:</label>
        <input v-model="title" type="text" />
      </div>

      <div class="control-group">
        <label>Invite URL:</label>
        <input v-model="inviteUrl" type="text" />
      </div>

      <div class="control-group">
        <label>Description:</label>
        <textarea v-model="description" rows="2"></textarea>
      </div>

      <div class="control-group">
        <label>Custom QR Code URL:</label>
        <input v-model="qrCodeUrl" type="text" placeholder="Leave empty for default" />
      </div>

      <div class="control-group">
        <button @click="resetToDefaults" class="reset-button">
          Reset to Defaults
        </button>
      </div>
    </div>

    <!-- Event Log -->
    <div class="event-log">
      <h3>Event Log:</h3>
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
      <h3>Component Information:</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Figma Source:</strong>
          <span>Node ID: 5088-62383</span>
        </div>
        <div class="info-item">
          <strong>Dimensions:</strong>
          <span>343×354px</span>
        </div>
        <div class="info-item">
          <strong>Features:</strong>
          <span>QR Code Display, URL Copy, Save/Share Actions</span>
        </div>
        <div class="info-item">
          <strong>Interactive Elements:</strong>
          <span>Copy Button, Save Button, Share Button</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QRCodeInvitationDialog from './index.vue'

// Reactive state
const title = ref('二维码/链接邀请')
const inviteUrl = ref('https://tburl.in/OEwyPCvY')
const description = ref('将链接或二维码保存并发送给同事，快捷添加成员')
const qrCodeUrl = ref('')

const eventLog = ref<Array<{timestamp: string, type: string, data: string}>>([])

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

const handleCopyUrl = (url: string) => {
  addLogEntry('copy-url', { url })
}

const handleSaveQRCode = (qrUrl: string) => {
  addLogEntry('save-qr-code', { qrUrl })
}

const handleShareQRCode = (qrUrl: string, inviteUrl: string) => {
  addLogEntry('share-qr-code', { qrUrl, inviteUrl })
}

const resetToDefaults = () => {
  title.value = '二维码/链接邀请'
  inviteUrl.value = 'https://tburl.in/OEwyPCvY'
  description.value = '将链接或二维码保存并发送给同事，快捷添加成员'
  qrCodeUrl.value = ''
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
  min-width: 100px;
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
