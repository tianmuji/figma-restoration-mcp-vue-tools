<template>
  <div class="document-sort-menu">
    <div class="menu-item selected" @click="selectOption('modifiedTimeDesc')">
      <div class="menu-content">
        <div class="check-icon">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M13.6626 15.4297L20.0001 21.7672L26.3376 15.4297L28.5709 17.6631L20.0001 26.2339L11.4293 17.6631L13.6626 15.4297Z" fill="#00B796"/>
          </svg>
        </div>
        <div class="text-content">
          <span class="menu-text">修改时间（新 → 旧）</span>
        </div>
      </div>
    </div>

    <div class="menu-item" @click="selectOption('modifiedTimeAsc')">
      <div class="menu-content">
        <div class="check-icon hidden">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M13.6626 15.4297L20.0001 21.7672L26.3376 15.4297L28.5709 17.6631L20.0001 26.2339L11.4293 17.6631L13.6626 15.4297Z" fill="#00B796"/>
          </svg>
        </div>
        <div class="text-content">
          <span class="menu-text">修改时间（旧 → 新）</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="menu-item" @click="selectOption('createdTimeDesc')">
      <div class="menu-content">
        <div class="check-icon hidden">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M13.6626 15.4297L20.0001 21.7672L26.3376 15.4297L28.5709 17.6631L20.0001 26.2339L11.4293 17.6631L13.6626 15.4297Z" fill="#00B796"/>
          </svg>
        </div>
        <div class="text-content">
          <span class="menu-text">创建时间（新 → 旧）</span>
        </div>
      </div>
    </div>

    <div class="menu-item" @click="selectOption('createdTimeAsc')">
      <div class="menu-content">
        <div class="check-icon hidden">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M13.6626 15.4297L20.0001 21.7672L26.3376 15.4297L28.5709 17.6631L20.0001 26.2339L11.4293 17.6631L13.6626 15.4297Z" fill="#00B796"/>
          </svg>
        </div>
        <div class="text-content">
          <span class="menu-text">创建时间（旧 → 新）</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="menu-item" @click="selectOption('filenameAsc')">
      <div class="menu-content">
        <div class="check-icon hidden">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M13.6626 15.4297L20.0001 21.7672L26.3376 15.4297L28.5709 17.6631L20.0001 26.2339L11.4293 17.6631L13.6626 15.4297Z" fill="#00B796"/>
          </svg>
        </div>
        <div class="text-content">
          <span class="menu-text">文件名（A → Z）</span>
        </div>
      </div>
    </div>

    <div class="menu-item" @click="selectOption('filenameDesc')">
      <div class="menu-content">
        <div class="check-icon hidden">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M13.6626 15.4297L20.0001 21.7672L26.3376 15.4297L28.5709 17.6631L20.0001 26.2339L11.4293 17.6631L13.6626 15.4297Z" fill="#00B796"/>
          </svg>
        </div>
        <div class="text-content">
          <span class="menu-text">文件名（Z → A）</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="menu-item hover-item" @click="selectOption('fileType')">
      <div class="menu-content">
        <div class="check-icon hidden">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M13.6626 15.4297L20.0001 21.7672L26.3376 15.4297L28.5709 17.6631L20.0001 26.2339L11.4293 17.6631L13.6626 15.4297Z" fill="#00B796"/>
          </svg>
        </div>
        <div class="text-content">
          <span class="menu-text">文件类型</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export type SortOption =
  | 'modifiedTimeDesc'
  | 'modifiedTimeAsc'
  | 'createdTimeDesc'
  | 'createdTimeAsc'
  | 'filenameAsc'
  | 'filenameDesc'
  | 'fileType'

export interface DocumentSortMenuProps {
  selectedOption?: SortOption
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

interface Emits {
  (e: 'select', option: SortOption): void
  (e: 'change', option: SortOption): void
}

const props = withDefaults(defineProps<DocumentSortMenuProps>(), {
  selectedOption: 'modifiedTimeDesc',
  disabled: false,
  size: 'medium'
})

const emit = defineEmits<Emits>()

const selectOption = (option: SortOption) => {
  if (props.disabled) return
  emit('select', option)
  emit('change', option)
}
</script>

<style scoped>
.document-sort-menu {
  background: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0px 5px 30px 0px rgba(48, 61, 60, 0.15), 0px 2px 8px 0px rgba(48, 61, 60, 0.1);
  padding: 4px 0;
  width: fit-content;
  min-width: 184px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 6px 16px 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #F7F7F7;
}

.menu-item.hover-item {
  background-color: #F7F7F7;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.check-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon.hidden {
  opacity: 0;
}

.text-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 4px;
}

.menu-text {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.43;
  color: #212121;
  white-space: nowrap;
}

.divider {
  height: 9px;
  position: relative;
}

.divider::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #F1F1F1;
}

.menu-item.selected .check-icon {
  opacity: 1;
}
</style>
