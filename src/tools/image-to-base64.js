import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

export class ImageToBase64Tool {
  constructor() {
    this.description = 'Convert image file to base64 string, supports both absolute and relative paths';
    this.inputSchema = {
      type: 'object',
      properties: {
        imagePath: {
          type: 'string',
          description: 'Path to the image file (supports absolute and relative paths)'
        },
        includeDataUrl: {
          type: 'boolean',
          default: true,
          description: 'Whether to include data URL prefix (data:image/...;base64,)'
        }
      },
      required: ['imagePath']
    };
  }

  async execute(args) {
    // 验证必传参数
    if (!args.imagePath) {
      throw new Error('❌ 参数错误: imagePath 是必传参数，请提供图片路径');
    }

    const { imagePath, includeDataUrl = true } = args;

    try {
      console.log(chalk.cyan('🖼️  Image to Base64 Converter'));
      console.log(chalk.cyan(`Image Path: ${imagePath}`));
      console.log(chalk.gray('='.repeat(50)));

      // 处理路径：支持绝对路径和相对路径
      let resolvedPath;
      if (path.isAbsolute(imagePath)) {
        resolvedPath = imagePath;
      } else {
        // 相对路径相对于当前工作目录
        resolvedPath = path.resolve(process.cwd(), imagePath);
      }

      console.log(chalk.blue(`📁 Resolved path: ${resolvedPath}`));

      // 检查文件是否存在
      try {
        await fs.access(resolvedPath);
        console.log(chalk.green('✅ Image file found'));
      } catch (error) {
        throw new Error(`❌ 图片文件不存在: ${resolvedPath}`);
      }

      // 获取文件信息
      const stats = await fs.stat(resolvedPath);
      const fileSize = (stats.size / 1024).toFixed(2);
      console.log(chalk.blue(`📊 File size: ${fileSize} KB`));

      // 获取文件扩展名以确定MIME类型
      const ext = path.extname(resolvedPath).toLowerCase();
      const mimeType = this.getMimeType(ext);

      if (!mimeType) {
        throw new Error(`❌ 不支持的图片格式: ${ext}`);
      }

      console.log(chalk.blue(`🎨 MIME type: ${mimeType}`));

      // 读取文件并转换为base64
      console.log(chalk.blue('🔄 Converting to base64...'));
      const imageBuffer = await fs.readFile(resolvedPath);
      const base64String = imageBuffer.toString('base64');

      // 构建最终结果
      let result;
      if (includeDataUrl) {
        result = `data:${mimeType};base64,${base64String}`;
        console.log(chalk.green('✅ Base64 data URL generated'));
      } else {
        result = base64String;
        console.log(chalk.green('✅ Base64 string generated'));
      }

      const base64Size = (result.length / 1024).toFixed(2);
      console.log(chalk.yellow(`📊 Base64 size: ${base64Size} KB`));
      console.log(chalk.gray(`📝 Base64 preview: ${result.substring(0, 50)}...`));

      return {
        success: true,
        imagePath: resolvedPath,
        originalSize: stats.size,
        base64Size: result.length,
        mimeType,
        base64: result,
        includeDataUrl
      };

    } catch (error) {
      console.error(chalk.red('❌ Base64 conversion failed:'), error.message);
      return {
        success: false,
        error: error.message,
        imagePath
      };
    }
  }

  /**
   * 根据文件扩展名获取MIME类型
   * @param {string} ext - 文件扩展名
   * @returns {string|null} MIME类型
   */
  getMimeType(ext) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.ico': 'image/x-icon',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff'
    };

    return mimeTypes[ext] || null;
  }
}