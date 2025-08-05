---
inclusion: always
---

# Figma Component Restoration Workflow

> **Technical Implementation**: For detailed technical standards, CSS guidelines, and component architecture, see [`technical-framework.md`](.kiro/steering/technical-framework.md)

## Core Principles

### Visual-First Approach
- **Primary capability**: Use Claude's image recognition to analyze expected.png before processing JSON
- **Element filtering**: Identify truly visible elements vs redundant/invisible ones in Figma JSON
- **Structure optimization**: Optimize nested structures based on visual hierarchy
- **Asset identification**: Detect assets by visual analysis and naming patterns (`ic`, `ic_`, `素材`, `material`, `asset`, `icon`)

### Quality Standards
- **Target accuracy**: ≥98% pixel match (threshold: 0.02)
- **Technical framework**: See `technical-framework.md` for detailed implementation standards
- **Visual validation**: Use expected.png as ground truth for all decisions

## Two-Phase Workflow

### Phase 1: Resource Preparation & Analysis
**Objective**: Gather and validate all resources before implementation
1. **Get Figma Data**: `mcp_figma-context_get_figma_data`
2. **Download Expected Image**: `mcp_figma-context_download_figma_images` (filename: "expected.png")
3. **Visual Analysis**: Analyze expected.png to identify real elements and optimize structure
4. **Download Assets**: `mcp_figma-context_download_figma_images` for identified assets
5. **Generate Preparation Summary**: Output comprehensive resource summary directly to user
6. **User Confirmation**: Wait for user approval before Phase 2

### Phase 2: Restoration Execution
**Prerequisite**: Phase 1 completed and user confirmed
7. **Generate Component**: Create Vue component with validated resources
8. **Screenshot**: `mcp_figma_restoration_mcp_vue_tools_snapdom_screenshot`
9. **Compare**: `mcp_figma_restoration_mcp_vue_tools_figma_compare`
10. **Optimize**: If accuracy < 98%, apply complex element to asset conversion
11. **Iterate**: Repeat steps 8-10 up to 3 times
12. **Document**: Record successful strategies in `/src/restoration-tips/`

## Tool Configuration

### Path Requirements (Always Use Absolute Paths)
- **Figma data**: Save to `/src/figma-data/`
- **Phase 1 reports**: Output summary directly to user for confirmation (no file saving)
- **Expected images**: Save to `/src/components/{ComponentName}/results/expected.png`
- **Assets**: Save to `/src/components/{ComponentName}/images/`
- **Screenshots**: Save to `/src/components/{ComponentName}/results/actual.png`
- **Knowledge base**: Store in `/src/restoration-tips/`

### Key Tool Parameters
- **Screenshot scale**: Always use 3x for high resolution
- **Comparison threshold**: 0.02 (98% accuracy requirement)
- **Dev server port**: 1932 (default)
- **Padding for shadowless components**: 0 (precise cropping)
- **Background**: "transparent"

### Asset Identification Rules
- **Name patterns**: `ic`, `ic_`, `素材`, `material`, `asset`, `icon`, `img`, `image`
- **Node type priority**: RECTANGLE/VECTOR/PATH > INSTANCE/COMPONENT > GROUP/FRAME
- **SVG sizing**: Original size must equal CSS size (no scaling)
- **Complex element strategy**: Download complete UI sections (status bars, nav bars) as single assets

## Visual Analysis Process

### Element Filtering Strategy
1. **Visual inventory**: List all truly visible elements in expected.png
2. **JSON mapping**: Map Figma JSON elements to visual reality
3. **Redundancy removal**: Filter out invisible elements (opacity: 0, size: 0)
4. **Structure optimization**: Simplify nested structures based on visual hierarchy

### Layout Conversion
- Convert Figma absolute positioning to modern responsive layouts
- Maintain visual accuracy while improving code structure
- Follow technical framework guidelines for implementation details

### Implementation Standards
- **Technical details**: Refer to `technical-framework.md` for CSS, layout, and component standards
- **Asset handling**: Follow SVG optimization and sizing guidelines
- **Responsive design**: Apply mobile-first responsive principles

