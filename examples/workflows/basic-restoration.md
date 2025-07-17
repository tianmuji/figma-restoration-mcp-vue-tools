# Basic Figma Restoration Workflow Example

This example demonstrates the complete workflow for restoring a Figma design to a Vue component.

## Prerequisites

1. Figma Restoration Kit installed and configured
2. MCP server running (`yarn mcp`)
3. IDE configured with MCP tools
4. Figma design URL or exported image

## Step-by-Step Example

### 1. Extract Figma Design Data

```javascript
// In your IDE with MCP enabled
const figmaData = await getFigmaData({
  fileKey: "ABC123DEF456",  // From Figma URL
  nodeId: "1:234"           // Optional: specific component
});
```

### 2. Analyze the Design

The AI will analyze the Figma JSON to identify:
- Layout structure (flexbox, grid, absolute positioning)
- Text content and styling
- Images and icons to download
- Component hierarchy

### 3. Generate Vue Component

Based on the analysis, generate a Vue component:

```vue
<template>
  <div class="card-component">
    <div class="card-header">
      <h2 class="card-title">{{ title }}</h2>
      <el-button type="primary" size="small">
        Action
      </el-button>
    </div>
    <div class="card-content">
      <p class="card-description">{{ description }}</p>
      <div class="card-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.views }}</span>
          <span class="stat-label">Views</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.likes }}</span>
          <span class="stat-label">Likes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElButton } from 'element-plus'

const title = ref('Sample Card')
const description = ref('This is a sample card component restored from Figma design.')
const stats = ref({
  views: '1.2k',
  likes: '89'
})
</script>

<style scoped>
.card-component {
  width: 320px;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #666666;
}

.card-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-label {
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
}
</style>
```

### 4. Save and Test Component

```javascript
// Save the component for testing
await save_vue_component({
  componentName: "CardComponent",
  vueCode: generatedVueCode,
  metadata: {
    figmaUrl: "https://www.figma.com/file/ABC123DEF456/Design-File",
    description: "Sample card component",
    createdBy: "AI Assistant"
  }
});
```

### 5. Render and Screenshot

```javascript
// Start development server
await vue_dev_server({ action: "start" });

// Render component
await render_component({
  componentName: "CardComponent",
  timeout: 15000
});

// Take screenshot
await take_screenshot({
  componentName: "CardComponent",
  screenshotOptions: {
    deviceScaleFactor: 3,
    omitBackground: true
  }
});
```

### 6. Compare with Original Design

```javascript
// Compare with Figma design
await compare_images({
  componentName: "CardComponent",
  expectedPath: "assets/card-design.png",
  threshold: 0.1  // 90% accuracy target
});
```

### 7. Complete Validation

```javascript
// Run complete validation workflow
await validate_restoration({
  componentName: "CardComponent",
  vueCode: generatedVueCode,
  expectedImageUrl: "https://figma-image-url.png",
  validationOptions: {
    comparisonThreshold: 0.1,
    viewport: { width: 1200, height: 800 },
    screenshotOptions: { deviceScaleFactor: 3 }
  }
});
```

## Expected Results

After running the validation, you should see:

1. **Component files** in `output/CardComponent/`
2. **Screenshot** in `results/CardComponent/actual.png`
3. **Comparison results** with accuracy percentage
4. **Diff image** showing any differences
5. **Analysis report** with improvement suggestions

## Common Adjustments

### Box Model Issues

```css
/* If dimensions don't match */
.card-component {
  box-sizing: border-box; /* or content-box */
}
```

### Font Rendering

```css
/* For exact font matching */
.card-title {
  font-family: 'SF Pro Display', -apple-system, sans-serif;
  font-weight: 600;
  letter-spacing: -0.01em;
}
```

### Layout Precision

```css
/* For exact spacing */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px; /* Exact height from Figma */
}
```

## Quality Targets

- **Visual Accuracy**: 99%+ match with Figma design
- **Responsive Behavior**: Works across different screen sizes
- **Performance**: Fast rendering and small bundle size
- **Accessibility**: Proper semantic HTML and ARIA attributes

## Next Steps

1. **Integrate into Project**: Copy component to your main project
2. **Add Props**: Make component reusable with props
3. **Add Interactions**: Implement click handlers and animations
4. **Test Thoroughly**: Test in different browsers and devices
5. **Document Usage**: Add component documentation

## Troubleshooting

### Low Accuracy Scores

1. Check box-sizing property
2. Verify font loading
3. Ensure consistent image scaling
4. Review border and padding calculations

### Component Not Rendering

1. Check Vue syntax errors
2. Verify Element Plus imports
3. Test component in isolation
4. Check console for errors

### Performance Issues

1. Optimize images and assets
2. Use lazy loading for heavy components
3. Minimize CSS and JavaScript
4. Test bundle size impact
