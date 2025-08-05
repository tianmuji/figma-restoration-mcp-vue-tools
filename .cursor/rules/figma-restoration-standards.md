---
inclusion: always
---

# Figma Component Restoration Standards

> **Technical Implementation**: For detailed technical standards, CSS guidelines, and component architecture, see [`technical-framework.md`](.kiro/steering/technical-framework.md)

## Two-Phase Workflow Architecture

### Phase 1: Resource Preparation & Analysis
**Objective**: Gather and analyze all necessary resources, generate preparation report for user confirmation
- **Steps**: 1-4 (Get Figma data, Download expected image, Visual analysis, Download assets)
- **Output**: Preparation summary displayed to user + User confirmation interface
- **Key Strategy**: Visual-driven analysis using Claude's image recognition capabilities

### Phase 2: Restoration Execution  
**Objective**: Execute actual component restoration based on user-confirmed resources
- **Steps**: 5-10 (Sub-component restoration, Generate code, Screenshot comparison, Optimization iterations)
- **Output**: Completed Vue component + Restoration accuracy report
- **Prerequisite**: Phase 1 completed and user confirmed

## Project Standards

### Code Quality Requirements
- **Framework compliance**: Follow `technical-framework.md` for all implementation details
- **Component architecture**: Vue 3 Composition API with TypeScript
- **Styling approach**: Component-scoped styles with semantic HTML

## File Structure & Paths

> **Technical Details**: For complete file structure, asset processing, and architecture details, see [`technical-framework.md`](.kiro/steering/technical-framework.md)

### Key Path Requirements
- **Always use absolute paths** for MCP tool calls
- **Figma data**: Save to `/src/figma-data/`
- **Assets**: Save to component's `images/` directory
- **Screenshots**: Save to component's `results/` directory
- **Knowledge base**: Store in `/src/restoration-tips/`

## MCP Tool Configuration

### Essential Tools
- `mcp_figma-context_get_figma_data` - Figma data extraction
- `mcp_figma-context_download_figma_images` - Asset downloads
- `mcp_figma_restoration_mcp_vue_tools_snapdom_screenshot` - Component screenshots
- `mcp_figma_restoration_mcp_vue_tools_figma_compare` - Pixel comparison
- `mcp_figma_restoration_mcp_vue_tools_optimize_svg` - SVG optimization

### Screenshot Configuration
- **Scale**: Always use 3x for high resolution
- **Padding**: Set to 0 for shadowless components (precise cropping)
- **Background**: "transparent"
- **Port**: Default 1932 for dev server

### Asset Processing
> **Technical Details**: For complete asset processing architecture, see [`technical-framework.md`](.kiro/steering/technical-framework.md)

- **Asset identification**: Look for keywords `ic`, `ic_`, `素材`, `material`, `asset`, `icon`
- **SVG sizing**: Original size must equal CSS size (no scaling)
- **Priority**: RECTANGLE/VECTOR/PATH nodes over containers

## Quality Standards

### Restoration Accuracy
- **Target**: ≥98% pixel match (threshold: 0.02)
- **Data storage**: Store results in `metadata.json.restorationData`
- **Visual validation**: Use expected.png as ground truth for element filtering
- **Complex Element Strategy**: Convert complex UI elements to SVG assets instead of CSS recreation

### Optimization Strategies (Based on Experience)
> **Technical Details**: For complete optimization architecture and implementation patterns, see [`technical-framework.md`](.kiro/steering/technical-framework.md)

- **Complex Element to Asset Conversion**: For elements like status bars, navigation bars, 3D effects
- **Expected Improvement**: 5-10% accuracy boost when converting complex elements to SVG assets
- **Asset Priority**: RECTANGLE/VECTOR/PATH nodes over containers, specific shape names over semantic names

## Visual-Driven Development

> **Technical Details**: For complete visual-driven development architecture, asset processing, and optimization strategies, see [`technical-framework.md`](.kiro/steering/technical-framework.md)

### Element Identification Process
1. Analyze expected.png for actual visible elements
2. Map Figma JSON elements to visual reality
3. Filter out invisible/redundant elements (opacity: 0, size: 0)
4. Optimize structure based on visual hierarchy

### Layout Strategy
- Convert Figma absolute positioning to modern responsive layouts
- Analyze relative positioning and spacing relationships
- Maintain visual accuracy while improving code structure
- **Convert complex UI elements to SVG assets when CSS implementation is insufficient**
- Follow technical framework guidelines for specific implementation details

### Knowledge Base Integration
- **Location**: `/src/restoration-tips/` directory
- **Quick Access**: Use [INDEX.md](../figma-restoration-mcp-vue-tools/src/restoration-tips/INDEX.md) for instant problem lookup
- **Purpose**: Store optimization strategies and successful patterns
- **Usage**: Consult before optimization iterations when accuracy < 98%
- **Search Methods**:
  - **By restoration accuracy**: Find solutions for specific accuracy ranges (<90%, 90-95%, 95-98%)
  - **By symptoms**: Quick symptom-to-solution mapping
  - **By keywords**: Technical term index for precise problem identification
- **Update**: Document new techniques and solutions for future reference