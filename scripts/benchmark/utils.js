/**
 * Benchmark System Utilities
 * Common utility functions for the benchmark system
 */

import fs from 'fs';
import path from 'path';

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if file exists
 */
export function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Check if a directory exists
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} - True if directory exists
 */
export function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 */
export function ensureDirectory(dirPath) {
  if (!directoryExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get file modification time
 * @param {string} filePath - Path to the file
 * @returns {Date|null} - File modification date or null if file doesn't exist
 */
export function getFileModificationTime(filePath) {
  try {
    if (fileExists(filePath)) {
      return fs.statSync(filePath).mtime;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @returns {object|null} - Parsed object or null if parsing fails
 */
export function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error.message);
    return null;
  }
}

/**
 * Read JSON file safely
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} - Parsed JSON object or null if reading fails
 */
export function readJsonFile(filePath) {
  try {
    if (!fileExists(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return safeJsonParse(content);
  } catch (error) {
    console.warn(`Failed to read JSON file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Write JSON file safely
 * @param {string} filePath - Path to the JSON file
 * @param {object} data - Data to write
 * @param {boolean} pretty - Whether to format JSON prettily
 */
export function writeJsonFile(filePath, data, pretty = true) {
  try {
    ensureDirectory(path.dirname(filePath));
    const jsonString = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    fs.writeFileSync(filePath, jsonString, 'utf8');
  } catch (error) {
    console.error(`Failed to write JSON file ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Format timestamp for display
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} - Formatted timestamp
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '-';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) return '-';
  
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Format percentage for display
 * @param {number|null} percentage - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export function formatPercentage(percentage, decimals = 1) {
  if (percentage === null || percentage === undefined) return '-';
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Create progress bar string
 * @param {number} percentage - Percentage (0-100)
 * @param {number} width - Width of progress bar
 * @param {string} fillChar - Character for filled portion
 * @param {string} emptyChar - Character for empty portion
 * @returns {string} - Progress bar string
 */
export function createProgressBar(percentage, width = 40, fillChar = '█', emptyChar = '░') {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return fillChar.repeat(filled) + emptyChar.repeat(empty);
}

/**
 * Log with timestamp
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error)
 */
export function logWithTimestamp(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  switch (level) {
    case 'warn':
      console.warn(`${prefix} ${message}`);
      break;
    case 'error':
      console.error(`${prefix} ${message}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}