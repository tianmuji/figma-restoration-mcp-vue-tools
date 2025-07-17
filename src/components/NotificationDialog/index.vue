<template>
  <div class="notification-dialog">
    <!-- Icon + Text Section -->
    <div class="icon-text-section">
      <div class="frame-427319302">
        <div class="text-content">
          <div class="header-section">
            <div class="title">无法打开</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Content -->
    <div class="frame-427319678">
      <div class="message-text">不支持打开该类型文件或文件已损坏</div>
    </div>

    <!-- Button Section -->
    <div class="button-section">
      <div class="frame-524">
        <div class="confirm-button" @click="handleConfirm">
          <div class="button-text">确定</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationDialog',
  emits: ['confirm', 'close'],
  methods: {
    handleConfirm() {
      this.$emit('confirm');
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
/* Main Container - Exact Figma Specifications */
.notification-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
  border-radius: 4px;
  width: 464px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Icon + Text Section - Simplified Structure */
.icon-text-section {
  width: 100%;
  height: 16px;
  position: relative;
}

.frame-427319302 {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 4px;
  width: fit-content;
  height: fit-content;
  position: absolute;
  left: 0;
  top: 0;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
  height: fit-content;
}

.header-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  width: fit-content;
  height: fit-content;
}

.title {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.2;
  text-align: left;
  color: #1a1a1a;
  width: fit-content;
  height: fit-content;
  margin: 0;
  padding: 0;
}

/* Message Content Section */
.frame-427319678 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  gap: 10px;
  width: 100%;
  height: fit-content;
}

.message-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.43;
  text-align: left;
  color: #666666;
  width: 100%;
  height: fit-content;
  margin: 0;
  padding: 0;
}

/* Button Section */
.button-section {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  align-self: stretch;
  width: 100%;
  height: fit-content;
}

.frame-524 {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  width: fit-content;
  height: fit-content;
}

.confirm-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 8px 24px;
  background: #00B796;
  border: none;
  border-radius: 4px;
  min-width: 104px;
  height: 32px;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
}

.confirm-button:hover {
  background: #009A82;
}

.confirm-button:active {
  background: #008A73;
}

.button-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.43;
  text-align: center;
  color: #FFFFFF;
  width: fit-content;
  height: fit-content;
}
</style>
