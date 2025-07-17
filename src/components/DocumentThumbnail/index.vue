<template>
  <div class="document-thumbnail">
    <!-- Preview Section -->
    <div class="preview-section">
      <!-- Background -->
      <div class="preview-background"></div>
      
      <!-- Document Preview Image -->
      <div class="document-preview">
        <img 
          :src="documentPreviewUrl" 
          alt="文档预览" 
          class="preview-image"
        />
      </div>
      
      <!-- Sync Status (hidden by default) -->
      <div class="sync-status hidden">
        <div class="sync-circle">
          <div class="sync-dot"></div>
        </div>
      </div>
      
      <!-- Document Type Badge -->
      <div class="document-badge">
        <div class="badge-background"></div>
        <div class="badge-content">
          <img 
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
      <div class="document-name">文档文档文档</div>
      
      <!-- Other Info -->
      <div class="other-info">
        <!-- Time and Page Info -->
        <div class="time-page-info">
          <!-- Date -->
          <span class="date-text">2023-09-01  14:36</span>
          
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
            <span class="page-number">3</span>
          </div>
          
          <!-- Separator -->
          <div class="separator-line"></div>
          
          <!-- Import Source -->
          <div class="import-source">
            <span class="source-text">微信导入</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentThumbnail',
  data() {
    return {
      documentPreviewUrl: new URL('./images/document-preview.png', import.meta.url).href,
      wordBadgeUrl: new URL('./images/word-badge.svg', import.meta.url).href,
      pageIcon1Url: new URL('./images/page-icon-1.svg', import.meta.url).href,
      pageIcon2Url: new URL('./images/page-icon-2.svg', import.meta.url).href
    }
  }
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
}

.sync-status.hidden {
  opacity: 0;
}

.sync-circle {
  width: 11px;
  height: 11px;
  border: 2px solid;
  border-image: conic-gradient(from 0deg, #19BCAA 0%, rgba(25, 188, 170, 0) 100%) 1;
  border-radius: 50%;
  position: relative;
}

.sync-dot {
  position: absolute;
  top: 9.5px;
  left: 5px;
  width: 2px;
  height: 2px;
  background: #1AB6A5;
  border-radius: 50%;
}

/* Document Badge */
.document-badge {
  position: absolute;
  top: 12px;
  right: 36px;
  width: 24px;
  height: 24px;
  background: #3C81FF;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
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
