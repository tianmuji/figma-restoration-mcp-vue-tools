/**
 * Figma Restored Components Library
 * Export all restored Vue components from Figma designs
 */

// Import components
import DocumentSortMenu from './DocumentSortMenu/index.vue'
import DocumentThumbnail from './DocumentThumbnail/index.vue'
import QRCodeInvitationDialog from './QRCodeInvitationDialog/index.vue'

// Export individual components
export { DocumentSortMenu, DocumentThumbnail, QRCodeInvitationDialog }

// Export types
export type { SortOption, DocumentSortMenuProps } from './DocumentSortMenu/index.vue'
export type { DocumentType, SyncStatus, DocumentThumbnailProps } from './DocumentThumbnail/index.vue'
export type { QRCodeInvitationDialogProps } from './QRCodeInvitationDialog/index.vue'

// Export as default object for global registration
export default {
  DocumentSortMenu,
  DocumentThumbnail,
  QRCodeInvitationDialog
}

// Vue plugin for global registration
export const FigmaComponentsPlugin = {
  install(app: any) {
    app.component('DocumentSortMenu', DocumentSortMenu)
    app.component('DocumentThumbnail', DocumentThumbnail)
    app.component('QRCodeInvitationDialog', QRCodeInvitationDialog)
  }
}
