import fs from 'fs/promises';
import path from 'path';
import { FormatError } from './error-handler.js';

/**
 * FormatDetector - Advanced image format detection using file signatures
 */
export class FormatDetector {
  /**
   * File signatures (magic numbers) for different image formats
   */
  static FILE_SIGNATURES = {
    png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    jpeg: [0xFF, 0xD8, 0xFF],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF header, followed by WEBP
    svg: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], // <?xml or <svg
    svgAlt: [0x3C, 0x73, 0x76, 0x67] // <svg
  };

  /**
   * Detect image format based on file extension
   * @param {string} filePath - Path to the image file
   * @returns {string} - Detected format (png, jpeg, svg, webp)
   */
  static detectByExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.png':
        return 'png';
      case '.jpg':
      case '.jpeg':
        return 'jpeg';
      case '.svg':
        return 'svg';
      case '.webp':
        return 'webp';
      default:
        throw new FormatError(`Unsupported image format: ${ext}. Supported formats: .png, .jpg, .jpeg, .svg, .webp`);
    }
  }

  /**
   * Detect image format by reading file signature (magic numbers)
   * @param {string} filePath - Path to the image file
   * @returns {Promise<string>} - Detected format
   */
  static async detectBySignature(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      
      // Check PNG signature
      if (this.matchesSignature(buffer, this.FILE_SIGNATURES.png)) {
        return 'png';
      }
      
      // Check JPEG signature
      if (this.matchesSignature(buffer, this.FILE_SIGNATURES.jpeg)) {
        return 'jpeg';
      }
      
      // Check WebP signature (RIFF + WEBP)
      if (this.matchesSignature(buffer, this.FILE_SIGNATURES.webp)) {
        // Verify it's actually WebP by checking for "WEBP" at offset 8
        if (buffer.length >= 12) {
          const webpMarker = buffer.slice(8, 12);
          if (webpMarker.toString('ascii') === 'WEBP') {
            return 'webp';
          }
        }
      }
      
      // Check SVG signature (XML or direct SVG)
      if (this.matchesSignature(buffer, this.FILE_SIGNATURES.svg) || 
          this.matchesSignature(buffer, this.FILE_SIGNATURES.svgAlt)) {
        return 'svg';
      }
      
      // Check if it's SVG by looking for SVG content in the first 1KB
      const textContent = buffer.slice(0, 1024).toString('utf8').toLowerCase();
      if (textContent.includes('<svg') || textContent.includes('<?xml')) {
        return 'svg';
      }
      
      throw new FormatError('Unable to detect image format from file signature');
    } catch (error) {
      if (error instanceof FormatError) {
        throw error;
      }
      throw new Error(`Failed to read file for format detection: ${error.message}`);
    }
  }

  /**
   * Detect image format using both extension and signature validation
   * @param {string} filePath - Path to the image file
   * @returns {Promise<string>} - Detected and validated format
   */
  static async detectFormat(filePath) {
    // First, detect by extension for quick check
    const extensionFormat = this.detectByExtension(filePath);
    
    try {
      // Then validate with file signature
      const signatureFormat = await this.detectBySignature(filePath);
      
      // Check if extension matches signature
      if (extensionFormat !== signatureFormat) {
        console.warn(`Warning: File extension suggests ${extensionFormat} but signature indicates ${signatureFormat}`);
        // Trust the signature over the extension
        return signatureFormat;
      }
      
      return extensionFormat;
    } catch (error) {
      // If signature detection fails, fall back to extension
      console.warn(`Warning: Could not validate format by signature, using extension: ${error.message}`);
      return extensionFormat;
    }
  }

  /**
   * Check if buffer matches a given signature
   * @param {Buffer} buffer - File buffer
   * @param {number[]} signature - Expected signature bytes
   * @returns {boolean} - True if signature matches
   */
  static matchesSignature(buffer, signature) {
    if (buffer.length < signature.length) {
      return false;
    }
    
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get supported formats list
   * @returns {string[]} - Array of supported format names
   */
  static getSupportedFormats() {
    return ['png', 'jpeg', 'svg', 'webp'];
  }

  /**
   * Check if a format is supported
   * @param {string} format - Format to check
   * @returns {boolean} - True if format is supported
   */
  static isFormatSupported(format) {
    return this.getSupportedFormats().includes(format.toLowerCase());
  }

  /**
   * Get MIME type for a format
   * @param {string} format - Image format
   * @returns {string} - MIME type
   */
  static getMimeType(format) {
    const mimeTypes = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      webp: 'image/webp'
    };
    
    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Get file extension for a format
   * @param {string} format - Image format
   * @returns {string} - File extension with dot
   */
  static getExtension(format) {
    const extensions = {
      png: '.png',
      jpeg: '.jpg',
      svg: '.svg',
      webp: '.webp'
    };
    
    return extensions[format.toLowerCase()] || '';
  }
}