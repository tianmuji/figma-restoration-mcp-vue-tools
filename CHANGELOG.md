# Changelog

All notable changes to this project will be documented in this file.

## [4.12.0] - 2025-10-27

### Enhanced
- **Workflow Automation**: Updated cursor rules to automatically optimize all downloaded image assets
- **Format Preservation**: Image optimization now maintains original format by default
- **Workflow Integration**: Added automatic PNG/JPEG optimization step in Phase 2 of restoration workflow
- **Documentation**: Updated tool configuration documentation with image optimization guidelines

### Workflow Improvements
- Download assets → Optimize SVG → Optimize PNG/JPEG → Generate component
- Automatic optimization with intelligent quality settings (quality=85, compressionLevel=9)
- Target 60-70% file size reduction while maintaining web-quality visuals
- Format preservation: PNG stays PNG, JPEG stays JPEG (no webp conversion)

### Documentation Updates
- Enhanced figma-workflow.mdc with automatic image optimization steps
- Updated tool-configuration.mdc with optimize_image tool documentation
- Added format preservation guidelines to prevent unwanted format conversions
- Updated workflow checklists and quality targets

## [4.11.0] - 2025-10-27

### Added
- **New Tool: optimize_image**: Comprehensive image compression tool using Sharp
  - Support for PNG, JPEG, and WebP formats
  - Intelligent quality settings for maximum compression while maintaining visual quality
  - Advanced compression options:
    - PNG: palette optimization, configurable compression level (0-9)
    - JPEG: MozJPEG encoder, progressive encoding, trellis quantization
    - WebP: high-effort compression (0-6), smart subsampling
  - Optional resizing with multiple fit modes (cover, contain, fill, inside, outside)
  - Detailed compression statistics and file size reduction reports
  - Automatic format detection and optimization

### Technical Details
- Uses Sharp (industry-leading image processing library)
- Smart quality defaults (85 for JPEG/WebP, 9 for PNG compression)
- Palette-based PNG optimization for better compression
- MozJPEG encoder for superior JPEG quality at smaller file sizes
- WebP high-effort compression for optimal results

### Performance
- Significant file size reduction (typically 60-80% for JPEG/WebP)
- Maintains visual quality for web use
- Fast processing with Sharp's optimized performance
- Supports batch optimization workflows

## [4.3.0] - 2025-08-06

### Added
- **Enhanced Diff Analysis**: Advanced color-coded region analysis in figma_compare tool
- **Automated Pattern Recognition**: Identifies border stripes, block differences, and text rendering issues
- **Spatial Distribution Analysis**: Categorizes differences by border, content, and text regions
- **Smart Recommendations**: Generates targeted optimization suggestions based on diff patterns
- **Detailed JSON Output**: Comprehensive analysis data for programmatic processing

### Enhanced
- **figma_compare tool**: Now provides detailed diff analysis equivalent to visual inspection
- **Color Region Detection**: Identifies red (structural), orange (medium), and yellow (rendering) differences
- **Pattern Classification**: Automatically detects common diff patterns and their severity
- **Console Output**: Rich colored summary of diff analysis and recommendations

### Technical Improvements
- Pixel-level analysis with region aggregation
- Spatial classification algorithms
- Pattern recognition for common restoration issues
- Enhanced JSON data structure for automated processing

## [4.2.0] - Previous Release
- snapDOM-powered high-quality screenshots
- Intelligent shadow detection
- Basic figma_compare functionality
- SVG optimization tools