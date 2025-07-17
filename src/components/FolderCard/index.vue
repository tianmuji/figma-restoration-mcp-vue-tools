<template>
  <div class="folder-card">
    <!-- Preview Area -->
    <div class="preview-area">
      <div class="background"></div>
      <div class="folder-icon">
        <img :src="folderIconUrl" alt="Folder Icon" />
      </div>
      <!-- Sync status (hidden by default) -->
      <div class="sync-status" :style="{ opacity: 0 }">
        <div class="sync-indicator">
          <div class="sync-circle"></div>
          <div class="sync-dot"></div>
        </div>
      </div>
    </div>

    <!-- Folder Information -->
    <div class="folder-info">
      <div class="folder-name">目标文件夹1</div>
      <div class="other-info">
        <div class="time-and-docs">
          <span class="date-time">2023-09-01  14:36</span>
          <div class="separator"></div>
          <div class="doc-count-container">
            <img :src="documentIconUrl" alt="Document Icon" class="doc-icon" />
            <span class="doc-count">3</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FolderCard',
  data() {
    return {
      folderIconUrl: new URL('./images/folder_icon.svg', import.meta.url).href,
      documentIconUrl: new URL('./images/document_icon.svg', import.meta.url).href
    }
  }
}
</script>

<style scoped>
/* Main Container */
.folder-card {
  width: 363px;
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Preview Area */
.preview-area {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #DCDCDC;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #F7F7F7;
  border-radius: 4px 4px 0px 0px;
}

.folder-icon {
  position: absolute;
  top: 32px;
  left: 133px;
  width: 96px;
  height: 96px;
}

.folder-icon img {
  width: 96px;
  height: 96px;
  display: block;
}

/* Sync Status */
.sync-status {
  position: absolute;
  top: 144px;
  left: 347px;
  width: 12px;
  height: 12px;
}

.sync-indicator {
  position: relative;
  width: 12px;
  height: 12px;
}

.sync-circle {
  position: absolute;
  top: 0.5px;
  left: 0.5px;
  width: 11px;
  height: 11px;
  border: 2px solid;
  border-image: conic-gradient(from 0deg, #19BCAA 0%, rgba(25, 188, 170, 0) 100%) 1;
  border-radius: 50%;
  box-sizing: border-box;
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

/* Folder Information */
.folder-info {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 0px 0px 4px 4px;
}

.folder-name {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #212121;
  text-align: left;
  margin: 0;
  padding: 0;
}

.other-info {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: 2px;
}

.time-and-docs {
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: 6px;
}

.date-time {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #9C9C9C;
  text-align: left;
  margin: 0;
  padding: 0;
}

.separator {
  width: 0px;
  height: 8px;
  border-right: 0.5px solid #DCDCDC;
}

.doc-count-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.doc-icon {
  width: 12px;
  height: 12px;
  object-fit: contain;
}

.doc-count {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #9C9C9C;
  text-align: left;
  margin: 0;
  padding: 0;
}
</style>
