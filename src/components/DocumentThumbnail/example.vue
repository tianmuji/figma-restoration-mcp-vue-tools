<template>
  <div class="example-container">
    <div class="example-header">
      <h2>📄 DocumentThumbnail Component</h2>
      <p>Restored from Figma design with high accuracy</p>
    </div>

    <!-- Testing Benchmark Container -->
    <div 
      id="benchmark-container-for-screenshot"
      class="benchmark-container"
    >
      <DocumentThumbnail 
        :document-name="documentName"
        :thumbnail-url="thumbnailUrl"
        :document-type="documentType"
        :page-count="pageCount"
        :created-date="createdDate"
        :source-tag="sourceTag"
        :sync-status="syncStatus"
        :is-selected="isSelected"
        @click="handleClick"
        @select="handleSelect"
      />
    </div>

    <!-- Controls for Testing -->
    <div class="controls">
      <div class="control-group">
        <label>Document Name:</label>
        <input v-model="documentName" type="text" />
      </div>

      <div class="control-group">
        <label>Document Type:</label>
        <select v-model="documentType">
          <option value="pdf">PDF</option>
          <option value="doc">Word</option>
          <option value="ppt">PowerPoint</option>
          <option value="xls">Excel</option>
          <option value="txt">Text</option>
          <option value="image">Image</option>
        </select>
      </div>

      <div class="control-group">
        <label>Page Count:</label>
        <input v-model.number="pageCount" type="number" min="1" />
      </div>

      <div class="control-group">
        <label>Source Tag:</label>
        <input v-model="sourceTag" type="text" />
      </div>

      <div class="control-group">
        <label>Sync Status:</label>
        <select v-model="syncStatus">
          <option value="none">None</option>
          <option value="syncing">Syncing</option>
          <option value="synced">Synced</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="isSelected" />
          Selected
        </label>
      </div>

      <div class="control-group">
        <label>Thumbnail URL:</label>
        <input v-model="thumbnailUrl" type="text" placeholder="Leave empty for default" />
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DocumentThumbnail from './index.vue'
import type { DocumentType, SyncStatus } from './index.vue'

const documentName = ref('第二个文档')
const thumbnailUrl = ref('')
const documentType = ref<DocumentType>('pdf')
const pageCount = ref(3)
const createdDate = ref('2023-09-01T14:36:00')
const sourceTag = ref('微信导入')
const syncStatus = ref<SyncStatus>('none')
const isSelected = ref(false)

const eventLog = ref<Array<{timestamp: string, type: string, data: string}>>([])

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

const handleClick = () => {
  addLogEntry('click', { documentName: documentName.value })
}

const handleSelect = (selected: boolean) => {
  addLogEntry('select', { selected, documentName: documentName.value })
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
.control-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.control-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
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
  min-width: 60px;
}

.event-data {
  color: #374151;
}
</style>
