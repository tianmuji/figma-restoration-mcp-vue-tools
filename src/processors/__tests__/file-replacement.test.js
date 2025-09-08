import fs from 'fs/promises';
import path from 'path';
import { BaseProcessor } from '../base-processor.js';

/**
 * Test implementation of BaseProcessor for file replacement testing
 */
class TestProcessor extends BaseProcessor {
  constructor() {
    super('test');
  }

  async optimize(inputPath, config = {}) {
    return { success: true };
  }
}

/**
 * Simple test runner
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running File Replacement Tests...\n');

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
}

// Test suite
const runner = new TestRunner();

runner.test('should create and clean up temporary files safely', async () => {
  const processor = new TestProcessor();
  
  // Create test files
  const originalPath = '/tmp/test-original.txt';
  const optimizedPath = '/tmp/test-optimized.txt';
  
  const originalContent = 'Original content';
  const optimizedContent = 'Optimized content';
  
  try {
    // Create test files
    await fs.writeFile(originalPath, originalContent);
    await fs.writeFile(optimizedPath, optimizedContent);
    
    // Test file replacement
    await processor.replaceFile(originalPath, optimizedPath, false);
    
    // Verify replacement worked
    const finalContent = await fs.readFile(originalPath, 'utf-8');
    runner.assert(finalContent === optimizedContent, 'Should replace original with optimized content');
    
    // Verify optimized file was moved (not copied)
    const optimizedExists = await fs.access(optimizedPath).then(() => true).catch(() => false);
    runner.assert(!optimizedExists, 'Should move (not copy) optimized file');
    
  } finally {
    // Cleanup
    await fs.unlink(originalPath).catch(() => {});
    await fs.unlink(optimizedPath).catch(() => {});
  }
});

runner.test('should create backup when requested', async () => {
  const processor = new TestProcessor();
  
  // Create test files
  const originalPath = '/tmp/test-backup-original.txt';
  const optimizedPath = '/tmp/test-backup-optimized.txt';
  
  const originalContent = 'Original content for backup';
  const optimizedContent = 'Optimized content for backup';
  
  try {
    // Create test files
    await fs.writeFile(originalPath, originalContent);
    await fs.writeFile(optimizedPath, optimizedContent);
    
    // Test file replacement with backup
    await processor.replaceFile(originalPath, optimizedPath, true);
    
    // Verify replacement worked
    const finalContent = await fs.readFile(originalPath, 'utf-8');
    runner.assert(finalContent === optimizedContent, 'Should replace original with optimized content');
    
    // Verify backup was created
    const files = await fs.readdir('/tmp');
    const backupFiles = files.filter(f => f.includes('test-backup-original.txt.backup.'));
    runner.assert(backupFiles.length > 0, 'Should create backup file');
    
    // Verify backup content
    const backupPath = `/tmp/${backupFiles[0]}`;
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    runner.assert(backupContent === originalContent, 'Backup should contain original content');
    
    // Cleanup backup
    await fs.unlink(backupPath).catch(() => {});
    
  } finally {
    // Cleanup
    await fs.unlink(originalPath).catch(() => {});
    await fs.unlink(optimizedPath).catch(() => {});
  }
});

runner.test('should handle file statistics correctly', async () => {
  const processor = new TestProcessor();
  
  const testPath = '/tmp/test-stats.txt';
  const testContent = 'Test content for statistics';
  
  try {
    // Create test file
    await fs.writeFile(testPath, testContent);
    
    // Get file stats
    const stats = await processor.getFileStats(testPath);
    
    runner.assert(typeof stats.size === 'number', 'Should return file size');
    runner.assert(stats.size === Buffer.byteLength(testContent), 'Should return correct file size');
    runner.assert(stats.modified instanceof Date, 'Should return modification date');
    runner.assert(stats.created instanceof Date, 'Should return creation date');
    
  } finally {
    // Cleanup
    await fs.unlink(testPath).catch(() => {});
  }
});

runner.test('should calculate compression statistics correctly', async () => {
  const processor = new TestProcessor();
  
  const stats = processor.calculateCompressionStats(1000, 750);
  
  runner.assert(stats.originalSize === 1000, 'Should have correct original size');
  runner.assert(stats.optimizedSize === 750, 'Should have correct optimized size');
  runner.assert(stats.reduction === 250, 'Should calculate reduction correctly');
  runner.assert(stats.reductionPercentage === 25, 'Should calculate percentage correctly');
  runner.assert(stats.compressionRatio === 0.75, 'Should calculate compression ratio correctly');
});

runner.test('should handle atomic file operations', async () => {
  const processor = new TestProcessor();
  
  const originalPath = '/tmp/test-atomic-original.txt';
  const optimizedPath = '/tmp/test-atomic-optimized.txt';
  
  const originalContent = 'Original atomic content';
  const optimizedContent = 'Optimized atomic content';
  
  try {
    // Create test files
    await fs.writeFile(originalPath, originalContent);
    await fs.writeFile(optimizedPath, optimizedContent);
    
    // Test atomic replacement
    await processor.replaceFile(originalPath, optimizedPath, false);
    
    // Verify the operation was atomic (original file should have new content)
    const finalContent = await fs.readFile(originalPath, 'utf-8');
    runner.assert(finalContent === optimizedContent, 'Should atomically replace content');
    
    // Verify no temporary states exist
    const optimizedExists = await fs.access(optimizedPath).then(() => true).catch(() => false);
    runner.assert(!optimizedExists, 'Should not leave temporary files');
    
  } finally {
    // Cleanup
    await fs.unlink(originalPath).catch(() => {});
    await fs.unlink(optimizedPath).catch(() => {});
  }
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as fileReplacementTests };