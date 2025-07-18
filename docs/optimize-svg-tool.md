# OptimizeSVG Tool

The `optimize_svg` tool uses SVGO (SVG Optimizer) to optimize SVG files, reducing their file size while maintaining visual quality.

## Features

- **File Size Reduction**: Typically achieves 30-70% file size reduction
- **Quality Preservation**: Maintains visual appearance while optimizing
- **Flexible Output**: Can overwrite original file or save to a new location
- **Custom Configuration**: Supports custom SVGO plugin configurations
- **Error Handling**: Comprehensive validation and error reporting
- **Progress Feedback**: Real-time optimization progress and results

## Usage

### Basic Optimization (Overwrite Original)

```javascript
{
  "inputPath": "path/to/your/file.svg"
}
```

### Save to Different Location

```javascript
{
  "inputPath": "path/to/input.svg",
  "outputPath": "path/to/optimized.svg"
}
```

### Custom SVGO Configuration

```javascript
{
  "inputPath": "path/to/input.svg",
  "outputPath": "path/to/optimized.svg",
  "svgoConfig": {
    "plugins": [
      {
        "name": "preset-default",
        "params": {
          "overrides": {
            "removeViewBox": false,
            "cleanupIds": false
          }
        }
      }
    ],
    "multipass": false,
    "floatPrecision": 3
  }
}
```

## Parameters

### Required Parameters

- **inputPath** (string): Path to the input SVG file

### Optional Parameters

- **outputPath** (string): Path for the optimized SVG file. If not provided, overwrites the original file
- **svgoConfig** (object): Custom SVGO configuration object

### SVGO Configuration Options

- **plugins** (array): Array of SVGO plugins to use
- **multipass** (boolean): Enable multipass optimization for better results
- **floatPrecision** (number): Precision for floating point numbers

## Default Configuration

The tool uses the following default SVGO configuration:

```javascript
{
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertShapeToPath: false,
        },
      },
    },
    { name: 'convertShapeToPath' },
    { name: 'mergePaths' },
  ],
  multipass: true,
  floatPrecision: 2
}
```

## Response Format

### Success Response

```javascript
{
  "success": true,
  "inputPath": "/absolute/path/to/input.svg",
  "outputPath": "/absolute/path/to/output.svg",
  "optimization": {
    "originalSize": 1024,
    "optimizedSize": 512,
    "reduction": 512,
    "reductionPercentage": 50.0
  },
  "config": { /* SVGO configuration used */ },
  "summary": {
    "method": "SVGO",
    "status": "completed",
    "sizeSaved": "512 B",
    "percentageSaved": "50.00%"
  }
}
```

### Error Response

```javascript
{
  "success": false,
  "error": "Error message describing what went wrong",
  "inputPath": "path/to/input.svg"
}
```

## Common Optimizations

The tool performs various optimizations including:

- Removing unnecessary whitespace and comments
- Simplifying path data
- Converting CSS styles to inline styles
- Removing unused IDs and attributes
- Merging similar paths
- Optimizing numeric precision
- Removing redundant elements

## Error Handling

The tool handles various error scenarios:

- **File Not Found**: Validates that the input file exists
- **Invalid File Type**: Ensures the input file has a `.svg` extension
- **Permission Issues**: Handles read/write permission problems
- **Invalid SVG Content**: Reports SVGO processing errors
- **Directory Creation**: Automatically creates output directories if needed

## Best Practices

1. **Backup Important Files**: Always backup original SVG files before optimization
2. **Test Visual Output**: Verify that optimized SVGs render correctly
3. **Custom Configurations**: Use custom SVGO configs for specific requirements
4. **Batch Processing**: Process multiple files by calling the tool repeatedly
5. **Version Control**: Use version control to track optimization changes

## Integration Examples

### With Figma Workflow

```javascript
// After downloading SVG assets from Figma
await optimizeSVG({
  inputPath: "assets/icons/download.svg",
  outputPath: "assets/icons/download-optimized.svg"
});
```

### Batch Processing

```javascript
const svgFiles = ["icon1.svg", "icon2.svg", "icon3.svg"];

for (const file of svgFiles) {
  await optimizeSVG({
    inputPath: `assets/${file}`,
    outputPath: `assets/optimized/${file}`
  });
}
```

## Performance

- **Speed**: Typically processes files in milliseconds
- **Memory**: Low memory footprint, suitable for large files
- **Scalability**: Can handle files from bytes to megabytes
- **Reliability**: Robust error handling and validation
