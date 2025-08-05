---
inclusion: always
---

# Figma Restoration Technical Framework

## Core Technology Stack

### Frontend Framework
- **Vue 3 Composition API** with TypeScript
- **Component Architecture**: Single File Components (.vue)
- **State Management**: Reactive refs and computed properties

### CSS Architecture
#### Layout Strategy
- **Primary**: CSS Flexbox for responsive layouts
- **Avoid**: Absolute positioning unless specifically required for overlays
- **Box Model**: `box-sizing: border-box` applied globally

#### Spacing System
- **Use**: `padding` and `gap` for spacing
- **Avoid**: `margin` properties (can cause layout inconsistencies)
- **Units**: Prefer `px` for precise Figma matching, `rem`/`em` for scalable text

#### Border Implementation
- **Decorative borders**: Use `outline` or `box-shadow` (no layout impact)
- **Layout-affecting borders**: Use `border` and adjust total dimensions
- **Complex borders**: Use `box-shadow` for multi-layer effects
- **Figma compatibility**: Account for inner/outer/center border positioning

### Asset Management

#### SVG Assets
- **Preferred format**: SVG for icons, simple graphics, and complex UI elements
- **Sizing rule**: Original SVG size must equal CSS size (no scaling)
- **Optimization**: Use `mcp_figma_restoration_mcp_vue_tools_optimize_svg` when needed
- **Integration**: Direct `<img>` tags or inline SVG based on complexity

#### Image Assets
- **Format**: PNG for raster images with transparency
- **Scale**: 3x resolution for high-DPI displays
- **Compression**: Optimize for web without quality loss
- **Fallbacks**: Provide appropriate alt text for accessibility

### Component Structure

#### File Organization
```vue
<template>
  <!-- Semantic HTML structure -->
  <div class="component-name">
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
// TypeScript interfaces and logic
interface ComponentProps {
  // Define props with proper types
}

// Component logic using Composition API
</script>

<style scoped>
/* Component-specific styles */
.component-name,
.component-name * {
  box-sizing: border-box;
}

```

#### TypeScript Integration
- **Props**: Define with proper TypeScript interfaces
- **Events**: Type-safe event emissions
- **Refs**: Properly typed reactive references
- **Computed**: Type-safe computed properties

### Responsive Design Principles

#### Mobile-First Approach
- **Base styles**: Design for mobile screens first
- **Progressive enhancement**: Add desktop styles with media queries
- **Breakpoints**: Standard responsive breakpoints
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

#### Flexible Layouts
- **Container queries**: Use when supported for component-based responsiveness
- **Fluid typography**: Scale text appropriately across devices
- **Flexible images**: Ensure images scale properly with containers

### Performance Optimization

#### CSS Performance
- **Efficient selectors**: Avoid deep nesting and complex selectors
- **Critical CSS**: Inline critical styles for above-the-fold content
- **CSS custom properties**: Use for theming and consistent values
- **Minimize reflows**: Avoid layout-triggering property changes

#### Asset Performance
- **Lazy loading**: Implement for non-critical images
- **SVG optimization**: Remove unnecessary metadata and optimize paths
- **Bundle splitting**: Separate component assets when beneficial
- **Caching strategies**: Leverage browser caching for static assets

### Accessibility Standards

#### Semantic HTML
- **Proper elements**: Use semantic HTML elements (header, nav, main, etc.)
- **ARIA labels**: Add appropriate ARIA attributes for complex interactions
- **Focus management**: Ensure proper keyboard navigation
- **Screen readers**: Test with screen reader compatibility

### Browser Compatibility

#### Target Browsers
- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: Graceful degradation for older browsers when necessary

#### Feature Detection
- **CSS features**: Use `@supports` for progressive enhancement
- **JavaScript features**: Polyfills for missing functionality when needed
- **Responsive images**: Use `srcset` and `sizes` for optimal image delivery

### Development Tools Integration

#### MCP Tools Configuration
- **Screenshot tool**: `mcp_figma_restoration_mcp_vue_tools_snapdom_screenshot`
  - Scale: 3x for high resolution
  - Background: transparent
  - Padding: 0 for precise cropping
- **Comparison tool**: `mcp_figma_restoration_mcp_vue_tools_figma_compare`
  - Threshold: 0.02 (98% accuracy target)
  - Output: diff.png for visual analysis
- **SVG optimization**: `mcp_figma_restoration_mcp_vue_tools_optimize_svg`
  - Remove unnecessary metadata
  - Optimize paths and shapes

#### Development Server
- **Port**: 1932 (default for component testing)
- **Hot reload**: Enable for rapid development iteration
- **Error overlay**: Display compilation errors in browser
- **Source maps**: Enable for debugging

### Quality Assurance

#### Code Quality
- **ESLint**: Vue 3 and TypeScript rules
- **Prettier**: Consistent code formatting
- **Type checking**: Strict TypeScript configuration
- **Component testing**: Unit tests for component logic

#### Visual Quality
- **Pixel accuracy**: Target ≥98% match with Figma designs
- **Cross-browser testing**: Verify consistency across target browsers
- **Responsive testing**: Test across different screen sizes
- **Performance testing**: Monitor rendering performance

### Scalability Considerations

#### Component Library
- **Reusable components**: Extract common patterns into shared components
- **Design system**: Establish consistent design tokens and patterns
- **Documentation**: Document component APIs and usage examples
- **Versioning**: Semantic versioning for component library releases

