<template>
  <div class="qr-code-invitation-dialog">
    <!-- Background Container -->
    <div class="dialog-container">
      <!-- Title -->
      <h2 class="dialog-title">二维码/链接邀请</h2>
      
      <!-- QR Code -->
      <div class="qr-code-container">
        <img 
          :src="qrCodeUrl || defaultQRCodeUrl" 
          alt="QR Code"
          class="qr-code-image"
        />
      </div>
      
      <!-- URL Section -->
      <div class="url-section">
        <span class="url-text">{{ inviteUrl }}</span>
        <button 
          class="copy-button"
          @click="handleCopyUrl"
          :disabled="copying"
        >
          {{ copying ? '已复制' : '复制' }}
        </button>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          class="save-button"
          @click="handleSaveQRCode"
        >
          保存二维码
        </button>
        <button 
          class="share-button"
          @click="handleShareQRCode"
        >
          分享二维码
        </button>
      </div>
      
      <!-- Description -->
      <p class="description">
        将链接或二维码保存并发送给同事，快捷添加成员
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props interface
export interface QRCodeInvitationDialogProps {
  /** QR code image URL */
  qrCodeUrl?: string
  /** Invitation URL to display and copy */
  inviteUrl?: string
  /** Whether the dialog is visible */
  visible?: boolean
  /** Custom title text */
  title?: string
  /** Custom description text */
  description?: string
}

// Props with defaults
const props = withDefaults(defineProps<QRCodeInvitationDialogProps>(), {
  qrCodeUrl: '',
  inviteUrl: 'https://tburl.in/OEwyPCvY',
  visible: true,
  title: '二维码/链接邀请',
  description: '将链接或二维码保存并发送给同事，快捷添加成员'
})

// Emits
const emit = defineEmits<{
  copyUrl: [url: string]
  saveQRCode: [qrCodeUrl: string]
  shareQRCode: [qrCodeUrl: string, inviteUrl: string]
  close: []
}>()

// Reactive state
const copying = ref(false)

// Static asset URL
const defaultQRCodeUrl = new URL('./images/qr-code.png', import.meta.url).href

// Computed properties
const displayTitle = computed(() => props.title)
const displayDescription = computed(() => props.description)
const displayUrl = computed(() => props.inviteUrl)

// Methods
const handleCopyUrl = async () => {
  if (copying.value) return
  
  try {
    await navigator.clipboard.writeText(props.inviteUrl)
    copying.value = true
    emit('copyUrl', props.inviteUrl)
    
    // Reset copy state after 2 seconds
    setTimeout(() => {
      copying.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy URL:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.inviteUrl
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    copying.value = true
    emit('copyUrl', props.inviteUrl)
    setTimeout(() => {
      copying.value = false
    }, 2000)
  }
}

const handleSaveQRCode = () => {
  const qrUrl = props.qrCodeUrl || defaultQRCodeUrl
  emit('saveQRCode', qrUrl)
  
  // Create download link
  const link = document.createElement('a')
  link.href = qrUrl
  link.download = 'qr-code.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleShareQRCode = () => {
  const qrUrl = props.qrCodeUrl || defaultQRCodeUrl
  emit('shareQRCode', qrUrl, props.inviteUrl)
  
  // Use Web Share API if available
  if (navigator.share) {
    navigator.share({
      title: '邀请加入',
      text: '扫描二维码或点击链接加入',
      url: props.inviteUrl
    }).catch(console.error)
  }
}

// Export types for external use
export type { QRCodeInvitationDialogProps }
</script>

<style scoped>
/* Main Container */
.qr-code-invitation-dialog {
  display: inline-block;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Dialog Container */
.dialog-container {
  width: 343px;
  height: 354px;
  background: #FFFFFF;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

/* Title */
.dialog-title {
  width: 238px;
  height: 20px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4285714285714286; /* Exact Figma line-height */
  letter-spacing: 0; /* No letter spacing in Figma */
  text-align: center;
  color: #212121;
  margin: 0;
  position: absolute;
  top: 24px; /* Exact Figma positioning */
  left: 53px; /* Exact Figma positioning */
}

/* QR Code Container */
.qr-code-container {
  position: absolute;
  top: 48px;
  left: 102px;
  width: 140px;
  height: 140px;
}

.qr-code-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  border-radius: 0;
}

/* URL Section */
.url-section {
  position: absolute;
  top: 204px;
  left: 83px;
  width: 178px;
  height: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.url-text {
  width: 150px;
  height: 16px;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333; /* Exact Figma line-height */
  text-align: center;
  color: #212121;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.copy-button {
  width: 24px;
  height: 16px;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333; /* Exact Figma line-height */
  text-align: center;
  color: #19BCAA;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  transition: opacity 0.2s ease;
}

.copy-button:hover {
  opacity: 0.8;
}

.copy-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Action Buttons */
.action-buttons {
  position: absolute;
  top: 244px;
  left: 24px;
  width: 295px;
  height: 38px;
  display: flex;
  gap: 15px; /* Gap between buttons: 179-24-140 = 15px */
}

.save-button {
  width: 140px;
  height: 38px;
  background: transparent;
  border: 1px solid #19BCAA;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4285714285714286; /* Exact Figma line-height */
  letter-spacing: 1%; /* Exact Figma letter-spacing */
  text-align: center;
  color: #19BCAA;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  box-sizing: border-box;
  margin: 0;
}

.save-button:hover {
  background: rgba(25, 188, 170, 0.1);
}

.share-button {
  width: 140px;
  height: 38px;
  background: #19BCAA;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4285714285714286; /* Exact Figma line-height */
  letter-spacing: 1%; /* Exact Figma letter-spacing */
  text-align: center;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  box-sizing: border-box;
  margin: 0;
}

.share-button:hover {
  background: #16a394;
}

/* Description */
.description {
  width: 275px;
  height: 16px;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.3333333333333333; /* Exact Figma line-height */
  text-align: center;
  color: #9C9798; /* Exact Figma color */
  margin: 0;
  position: absolute;
  top: 314px;
  left: 34px;
}
</style>
