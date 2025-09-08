import { FormatDetector } from '../utils/format-detector.js';
import { FormatError } from '../utils/error-handler.js';

/**
 * ProcessorFactory - Factory for creating appropriate image processors
 */
export class ProcessorFactory {
  /**
   * Registry of available processors
   */
  static processors = new Map();

  /**
   * Register a processor for a specific format
   * @param {string} format - Image format (png, jpeg, svg, webp)
   * @param {Class} ProcessorClass - Processor class constructor
   */
  static registerProcessor(format, ProcessorClass) {
    this.processors.set(format.toLowerCase(), ProcessorClass);
  }

  /**
   * Create a processor for the given file
   * @param {string} filePath - Path to the image file
   * @returns {Promise<BaseProcessor>} - Appropriate processor instance
   */
  static async createProcessor(filePath) {
    // Detect the image format
    const format = await FormatDetector.detectFormat(filePath);
    
    // Get the processor class for this format
    const ProcessorClass = this.processors.get(format);
    
    if (!ProcessorClass) {
      throw new FormatError(
        `No processor available for format: ${format}. Available formats: ${Array.from(this.processors.keys()).join(', ')}`,
        format
      );
    }
    
    // Create and return processor instance
    return new ProcessorClass();
  }

  /**
   * Create a processor for a specific format (without file detection)
   * @param {string} format - Image format
   * @returns {BaseProcessor} - Processor instance
   */
  static createProcessorByFormat(format) {
    const ProcessorClass = this.processors.get(format.toLowerCase());
    
    if (!ProcessorClass) {
      throw new FormatError(
        `No processor available for format: ${format}. Available formats: ${Array.from(this.processors.keys()).join(', ')}`,
        format
      );
    }
    
    return new ProcessorClass();
  }

  /**
   * Get list of supported formats
   * @returns {string[]} - Array of supported format names
   */
  static getSupportedFormats() {
    return Array.from(this.processors.keys());
  }

  /**
   * Check if a format is supported
   * @param {string} format - Format to check
   * @returns {boolean} - True if format is supported
   */
  static isFormatSupported(format) {
    return this.processors.has(format.toLowerCase());
  }

  /**
   * Get processor information
   * @returns {Object} - Information about registered processors
   */
  static getProcessorInfo() {
    const info = {};
    
    for (const [format, ProcessorClass] of this.processors) {
      info[format] = {
        name: ProcessorClass.name,
        format: format,
        mimeType: FormatDetector.getMimeType(format),
        extension: FormatDetector.getExtension(format)
      };
    }
    
    return info;
  }

  /**
   * Clear all registered processors (mainly for testing)
   */
  static clearProcessors() {
    this.processors.clear();
  }

  /**
   * Initialize with default processors (to be called after processors are defined)
   */
  static initializeDefaultProcessors() {
    // This will be called after all processor classes are imported
    // Individual processors will register themselves
  }
}