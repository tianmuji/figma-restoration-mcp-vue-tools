# Figma Restoration Workflow

This document describes the complete workflow for restoring Figma designs to Vue components using the Figma Restoration Kit.

## Overview

The restoration process involves several key steps:

1. **Design Analysis** - Extract and analyze Figma design data
2. **Component Generation** - Convert design data to Vue component code
3. **Testing & Validation** - Render and compare with original design
4. **Iteration & Refinement** - Fix issues and improve accuracy

## Step-by-Step Workflow

### Step 1: Extract Figma Design Data

#### Using Figma MCP Tools

```javascript
// Get design data from Figma URL
const figmaData = await getFigmaData({
  fileKey: "your-figma-file-key",  // From Figma URL
  nodeId: "your-node-id"           // Optional: specific component
});
```

#### Manual Figma Export

1. Open your Figma design
2. Select the component/frame to restore
3. Export as PNG at 3x scale
4. Note the component dimensions and properties

### Step 2: Analyze Design Structure

#### Automatic Analysis (Recommended)

The AI will analyze the Figma JSON data to:
- Identify layout patterns (flex, grid, absolute positioning)
- Extract text content and styling
- Locate images and icons that need to be downloaded
- Determine component hierarchy

#### Manual Analysis

If using exported images:
- Identify main layout structure
- Note text content and fonts
- List required images/icons
- Determine responsive behavior

### Step 3: Generate Vue Component

#### AI-Powered Generation

Provide the Figma data to AI with instructions:

```
Please convert this Figma design to a Vue component:
- Use composition API with <script setup>
- Implement proper semantic HTML
- Use flexbox for layout
- Match exact dimensions from Figma
- Include all text content
- Use Element Plus components where appropriate
```

#### Component Structure Guidelines

```vue
<template>
  <div class="component-name">
    <!-- Semantic HTML structure -->
    <!-- Use proper Element Plus components -->
    <!-- Match Figma layout exactly -->
  </div>
</template>

<script setup>
// Composition API
// Props and reactive data
// Event handlers
</script>

<style scoped>
/* Exact CSS to match Figma */
/* Use flexbox for layout */
/* Match dimensions precisely */
</style>
```

### Step 4: Save and Test Component

#### Save Component for Testing

```javascript
await save_vue_component({
  componentName: "MyComponent",
  vueCode: generatedVueCode,
  metadata: {
    figmaUrl: "figma-design-url",
    description: "Component description",
    createdBy: "AI Assistant"
  }
});
```

#### Start Development Server

```javascript
await vue_dev_server({ action: "start", port: 83 });
```

### Step 5: Render and Screenshot

#### Render Component

```javascript
await render_component({
  componentName: "MyComponent",
  timeout: 15000,
  viewport: { width: 1200, height: 800 }
});
```

#### Take Screenshot

```javascript
await take_screenshot({
  componentName: "MyComponent",
  screenshotOptions: {
    deviceScaleFactor: 3,  // Match Figma 3x export
    omitBackground: true
  }
});
```

### Step 6: Compare with Original Design

#### Automated Comparison

```javascript
await compare_images({
  componentName: "MyComponent",
  expectedPath: "path/to/figma-design.png",
  actualPath: "path/to/screenshot.png",
  threshold: 0.1  // 90% accuracy target
});
```

#### Complete Validation Workflow

```javascript
await validate_restoration({
  componentName: "MyComponent",
  vueCode: generatedVueCode,
  expectedImageUrl: "figma-design-image-url",
  validationOptions: {
    comparisonThreshold: 0.1,
    viewport: { width: 1200, height: 800 },
    screenshotOptions: { deviceScaleFactor: 3 }
  }
});
```

### Step 7: Analyze Results and Iterate

#### Review Comparison Results

The comparison will generate:
- **Diff image** showing pixel differences
- **Accuracy percentage** (target: 99%+)
- **Detailed analysis** of problem areas
- **Improvement suggestions**

#### Common Issues and Fixes

