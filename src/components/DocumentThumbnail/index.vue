<template>
  <div class="document-thumbnail" :class="{ selected: isSelected }" @click="handleClick">
    <!-- Preview Section -->
    <div class="preview-section">
      <!-- Background -->
      <div class="preview-background"></div>

      <!-- Document Preview Image -->
      <div class="document-preview">
        <img
          v-if="thumbnailUrl"
          :src="thumbnailUrl"
          alt="文档预览"
          class="preview-image"
        />
        <img
          v-else
          :src="documentPreviewUrl"
          alt="文档预览"
          class="preview-image"
        />
      </div>

      <!-- Sync Status (hidden by default, matches Figma opacity: 0) -->
      <div class="sync-status" :class="{ visible: syncStatus === 'syncing' }">
        <div class="sync-circle">
          <div class="sync-dot"></div>
        </div>
      </div>

      <!-- Document Type Badge -->
      <div class="document-badge" :class="`type-${documentType}`">
        <div class="badge-content">
          <!-- PDF Badge (using Figma SVG) -->
          <img
            v-if="documentType === 'pdf'"
            :src="pdfBadgeUrl"
            alt="PDF文档"
            class="badge-icon"
          />
          <!-- Word Badge (fallback) -->
          <img
            v-else
            :src="wordBadgeUrl"
            alt="Word文档"
            class="badge-icon"
          />
        </div>
      </div>
    </div>
    
    <!-- Document Info Section -->
    <div class="document-info">
      <!-- Document Name -->
      <div class="document-name" :title="documentName">{{ documentName }}</div>

      <!-- Other Info -->
      <div class="other-info">
        <!-- Time and Page Info -->
        <div class="time-page-info">
          <!-- Date -->
          <span class="date-text">{{ formattedDate }}</span>

          <!-- Separator -->
          <div class="separator-line"></div>

          <!-- Page Count -->
          <div class="page-count">
            <div class="page-icon">
              <img
                :src="pageIcon1Url"
                alt="页面"
                class="page-icon-1"
              />
              <img
                :src="pageIcon2Url"
                alt="页面"
                class="page-icon-2"
              />
            </div>
            <span class="page-number">{{ pageCount }}</span>
          </div>

          <!-- Separator -->
          <div class="separator-line"></div>

          <!-- Import Source -->
          <div class="import-source">
            <span class="source-text">{{ sourceTag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type DocumentType = 'pdf' | 'doc' | 'ppt' | 'xls' | 'txt' | 'image'
export type SyncStatus = 'none' | 'syncing' | 'synced' | 'error'

export interface DocumentThumbnailProps {
  documentName?: string
  thumbnailUrl?: string
  documentType?: DocumentType
  pageCount?: number
  createdDate?: string | Date
  sourceTag?: string
  syncStatus?: SyncStatus
  isSelected?: boolean
}

interface Emits {
  (e: 'click'): void
  (e: 'select', selected: boolean): void
}

const props = withDefaults(defineProps<DocumentThumbnailProps>(), {
  documentName: '第二个文档',
  documentType: 'pdf',
  pageCount: 3,
  createdDate: '2023-09-01T14:36:00',
  sourceTag: '微信导入',
  syncStatus: 'none',
  isSelected: false
})

const emit = defineEmits<Emits>()

// Static asset URLs
const documentPreviewUrl = new URL('./images/document-preview.png', import.meta.url).href
const wordBadgeUrl = new URL('./images/word-badge.svg', import.meta.url).href
const pdfBadgeUrl = new URL('./images/pdf-badge.svg', import.meta.url).href
const pageIcon1Url = new URL('./images/page-icon-1.svg', import.meta.url).href
const pageIcon2Url = new URL('./images/page-icon-2.svg', import.meta.url).href

const formattedDate = computed(() => {
  if (!props.createdDate) return ''

  const date = typeof props.createdDate === 'string'
    ? new Date(props.createdDate)
    : props.createdDate

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
})

const handleClick = () => {
  emit('click')
  emit('select', !props.isSelected)
}
</script>

<style scoped>
/* Main Container */
.document-thumbnail {
  width: 363px;
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-thumbnail:hover {
  border-color: #19BCAA;
  box-shadow: 0 2px 8px rgba(25, 188, 170, 0.1);
}

.document-thumbnail.selected {
  border-color: #19BCAA;
  box-shadow: 0 0 0 2px rgba(25, 188, 170, 0.2);
}

/* Preview Section */
.preview-section {
  position: relative;
  width: 100%;
  height: 160px;
  border-bottom: 1px solid #DCDCDC;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.preview-background {
  position: absolute;
  top: -0.3px;
  left: 0;
  width: 100%;
  height: 160px;
  background: #F7F7F7;
  border-radius: 4px 4px 0 0;
}

.document-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 160px;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px 4px 0 0;
}

/* Sync Status */
.sync-status {
  position: absolute;
  top: 144px;
  right: 16px;
  width: 12px;
  height: 12px;
  opacity: 0; /* Hidden by default, matches Figma */
}

.sync-status.visible {
  opacity: 1;
}

.sync-circle {
  width: 11px;
  height: 11px;
  border: 2px solid;
  border-color: #19BCAA transparent #19BCAA transparent;
  border-radius: 50%;
  position: relative;
  animation: spin 1s linear infinite;
}

.sync-dot {
  position: absolute;
  top: 4.5px;
  right: -1px;
  width: 2px;
  height: 2px;
  background: #1AB6A5;
  border-radius: 50%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Document Badge */
.document-badge {
  position: absolute;
  top: 12px;
  right: 12px; /* Matches Figma: x: 327, component width: 363, so right: 363-327-24 = 12px */
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-badge.type-pdf {
  background: #FE501E;
}

.document-badge.type-doc {
  background: #3C81FF;
}

.document-badge.type-ppt {
  background: #FF6B35;
}

.document-badge.type-xls {
  background: #00B04F;
}

.badge-content {
  width: 15px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon {
  width: 15px;
  height: 12px;
}

/* Document Info Section */
.document-info {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: 4px;
  border-radius: 0 0 4px 4px;
}

.document-name {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4285714285714286;
  color: #212121;
  align-self: stretch;
}

.other-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: stretch;
  gap: 2px;
  height: 16px;
}

.time-page-info {
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: 6px;
}

.date-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333;
  color: #9C9C9C;
}

.separator-line {
  width: 0;
  height: 8px;
  border-right: 0.5px solid #DCDCDC;
}

.page-count {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.page-icon {
  position: relative;
  width: 12px;
  height: 12px;
}

.page-icon-1 {
  position: absolute;
  top: 1.5px;
  left: 1.5px;
  width: 7px;
  height: 9px;
}

.page-icon-2 {
  position: absolute;
  top: 2px;
  left: 7.5px;
  width: 3px;
  height: 8px;
}

.page-number {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333;
  color: #9C9C9C;
}

.import-source {
  background: #F7F7F7;
  border-radius: 2px;
  padding: 2px 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.source-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 1.4;
  color: #9C9C9C;
}
</style>
