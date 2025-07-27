<template>
  <div class="image-viewer">
    <div class="image-container" ref="containerRef">
      <div 
        class="image-wrapper"
        :style="{ 
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center center'
        }"
        @mousedown="startDrag"
        @wheel="handleWheel"
      >
        <img 
          :src="src" 
          :alt="alt"
          @load="handleImageLoad"
          @error="handleImageError"
          class="main-image"
          draggable="false"
        />
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
        </div>
        <!-- 错误状态 -->
        <div v-if="error" class="error-overlay">
          <div class="error-icon">🖼️</div>
          <p>图片加载失败</p>
        </div>
      </div>
    </div>
    
    <!-- 控制栏 -->
    <div class="controls">
      <div class="zoom-controls">
        <button @click="zoomOut" :disabled="scale <= minScale" class="control-button">
          🔍-
        </button>
        <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
        <button @click="zoomIn" :disabled="scale >= maxScale" class="control-button">
          🔍+
        </button>
      </div>
      <div class="action-controls">
        <button @click="resetView" class="control-button">
          🔄 重置
        </button>
        <button @click="fitToContainer" class="control-button">
          📐 适应
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

// Props
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  initialScale: {
    type: Number,
    default: 1
  },
  minScale: {
    type: Number,
    default: 0.1
  },
  maxScale: {
    type: Number,
    default: 5
  }
});

// Emits
const emit = defineEmits(['load', 'error']);

// Reactive data
const containerRef = ref();
const loading = ref(true);
const error = ref(false);
const scale = ref(props.initialScale);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const imageInfo = ref(null);

// Methods
const handleImageLoad = async (event) => {
  loading.value = false;
  error.value = false;
  const img = event.target;
  
  // 获取图片信息
  imageInfo.value = {
    width: img.naturalWidth,
    height: img.naturalHeight
  };
  
  // 自动适应容器
  await nextTick();
  fitToContainer();
  emit('load', event);
};

const handleImageError = () => {
  loading.value = false;
  error.value = true;
  emit('error', props.src);
};

const zoomIn = () => {
  const newScale = Math.min(scale.value * 1.2, props.maxScale);
  scale.value = newScale;
};

const zoomOut = () => {
  const newScale = Math.max(scale.value / 1.2, props.minScale);
  scale.value = newScale;
};

const resetView = () => {
  scale.value = props.initialScale;
  translateX.value = 0;
  translateY.value = 0;
};

const fitToContainer = () => {
  if (!containerRef.value || !imageInfo.value) return;
  
  const container = containerRef.value;
  const containerRect = container.getBoundingClientRect();
  const { width: imgWidth, height: imgHeight } = imageInfo.value;
  
  const scaleX = (containerRect.width - 40) / imgWidth;
  const scaleY = (containerRect.height - 40) / imgHeight;
  const newScale = Math.min(scaleX, scaleY, 1);
  
  scale.value = Math.max(newScale, props.minScale);
  translateX.value = 0;
  translateY.value = 0;
};

const handleWheel = (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(props.minScale, Math.min(props.maxScale, scale.value * delta));
  if (newScale !== scale.value) {
    scale.value = newScale;
  }
};

const startDrag = (event) => {
  if (scale.value <= 1) return;
  isDragging.value = true;
  dragStart.value = {
    x: event.clientX - translateX.value,
    y: event.clientY - translateY.value
  };
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  event.preventDefault();
};

const handleDrag = (event) => {
  if (!isDragging.value) return;
  translateX.value = event.clientX - dragStart.value.x;
  translateY.value = event.clientY - dragStart.value.y;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
};

// Lifecycle
onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.image-viewer {
  display: flex;
  flex-direction: column;
  height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}

.image-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
  background: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.image-container:active {
  cursor: grabbing;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease-out;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.loading-overlay, .error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.error-overlay p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-top: 1px solid #e5e7eb;
  gap: 12px;
}

.zoom-controls, .action-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-button {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level {
  font-size: 12px;
  color: #6b7280;
  min-width: 40px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-viewer {
    height: 300px;
  }
  
  .controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .zoom-controls, .action-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>