## File Structure

### Directory Organization
```
/src/figma-data/                    # Centralized Figma JSON storage
/src/restoration-tips/              # Knowledge base for optimization strategies

/src/components/{ComponentName}/
├── index.vue                       # Main component
├── metadata.json                   # Component metadata with restorationData
├── layout-analysis.json           # Visual analysis results
├── images/                         # Assets (SVG, PNG)
└── results/                        # Screenshots & comparisons
    ├── expected.png                # Figma reference (Phase 1)
    ├── actual.png                  # Component screenshot (Phase 2)
    └── diff.png                    # Comparison result (Phase 2)
```

## Data Management

### Restoration Data Storage
Store accuracy results in `metadata.json` under `restorationData` field:
```json
{
  "restorationData": {
    "matchPercentage": 98.5,
    "diffPixels": 1250,
    "totalPixels": 85000,
    "dimensions": { "width": 300, "height": 200 },
    "timestamp": "2025-01-01T12:00:00.000Z",
    "status": "completed"
  }
}
```

### Knowledge Base Usage
- **Location**: `/src/restoration-tips/`
- **When to use**: If accuracy < 98%, search for similar issues
- **Common patterns**: asset identification, layout differences
- **Update**: Document new solutions for future reference if confirmed

## Optimization Strategy

### Complex Element to Asset Conversion
**When to Apply**: **Default strategy for complex UI elements** (not just when accuracy < 85%)

**Default Optimization Elements** (Apply Immediately):
- **Mobile status bars with detailed icons** - Always convert to SVG assets by default
- **Navigation bars with complex controls** - Always convert to SVG assets by default

**Additional Target Elements** (Apply when accuracy < 85%):
- 3D effect cards and shadows

**Default Implementation Pattern**:
```vue
<!-- Default approach for mobile status bars -->
<div class="status-bar">
  <img src="./images/status-bar-complete.svg" alt="状态栏" class="status-bar-img" />
</div>

<!-- Default approach for complex navigation bars -->
<div class="nav-bar">
  <img src="./images/nav-bar-complete.svg" alt="导航栏" class="nav-bar-img" />
</div>

<!-- General complex element replacement -->
<div class="element-container">
  <img src="./images/complex-element.svg" alt="Element" class="element-img" />
</div>
```

**Expected Results**: +5-10% accuracy improvement, reduced development time

### Iteration Process
1. If accuracy < 98%, analyze diff.png for issues
2. **Check knowledge base** for similar problems and proven solutions
3. **Apply complex element to asset conversion** for identified elements
4. Re-optimize layout-analysis.json based on visual analysis
5. Regenerate component and re-test
6. Maximum 3 iterations per component
7. **Document new strategies** in `/src/restoration-tips/`

### Knowledge Base Consultation
**Location**: `/src/restoration-tips/` directory
**Quick Access**: Use [INDEX.md](../figma-restoration-mcp-vue-tools/src/restoration-tips/INDEX.md) for fast problem lookup
**Usage**: Consult before optimization iterations when accuracy < 98%
**Search Strategy**:
- **By symptoms**: Check restoration accuracy ranges and visual symptoms
- **By keywords**: Use keyword index for specific technical terms
- **By problem type**: Browse categorized solutions for systematic approach
**Available Strategies**:
- Complex element optimization techniques
- Mobile UI specific solutions
- Font rendering improvements
- Gradient and shadow optimizations

### Common Issues & Solutions
- **Asset misidentification**: Verify node names and types, prioritize RECTANGLE/VECTOR/PATH
- **Redundant elements**: Filter based on visual presence in expected.png
- **Layout differences**: Convert absolute to flex positioning
- **Complex UI elements**: Convert to SVG/PNG assets instead of CSS recreation
- **Mobile status bars**: **Default strategy** - Always download as complete SVG assets immediately
- **Navigation bars**: **Default strategy** - Always download as complete SVG assets immediately
- **3D effects**: Use asset conversion for better accuracy