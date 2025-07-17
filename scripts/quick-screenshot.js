#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

async function takeScreenshot(componentName) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.CHROME_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1440,
      height: 800,
      deviceScaleFactor: 1
    });

    // Navigate to component
    const url = `http://localhost:83/component/${componentName}`;
    console.log(chalk.gray(`📍 Navigating to: ${url}`));
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });

    // Wait for component to load
    let selector = `.${componentName.replace(/([A-Z])/g, (match, letter, index) =>
      index === 0 ? letter.toLowerCase() : '-' + letter.toLowerCase()
    )}`;
    
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
    } catch (error) {
      // Try alternative selectors
      const alternatives = [`#${componentName}`, 'body'];
      for (const alt of alternatives) {
        try {
          await page.waitForSelector(alt, { timeout: 2000 });
          selector = alt;
          break;
        } catch (e) {
          continue;
        }
      }
    }

    console.log(chalk.gray(`🔍 Using selector: ${selector}`));

    // Additional wait for animations/images
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use snapDOM for screenshot
    console.log(chalk.blue('📸 Using snapDOM for high-quality screenshot...'));
    
    const snapResult = await page.evaluate(async (sel) => {
      const element = document.querySelector(sel);
      if (!element) {
        throw new Error(`Element not found: ${sel}`);
      }

      // Import snapdom in the browser context
      const { snapdom } = await import('https://cdn.jsdelivr.net/npm/@zumer/snapdom/dist/snapdom.mjs');

      // 精确捕获配置 - 无额外边距以确保与Figma对齐
      // 注意: 不使用wrapper padding以避免尺寸偏差

      // 直接捕获元素，不添加padding包装
      const snapDOMOptions = {
        scale: 3,
        compress: true,
        fast: false,
        embedFonts: true,
        backgroundColor: 'transparent',
        includeBoxShadow: true,      // 包含阴影效果
        padding: 0                   // 精确对齐 (关键配置!)
      };

      const result = await snapdom(element, snapDOMOptions);

      // Convert to PNG blob
      const blob = await result.toBlob({ type: 'png' });

      // Convert blob to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }, selector);

    // Save the base64 image to file
    const resultsDir = path.join(process.cwd(), 'results', componentName);
    await fs.mkdir(resultsDir, { recursive: true });
    
    const screenshotPath = path.join(resultsDir, 'actual.png');
    const base64Data = snapResult.replace(/^data:image\/png;base64,/, '');
    await fs.writeFile(screenshotPath, Buffer.from(base64Data, 'base64'));

    console.log(chalk.green(`✅ Screenshot saved: ${screenshotPath}`));

    return {
      success: true,
      path: screenshotPath,
      url,
      selector
    };

  } finally {
    await browser.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = process.argv[2];
  if (!componentName) {
    console.error('Usage: node quick-screenshot.js <componentName>');
    process.exit(1);
  }
  
  takeScreenshot(componentName).catch(console.error);
}

export { takeScreenshot };
