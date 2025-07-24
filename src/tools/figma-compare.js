import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import {
  ensureDirectory
} from '../utils/path-config.js';

export class FigmaCompareTool {
  constructor() {
    this.description = 'Simple Figma component comparison tool: compare existing screenshots and generate diff.png for visual analysis';
    this.inputSchema = {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to compare'
        },
        projectPath: {
          type: 'string',
          default: '/Users/yujie_wu/Documents/work/camscanner-cloud-vue3',
          description: 'Path to the Vue project'
        },
        threshold: {
          type: 'number',
          default: 0.1,
          description: 'Comparison threshold (0-1, lower is more strict)'
        },

        outputPath: {
          type: 'string',
          description: 'Custom output directory for results (optional). If not provided, defaults to src/components/{componentName}/results'
        }
      },
      required: ['componentName']
    };
  }

  async execute(args) {
    const {
      componentName,
      projectPath = '/Users/yujie_wu/Documents/work/camscanner-cloud-vue3',
      threshold = 0.1,
      outputPath
    } = args;

    try {
      console.log(chalk.cyan('🎯 Figma Component Comparison'));
      console.log(chalk.cyan(`Component: ${componentName}`));
      console.log(chalk.gray('='.repeat(60)));

      const resultsDir = outputPath || path.join(projectPath, 'src', 'components', componentName, 'results');
      await ensureDirectory(resultsDir);

      // Check if actual.png exists
      const actualPath = path.join(resultsDir, 'actual.png');
      try {
        await fs.access(actualPath);
        console.log(chalk.green('✅ Found existing screenshot: actual.png'));
      } catch (error) {
        throw new Error(`Screenshot not found: ${actualPath}\n\nPlease take a screenshot first using the snapDOM screenshot tool:\n  snapdom_screenshot_vue-figma-tools --componentName ${componentName}`);
      }

      // Compare images and generate diff.png
      console.log(chalk.blue('🔍 Comparing images...'));
      const comparisonResult = await this.compareImages({
        componentName,
        resultsDir,
        threshold
      });

      console.log(chalk.green('✅ Comparison completed successfully!'));
      console.log(chalk.yellow(`📊 Match Percentage: ${comparisonResult.matchPercentage.toFixed(2)}%`));
      console.log(chalk.gray(`📁 Diff image saved: ${comparisonResult.paths.diff}`));

      // Check quality level
      if (comparisonResult.matchPercentage < 98) {
        console.log(chalk.red('🚨 还原度未达到98%标准，需要启动Self-Reflective分析！'));
      } else {
        console.log(chalk.green('🎉 恭喜！已达到98%还原度标准！'));
      }

      return {
        success: true,
        componentName,
        comparison: comparisonResult,
        summary: {
          matchPercentage: comparisonResult.matchPercentage,
          diffPixels: comparisonResult.diffPixels,
          totalPixels: comparisonResult.totalPixels
        }
      };

    } catch (error) {
      console.error(chalk.red('❌ Comparison failed:'), error.message);
      return {
        success: false,
        error: error.message,
        componentName
      };
    }
  }





  async compareImages({ componentName, resultsDir, threshold }) {
    const expectedPath = path.join(resultsDir, 'expected.png');
    const actualPath = path.join(resultsDir, 'actual.png');
    const diffPath = path.join(resultsDir, 'diff.png');

    // Check if expected image exists
    try {
      await fs.access(expectedPath);
    } catch (error) {
      throw new Error(`Expected image not found: ${expectedPath}. Please ensure the Figma design image is downloaded.`);
    }

    // Ensure actual image is in correct format and size
    await this.normalizeImage(actualPath, expectedPath);

    // Load images
    const expectedBuffer = await fs.readFile(expectedPath);
    const actualBuffer = await fs.readFile(actualPath);

    const expectedPng = PNG.sync.read(expectedBuffer);
    const actualPng = PNG.sync.read(actualBuffer);

    const { width, height } = expectedPng;
    const diffPng = new PNG({ width, height });

    // Compare images with optimized settings for 3x scale
    console.log(chalk.blue(`🔍 Comparing images at ${width} × ${height} resolution...`));

    const diffPixels = pixelmatch(
      expectedPng.data,
      actualPng.data,
      diffPng.data,
      width,
      height,
      {
        threshold: threshold * 0.8, // Slightly more sensitive for high-res images
        includeAA: true, // Include anti-aliasing for better 3x scale comparison
        alpha: 0.05, // Lower alpha threshold for more precise comparison
        aaColor: [255, 255, 0], // Yellow for anti-aliasing differences
        diffColor: [255, 0, 0], // Red for significant differences
        diffColorAlt: [255, 128, 0] // Orange for alternative differences
      }
    );

    // Save diff image
    await fs.writeFile(diffPath, PNG.sync.write(diffPng));

    const totalPixels = width * height;
    const matchPercentage = ((totalPixels - diffPixels) / totalPixels) * 100;

    console.log(chalk.green(`✅ Comparison completed`));
    console.log(chalk.yellow(`📊 Match: ${matchPercentage.toFixed(2)}% (${diffPixels}/${totalPixels} pixels differ)`));

    return {
      matchPercentage,
      diffPixels,
      totalPixels,
      dimensions: { width, height },
      paths: {
        expected: expectedPath,
        actual: actualPath,
        diff: diffPath
      }
    };
  }

  async normalizeImage(actualPath, expectedPath) {
    // Get both image metadata
    const expectedMeta = await sharp(expectedPath).metadata();
    const actualMeta = await sharp(actualPath).metadata();

    console.log(chalk.blue('📐 Image size analysis:'));
    console.log(chalk.gray(`   Expected: ${expectedMeta.width} × ${expectedMeta.height} pixels`));
    console.log(chalk.gray(`   Actual: ${actualMeta.width} × ${actualMeta.height} pixels`));

    // Check if images are already the same size
    if (expectedMeta.width === actualMeta.width && expectedMeta.height === actualMeta.height) {
      console.log(chalk.green('✅ Images are already the same size, no normalization needed'));
      return;
    }

    // Calculate scale factors
    const scaleX = actualMeta.width / expectedMeta.width;
    const scaleY = actualMeta.height / expectedMeta.height;

    console.log(chalk.yellow(`⚠️  Size mismatch detected:`));
    console.log(chalk.gray(`   Scale factors: X=${scaleX.toFixed(2)}x, Y=${scaleY.toFixed(2)}x`));

    // For 3x scale images, we should resize the expected image to match actual size
    // This preserves the high-resolution actual screenshot for accurate comparison
    if (Math.abs(scaleX - 3) < 0.1 && Math.abs(scaleY - 3) < 0.1) {
      console.log(chalk.blue('🔄 Detected 3x scale difference, upscaling expected image...'));
      await sharp(expectedPath)
        .resize(actualMeta.width, actualMeta.height, {
          fit: 'fill',
          kernel: sharp.kernel.nearest // Use nearest neighbor to preserve pixel accuracy
        })
        .ensureAlpha()
        .png()
        .toFile(expectedPath + '.tmp');

      await fs.rename(expectedPath + '.tmp', expectedPath);
      console.log(chalk.green('✅ Expected image upscaled to match actual 3x resolution'));
    } else {
      // For other cases, resize actual to match expected
      console.log(chalk.blue('🔄 Resizing actual image to match expected size...'));
      await sharp(actualPath)
        .resize(expectedMeta.width, expectedMeta.height, { fit: 'fill' })
        .ensureAlpha()
        .png()
        .toFile(actualPath + '.tmp');

      await fs.rename(actualPath + '.tmp', actualPath);
      console.log(chalk.green('✅ Actual image resized to match expected size'));
    }
  }




}
