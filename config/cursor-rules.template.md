# Figma Restoration Kit - Cursor Rules

## Project Integration

This project includes the Figma Restoration Kit as a submodule/package. The kit provides MCP tools for converting Figma designs to Vue components.

## Figma Restoration Workflow

### 1. Extract Figma Data
Use MCP tools to get design data from Figma:
```javascript
// Get Figma file data
await getFigmaData({
  fileKey: "figma-file-key",
  nodeId: "node-id" // optional
});
```

### 2. Generate Vue Component
Convert Figma JSON to Vue component:
- Analyze the Figma JSON structure
- Identify layout patterns and components
- Generate semantic Vue component code
- Use proper CSS for positioning and styling

### 3. Test and Validate
Use the restoration validation workflow:
```javascript
await validateRestoration({
  componentName: "ComponentName",
  vueCode: "generated-vue-code",
  expectedImageUrl: "figma-design-image-url"
});
```

## Code Generation Guidelines

### Vue Component Structure
- Use composition API with `<script setup>`
- Implement proper component hierarchy
- Use semantic HTML elements
- Apply responsive design principles

### CSS Guidelines
- Use flexbox for layout when possible
- Implement proper box model (content-box vs border-box)
- Match Figma dimensions exactly
- Use CSS custom properties for theming

### Element Plus Integration
- Use Element Plus components when appropriate
- Follow Element Plus design patterns
- Maintain consistent styling

## Testing Requirements

### Component Testing
- Generate components in `mcp-vue-tools/output/`
- Take screenshots for comparison
- Achieve 99%+ visual accuracy
- Test responsive behavior

### Validation Process
1. Generate Vue component from Figma data
2. Render component in browser
3. Take screenshot at 3x scale
4. Compare with Figma design image
5. Analyze differences and iterate

## File Organization

### Component Output
- Generated components: `mcp-vue-tools/output/[ComponentName]/`
- Screenshots: `mcp-vue-tools/results/[ComponentName]/`
- Assets: `mcp-vue-tools/assets/`

### Documentation
- Process documentation: `mcp-vue-tools/docs/`
- Examples: `mcp-vue-tools/examples/`
- Configuration: `mcp-vue-tools/config/`

## MCP Tools Available

1. **vue_dev_server** - Manage Vue development server
2. **save_vue_component** - Save AI-generated components
3. **render_component** - Render components in browser
4. **take_screenshot** - Capture component screenshots
5. **compare_images** - Compare actual vs expected images
6. **manage_benchmark** - Manage testing workflow
7. **validate_restoration** - Complete validation workflow

## Best Practices

### Design Analysis
- Analyze Figma JSON coordinate data (x, y, width, height)
- Identify image assets and SVG icons
- Structure components hierarchically
- Consider responsive breakpoints

### Code Quality
- Write clean, maintainable Vue code
- Use TypeScript when beneficial
- Follow Vue 3 best practices
- Implement proper error handling

### Testing Strategy
- Test components in isolation
- Validate visual accuracy
- Check responsive behavior
- Document any limitations

## Troubleshooting

### Common Issues
- Box model differences (check box-sizing)
- Image scaling problems (use 3x scale)
- Font rendering differences
- Border width calculations

### Debug Process
1. Check Figma JSON data accuracy
2. Verify CSS box model implementation
3. Compare coordinate calculations
4. Test in different browsers

## Integration Notes

- The Figma Restoration Kit operates independently
- All dependencies are contained within the kit
- No modifications to main project required
- Can be used as git submodule or standalone package
