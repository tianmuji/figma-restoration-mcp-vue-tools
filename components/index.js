/**
 * Figma Restored Components Library
 * Export all restored Vue components from Figma designs
 */

// Import components
import DocumentSortMenu from './DocumentSortMenu.vue'

// Export individual components
export { DocumentSortMenu }

// Export as default object for global registration
export default {
  DocumentSortMenu
}

// Vue plugin for global registration
export const FigmaComponentsPlugin = {
  install(app) {
    app.component('DocumentSortMenu', DocumentSortMenu)
  }
}