1. **Box Model Differences**
   ```css
   /* Fix: Ensure consistent box-sizing */
   .component {
     box-sizing: border-box; /* or content-box to match Figma */
   }
   ```

2. **Font Rendering Differences**
   ```css
   /* Fix: Use exact font properties */
   .text {
     font-family: 'Exact Font Name', sans-serif;
     font-weight: 400;
     letter-spacing: 0.5px;
   }
   ```

3. **Image Scaling Issues**
   ```css
   /* Fix: Ensure proper image scaling */
   .image {
     width: 100%;
     height: auto;
     object-fit: cover;
   }
   ```

4. **Layout Positioning**
   ```css
   /* Fix: Use flexbox instead of absolute positioning */
   .container {
     display: flex;
     align-items: center;
     justify-content: space-between;
   }
   ```

### Step 8: Refinement Process

#### Iterative Improvement

1. **Analyze diff results** to identify specific problem areas
2. **Update Vue component** with targeted fixes
3. **Re-test and compare** until accuracy reaches 99%+
4. **Document any limitations** or design compromises

#### Best Practices for High Accuracy

1. **Use exact dimensions** from Figma boundingBox data
2. **Match font properties** precisely
3. **Implement proper spacing** using Figma gap/padding values
4. **Handle border-box vs content-box** correctly
5. **Use 3x scale images** for comparison
6. **Test in same browser** as screenshot tool
7. **Critical snapDOMOptions configuration**:
   ```javascript
   "snapDOMOptions": {
     "scale": 3,
     "compress": true,
     "embedFonts": true,
     "includeBoxShadow": true,
     "padding": 0  // 关键: 确保与Figma导出精确对齐
   }
   ```
   ⚠️ **Warning**: Using `padding > 0` can reduce accuracy from 98.33% to 93.23%

## Advanced Workflows

### Responsive Component Restoration

1. Export Figma designs at multiple breakpoints
2. Generate responsive Vue component with media queries
3. Test at different viewport sizes
4. Compare screenshots at each breakpoint

### Component System Restoration

1. Identify reusable design components
2. Create base components first
3. Build complex components using base components
4. Maintain design system consistency

### Batch Processing

```javascript
// Process multiple components
const components = ['Header', 'Card', 'Button', 'Footer'];

for (const componentName of components) {
  await validate_restoration({
    componentName,
    vueCode: await generateComponent(componentName),
    expectedImageUrl: `designs/${componentName}.png`
  });
}
```

## Quality Assurance

### Accuracy Targets

- **99%+ pixel accuracy** for static components
- **95%+ accuracy** for responsive components
- **90%+ accuracy** for complex interactive components

### Testing Checklist

- [ ] Component renders without errors
- [ ] Layout matches Figma design exactly
- [ ] Text content is correct and styled properly
- [ ] Images and icons are positioned correctly
- [ ] Colors match the design specification
- [ ] Spacing and dimensions are accurate
- [ ] Component is responsive (if required)
- [ ] Accessibility standards are met

### Documentation Requirements

- Component purpose and usage
- Figma design source URL
- Known limitations or compromises
- Props and customization options
- Integration instructions

## Troubleshooting

### Common Workflow Issues

1. **Low accuracy scores**
   - Check box-sizing property
   - Verify font loading
   - Ensure 3x scale consistency

2. **Component not rendering**
   - Check Vue syntax errors
   - Verify Element Plus imports
   - Test component in isolation

3. **Screenshot differences**
   - Ensure consistent browser environment
   - Check viewport settings
   - Verify image loading completion

### Getting Help

- Review [troubleshooting guide](troubleshooting.md)
- Check [examples](../examples/) for reference
- Use MCP tools for debugging
- Analyze diff images for specific issues

## Next Steps

After mastering the basic workflow:

1. Explore [advanced examples](../examples/advanced/)
2. Set up [automated testing](testing.md)
3. Integrate with your [design system](design-system.md)
4. Contribute improvements to the kit