#### Maintenance
- **Code organization**: Clear file structure and naming conventions
- **Dependency management**: Keep dependencies up to date
- **Technical debt**: Regular refactoring and optimization
- **Knowledge sharing**: Document architectural decisions and patterns

## Framework Extensions

### Future Technology Considerations
- **Vue 4**: Prepare for future Vue.js versions
- **Web Components**: Consider web component compatibility
- **CSS Container Queries**: Adopt when browser support improves
- **CSS Cascade Layers**: Implement for better style organization

### Integration Possibilities
- **Design tokens**: Integrate with design token systems
- **Component testing**: Visual regression testing tools
- **Performance monitoring**: Real user monitoring integration
- **Accessibility testing**: Automated accessibility testing tools

## Figma Restoration Specific Architecture

### File Structure & Organization

#### Project Directory Structure
```
/src/figma-data/                    # Centralized Figma JSON storage
/src/restoration-tips/              # Knowledge base for optimization strategies

/src/components/{ComponentName}/
├── index.vue                       # Main component
├── metadata.json                   # Includes restorationData
├── layout-analysis.json           # Visual analysis results
├── images/                         # Assets (SVG, PNG)
└── results/                        # Screenshots & comparisons
    ├── expected.png                # Figma reference (Phase 1)
    ├── actual.png                  # Component screenshot (Phase 2)
    └── diff.png                    # Comparison result (Phase 2)
```

#### Path Requirements
- **Always use absolute paths** for MCP tool calls
- **Figma data**: Save to `/src/figma-data/`
- **Assets**: Save to component's `images/` directory
- **Screenshots**: Save to component's `results/` directory
- **Knowledge base**: Store in `/src/restoration-tips/`

### Visual-Driven Development Architecture

#### Element Identification Process
1. **Visual Analysis First**: Analyze expected.png for actual visible elements
2. **JSON Mapping**: Map Figma JSON elements to visual reality
3. **Redundancy Filtering**: Filter out invisible/redundant elements (opacity: 0, size: 0)
4. **Structure Optimization**: Optimize structure based on visual hierarchy

#### Layout Conversion Strategy
- **Figma to Modern CSS**: Convert Figma absolute positioning to modern responsive layouts
- **Relationship Analysis**: Analyze relative positioning and spacing relationships
- **Visual Accuracy**: Maintain visual accuracy while improving code structure
- **Complex Element Handling**: Convert complex UI elements to SVG assets when CSS implementation is insufficient

### Asset Processing Architecture

#### Asset Identification Rules
- **Name patterns**: `ic`, `ic_`, `素材`, `material`, `asset`, `icon`, `img`, `image`
- **Node type priority**: RECTANGLE/VECTOR/PATH > INSTANCE/COMPONENT > GROUP/FRAME
- **SVG sizing**: Original size must equal CSS size (no scaling)
- **Complex element strategy**: Download complete UI sections (status bars, nav bars) as single assets

#### Complex Element Optimization Strategy
**When to Convert to Assets:**
- Mobile status bars with detailed icons and precise layouts
- Multi-layer navigation bars with complex controls
- 3D effect cards and complex shadows/gradients
- Complex icon combinations and nested groups
- Gradient and shadow effects that are hard to replicate in CSS
- Elements with imageRef fills or complex boolean operations

**Implementation Pattern:**
```vue
<!-- Instead of complex CSS recreation -->
<div class="complex-status-bar">
  <div class="status-left">...</div>
  <div class="status-right">...</div>
</div>

<!-- Use SVG asset for better accuracy -->
<div class="status-bar">
  <img src="./images/status-bar-complete.svg" alt="状态栏" class="status-bar-img" />
</div>
```

**Expected Results:**
- **Accuracy Improvement**: 5-10% restoration accuracy boost
- **Reduced Complexity**: Simpler CSS and DOM structure
- **Better Fidelity**: Pixel-perfect visual matching
- **Easier Maintenance**: Single asset file vs complex CSS

**Asset Download Strategy:**
1. Identify complex elements during Phase 1 visual analysis
2. Download complete element groups as SVG using `mcp_figma-context_download_figma_images`
3. Replace CSS implementations with `<img>` tags
4. Ensure proper sizing: `width: 100%; height: 100%; object-fit: cover;`

### Quality Assurance Architecture

#### Restoration Accuracy Standards
- **Target**: ≥98% pixel match (threshold: 0.02)
- **Data storage**: Store results in `metadata.json.restorationData`
- **Visual validation**: Use expected.png as ground truth for element filtering
- **Complex Element Strategy**: Convert complex UI elements to SVG assets instead of CSS recreation

#### Performance Requirements
- **SVG Optimization**: Optimize SVG files for minimal size
- **CSS Efficiency**: Use efficient CSS selectors
- **DOM Complexity**: Minimize DOM complexity through visual-driven element filtering

#### Error Handling
- **Path Validation**: Verify absolute paths before tool calls
- **Directory Management**: Ensure target directories exist
- **URL Validation**: Validate Figma URLs and node IDs
- **Server Availability**: Check dev server port availability

### Knowledge Base Integration

#### Knowledge Base Architecture
- **Location**: `/src/restoration-tips/` directory
- **Purpose**: Store optimization strategies and successful patterns
- **Usage**: Consult before optimization iterations when accuracy < 98%
- **Update Strategy**: Document new techniques and solutions for future reference

#### Common Optimization Patterns
- **3x Scaling Issues**: Solutions for high-DPI display rendering
- **Asset Identification**: Proven methods for identifying complex elements
- **Layout Differences**: Strategies for converting absolute to flex positioning
- **Text Rendering**: Font and typography optimization techniques