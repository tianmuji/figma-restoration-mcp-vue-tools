import { FormatDetector } from '../format-detector.js';
import { FormatError } from '../error-handler.js';

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
    console.log('🧪 Running FormatDetector Tests...\n');

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

  async assertThrows(fn, expectedError) {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError && !(error instanceof expectedError)) {
        throw new Error(`Expected ${expectedError.name}, got ${error.constructor.name}`);
      }
    }
  }
}

// Test suite
const runner = new TestRunner();

runner.test('should detect formats by extension correctly', async () => {
  runner.assert(FormatDetector.detectByExtension('image.png') === 'png', 'Should detect PNG');
  runner.assert(FormatDetector.detectByExtension('image.jpg') === 'jpeg', 'Should detect JPEG from .jpg');
  runner.assert(FormatDetector.detectByExtension('image.jpeg') === 'jpeg', 'Should detect JPEG from .jpeg');
  runner.assert(FormatDetector.detectByExtension('image.svg') === 'svg', 'Should detect SVG');
  runner.assert(FormatDetector.detectByExtension('image.webp') === 'webp', 'Should detect WebP');
});

runner.test('should handle case insensitive extensions', async () => {
  runner.assert(FormatDetector.detectByExtension('IMAGE.PNG') === 'png', 'Should handle uppercase');
  runner.assert(FormatDetector.detectByExtension('image.JPG') === 'jpeg', 'Should handle uppercase JPG');
  runner.assert(FormatDetector.detectByExtension('image.Svg') === 'svg', 'Should handle mixed case');
});

runner.test('should throw error for unsupported extensions', async () => {
  await runner.assertThrows(() => FormatDetector.detectByExtension('image.bmp'), FormatError);
  await runner.assertThrows(() => FormatDetector.detectByExtension('image.gif'), FormatError);
  await runner.assertThrows(() => FormatDetector.detectByExtension('image.tiff'), FormatError);
});

runner.test('should match file signatures correctly', async () => {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
  runner.assert(
    FormatDetector.matchesSignature(pngSignature, FormatDetector.FILE_SIGNATURES.png),
    'Should match PNG signature'
  );

  const jpegSignature = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
  runner.assert(
    FormatDetector.matchesSignature(jpegSignature, FormatDetector.FILE_SIGNATURES.jpeg),
    'Should match JPEG signature'
  );

  const invalidSignature = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  runner.assert(
    !FormatDetector.matchesSignature(invalidSignature, FormatDetector.FILE_SIGNATURES.png),
    'Should not match invalid signature'
  );
});

runner.test('should handle short buffers in signature matching', async () => {
  const shortBuffer = Buffer.from([0x89, 0x50]); // Too short for PNG signature
  runner.assert(
    !FormatDetector.matchesSignature(shortBuffer, FormatDetector.FILE_SIGNATURES.png),
    'Should not match short buffer'
  );
});

runner.test('should return supported formats list', async () => {
  const formats = FormatDetector.getSupportedFormats();
  runner.assert(Array.isArray(formats), 'Should return array');
  runner.assert(formats.includes('png'), 'Should include PNG');
  runner.assert(formats.includes('jpeg'), 'Should include JPEG');
  runner.assert(formats.includes('svg'), 'Should include SVG');
  runner.assert(formats.includes('webp'), 'Should include WebP');
});

runner.test('should check format support correctly', async () => {
  runner.assert(FormatDetector.isFormatSupported('png'), 'Should support PNG');
  runner.assert(FormatDetector.isFormatSupported('JPEG'), 'Should support JPEG (case insensitive)');
  runner.assert(!FormatDetector.isFormatSupported('bmp'), 'Should not support BMP');
  runner.assert(!FormatDetector.isFormatSupported('gif'), 'Should not support GIF');
});

runner.test('should return correct MIME types', async () => {
  runner.assert(FormatDetector.getMimeType('png') === 'image/png', 'Should return PNG MIME type');
  runner.assert(FormatDetector.getMimeType('jpeg') === 'image/jpeg', 'Should return JPEG MIME type');
  runner.assert(FormatDetector.getMimeType('svg') === 'image/svg+xml', 'Should return SVG MIME type');
  runner.assert(FormatDetector.getMimeType('webp') === 'image/webp', 'Should return WebP MIME type');
  runner.assert(FormatDetector.getMimeType('unknown') === 'application/octet-stream', 'Should return default MIME type');
});

runner.test('should return correct file extensions', async () => {
  runner.assert(FormatDetector.getExtension('png') === '.png', 'Should return PNG extension');
  runner.assert(FormatDetector.getExtension('jpeg') === '.jpg', 'Should return JPEG extension');
  runner.assert(FormatDetector.getExtension('svg') === '.svg', 'Should return SVG extension');
  runner.assert(FormatDetector.getExtension('webp') === '.webp', 'Should return WebP extension');
  runner.assert(FormatDetector.getExtension('unknown') === '', 'Should return empty string for unknown');
});

runner.test('should handle case insensitive format operations', async () => {
  runner.assert(FormatDetector.getMimeType('PNG') === 'image/png', 'Should handle uppercase format');
  runner.assert(FormatDetector.getExtension('JPEG') === '.jpg', 'Should handle uppercase format');
  runner.assert(FormatDetector.isFormatSupported('SVG'), 'Should handle uppercase format');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as formatDetectorTests };