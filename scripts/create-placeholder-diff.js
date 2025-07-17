import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPlaceholderDiff(outputPath, width = 400, height = 300) {
  const png = new PNG({ width, height });
  
  // 填充浅灰色背景
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = 220;     // R
      png.data[idx + 1] = 220; // G
      png.data[idx + 2] = 220; // B
      png.data[idx + 3] = 255; // A
    }
  }
  
  // 添加一些文字效果（简单的像素绘制）
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  
  // 绘制一个简单的"X"标记
  for (let i = -20; i <= 20; i++) {
    if (centerX + i >= 0 && centerX + i < width && centerY + i >= 0 && centerY + i < height) {
      const idx1 = (width * (centerY + i) + (centerX + i)) << 2;
      png.data[idx1] = 255;     // R
      png.data[idx1 + 1] = 100; // G
      png.data[idx1 + 2] = 100; // B
      png.data[idx1 + 3] = 255; // A
    }
    
    if (centerX - i >= 0 && centerX - i < width && centerY + i >= 0 && centerY + i < height) {
      const idx2 = (width * (centerY + i) + (centerX - i)) << 2;
      png.data[idx2] = 255;     // R
      png.data[idx2 + 1] = 100; // G
      png.data[idx2 + 2] = 100; // B
      png.data[idx2 + 3] = 255; // A
    }
  }
  
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
}

function createPlaceholdersForAllComponents() {
  const publicResultsDir = path.join(__dirname, '../public/results');
  const components = ['ModalRemoveMember', 'ExchangeSuccess', 'AssignmentComplete', 'ScanComplete'];
  
  for (const component of components) {
    const diffPath = path.join(publicResultsDir, component, 'diff.png');
    
    if (!fs.existsSync(diffPath)) {
      console.log(`Creating placeholder diff for ${component}...`);
      createPlaceholderDiff(diffPath);
      console.log(`✅ Created ${diffPath}`);
    } else {
      console.log(`⚠️  ${component} diff already exists`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createPlaceholdersForAllComponents();
}

export { createPlaceholderDiff, createPlaceholdersForAllComponents };
