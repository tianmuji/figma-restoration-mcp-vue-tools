# Figma Restoration Benchmark System

A comprehensive benchmark system for tracking and analyzing Figma component restoration quality.

## Quick Start

```bash
# Run complete benchmark (scan, analyze, generate report, update README)
npm run benchmark

# Generate report only (skip README update)
npm run benchmark:report

# Update README only (skip report generation)
npm run benchmark:update-readme
```

## Command Line Options

```bash
# Show help
node scripts/benchmark/benchmark.js --help

# Run with verbose logging
npm run benchmark -- --verbose

# Preview changes without writing files
npm run benchmark -- --dry-run

# Skip README update
npm run benchmark -- --no-readme

# Custom components directory
npm run benchmark -- --components-dir ./my-components

# Custom output directory for reports
npm run benchmark -- --output-dir ./my-reports
```

## What It Does

1. **Scans Components**: Discovers all components in `src/components/`
2. **Collects Data**: Extracts restoration metrics from `metadata.json` files
3. **Calculates Metrics**: Computes accuracy statistics and quality scores
4. **Generates Reports**: Creates JSON reports with detailed analysis
5. **Updates README**: Synchronizes benchmark results to README.md

## Output Files

- `benchmark-reports/benchmark-report.json` - Detailed JSON report
- `README.md` - Updated with benchmark section
- `README.md.backup-*` - Automatic backups before updates

## Component Requirements

For accurate benchmarking, components should have:

```
src/components/ComponentName/
├── metadata.json          # Component metadata with restorationData
├── results/
│   ├── expected.png      # Reference image from Figma
│   ├── actual.png        # Component screenshot
│   └── diff.png          # Comparison result
└── images/               # Component assets (optional)
    ├── icon1.svg
    └── icon2.png
```

## Metadata Format

```json
{
  "componentName": "ExampleComponent",
  "figmaNodeId": "1234:5678",
  "figmaFileKey": "abcd1234",
  "restorationData": {
    "status": "completed",
    "matchPercentage": 98.5,
    "diffPixels": 1250,
    "totalPixels": 85000,
    "timestamp": "2025-01-07T12:00:00.000Z"
  }
}
```

## Quality Grades

- **A (90-100%)**: Excellent restoration quality
- **B (80-89%)**: Good restoration quality  
- **C (70-79%)**: Fair restoration quality
- **D (60-69%)**: Poor restoration quality
- **F (<60%)**: Needs significant improvement

## Troubleshooting

### No Components Found
- Ensure components exist in `src/components/`
- Check that component directories contain required files

### README Update Failed
- Check file permissions for README.md
- Verify README.md exists and is writable
- Review backup files if restoration is needed

### Performance Issues
- Use `--verbose` flag to identify bottlenecks
- Consider processing components in smaller batches
- Check available system memory

## Integration with CI/CD

```yaml
# GitHub Actions example
- name: Run Benchmark
  run: |
    npm run benchmark
    git add README.md
    git commit -m "Update benchmark results" || exit 0
```

## API Usage

```javascript
import { BenchmarkOrchestrator } from './scripts/benchmark/benchmark.js';

const orchestrator = new BenchmarkOrchestrator({
  componentsDir: './src/components',
  outputDir: './reports',
  verbose: true
});

const result = await orchestrator.execute();
console.log('Benchmark completed:', result.success);
```