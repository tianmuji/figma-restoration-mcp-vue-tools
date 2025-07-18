/**
 * Figma Restored Components Library
 * Export all restored Vue components from Figma designs
 */

// Import components
import DocumentSortMenu from './DocumentSortMenu/index.vue'
import DocumentThumbnail from './DocumentThumbnail/index.vue'

// Export individual components
export { DocumentSortMenu, DocumentThumbnail }

// Export types
export type { SortOption, DocumentSortMenuProps } from './DocumentSortMenu/index.vue'
export type { DocumentType, SyncStatus, DocumentThumbnailProps } from './DocumentThumbnail/index.vue'

// Export as default object for global registration
export default {
  DocumentSortMenu,
  DocumentThumbnail
}

// Vue plugin for global registration
export const FigmaComponentsPlugin = {
  install(app: any) {
    app.component('DocumentSortMenu', DocumentSortMenu)
    app.component('DocumentThumbnail', DocumentThumbnail)
  }
}
