/**
 * Figma Restored Components Library
 * Export all restored Vue components from Figma designs
 */

// Import components
import DocumentSortMenu from './DocumentSortMenu/index.vue'
import DocumentThumbnail from './DocumentThumbnail/index.vue'
import QRCodeInvitationDialog from './QRCodeInvitationDialog/index.vue'
import TeamMemberManagement from './TeamMemberManagement/index.vue'

// Export individual components
export { DocumentSortMenu, DocumentThumbnail, QRCodeInvitationDialog, TeamMemberManagement }

// Export types
export type { SortOption, DocumentSortMenuProps } from './DocumentSortMenu/index.vue'
export type { DocumentType, SyncStatus, DocumentThumbnailProps } from './DocumentThumbnail/index.vue'
export type { QRCodeInvitationDialogProps } from './QRCodeInvitationDialog/index.vue'
export type { TeamMemberManagementProps } from './TeamMemberManagement/index.vue'

// Export as default object for global registration
export default {
  DocumentSortMenu,
  DocumentThumbnail,
  QRCodeInvitationDialog,
  TeamMemberManagement
}

// Vue plugin for global registration
export const FigmaComponentsPlugin = {
  install(app: any) {
    app.component('DocumentSortMenu', DocumentSortMenu)
    app.component('DocumentThumbnail', DocumentThumbnail)
    app.component('QRCodeInvitationDialog', QRCodeInvitationDialog)
    app.component('TeamMemberManagement', TeamMemberManagement)
  }
}
