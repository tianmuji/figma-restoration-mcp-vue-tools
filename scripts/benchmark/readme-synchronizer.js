/**
 * README Synchronizer
 * Updates README with benchmark results while preserving existing content
 */

import fs from 'fs';
import path from 'path';
import { BENCHMARK_CONFIG } from './config.js';
import { fileExists, logWithTimestamp } from './utils.js';

export class READMESynchronizer {
  constructor(readmePath = './README.md') {
    this.readmePath = path.resolve(readmePath);
    this.backupPath = this.readmePath + BENCHMARK_CONFIG.REPORT.BACKUP_SUFFIX;
    this.sectionMarker = BENCHMARK_CONFIG.REPORT.README_SECTION_MARKER;
  }

  /**
   * Update README with benchmark content
   * @param {string} markdownContent - New benchmark section content
   * @returns {Object} Update results
   */
  updateREADME(markdownContent) {
    logWithTimestamp(`Updating README at: ${this.readmePath}`);

    const updateResult = {
      success: false,
      backupCreated: false,
      originalSize: 0,
      newSize: 0,
      sectionFound: false,
      sectionReplaced: false,
      error: null
    };

    try {
      // Check if README exists
      if (!fileExists(this.readmePath)) {
        throw new Error(`README file not found: ${this.readmePath}`);
      }

      // Read current README content
      const originalContent = fs.readFileSync(this.readmePath, 'utf8');
      updateResult.originalSize = originalContent.length;

      // Create backup
      this.createBackup(originalContent);
      updateResult.backupCreated = true;

      // Find and replace benchmark section
      const sectionInfo = this.findBenchmarkSection(originalContent);
      updateResult.sectionFound = sectionInfo.found;

      let newContent;
      if (sectionInfo.found) {
        // Replace existing section
        newContent = this.replaceBenchmarkSection(originalContent, markdownContent, sectionInfo);
        updateResult.sectionReplaced = true;
        logWithTimestamp('Existing benchmark section replaced');
      } else {
        // Add new section
        newContent = this.addBenchmarkSection(originalContent, markdownContent);
        logWithTimestamp('New benchmark section added');
      }

      // Validate new content
      const validation = this.validateNewContent(originalContent, newContent);
      if (!validation.isValid) {
        throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Write updated content
      fs.writeFileSync(this.readmePath, newContent, 'utf8');
      updateResult.newSize = newContent.length;
      updateResult.success = true;

      logWithTimestamp(`README updated successfully (${updateResult.originalSize} → ${updateResult.newSize} chars)`);

      return updateResult;
    } catch (error) {
      updateResult.error = error.message;
      logWithTimestamp(`Error updating README: ${error.message}`, 'error');

      // Attempt to restore from backup if it was created
      if (updateResult.backupCreated) {
        this.restoreFromBackup();
      }

      return updateResult;
    }
  }

  /**
   * Find benchmark section in README content
   * @param {string} content - README content
   * @returns {Object} Section information
   */
  findBenchmarkSection(content) {
    const lines = content.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    // Find start of benchmark section
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === this.sectionMarker.trim()) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      return {
        found: false,
        start: -1,
        end: -1,
        startLine: -1,
        endLine: -1
      };
    }

    // Find end of benchmark section (next ## heading or end of file)
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('## ') && !line.includes('📊')) {
        endIndex = i - 1;
        break;
      }
    }

    // If no next section found, section goes to end of file
    if (endIndex === -1) {
      endIndex = lines.length - 1;
    }

    return {
      found: true,
      start: startIndex,
      end: endIndex,
      startLine: startIndex + 1,
      endLine: endIndex + 1,
      content: lines.slice(startIndex, endIndex + 1).join('\n')
    };
  }

  /**
   * Replace existing benchmark section
   * @param {string} originalContent - Original README content
   * @param {string} newSectionContent - New benchmark section content
   * @param {Object} sectionInfo - Section location information
   * @returns {string} Updated content
   */
  replaceBenchmarkSection(originalContent, newSectionContent, sectionInfo) {
    const lines = originalContent.split('\n');
    
    // Remove old section
    const beforeSection = lines.slice(0, sectionInfo.start);
    const afterSection = lines.slice(sectionInfo.end + 1);
    
    // Insert new section
    const newSectionLines = newSectionContent.trim().split('\n');
    
    return [
      ...beforeSection,
      ...newSectionLines,
      ...afterSection
    ].join('\n');
  }

  /**
   * Add new benchmark section to README
   * @param {string} originalContent - Original README content
   * @param {string} newSectionContent - New benchmark section content
   * @returns {string} Updated content
   */
  addBenchmarkSection(originalContent, newSectionContent) {
    // Try to find a good place to insert the section
    const insertionPoint = this.findInsertionPoint(originalContent);
    
    if (insertionPoint.found) {
      const lines = originalContent.split('\n');
      const beforeInsertion = lines.slice(0, insertionPoint.index);
      const afterInsertion = lines.slice(insertionPoint.index);
      
      const newSectionLines = newSectionContent.trim().split('\n');
      
      return [
        ...beforeInsertion,
        '', // Empty line before section
        ...newSectionLines,
        '', // Empty line after section
        ...afterInsertion
      ].join('\n');
    } else {
      // Append to end of file
      return originalContent.trim() + '\n\n' + newSectionContent.trim() + '\n';
    }
  }

  /**
   * Find appropriate insertion point for new benchmark section
   * @param {string} content - README content
   * @returns {Object} Insertion point information
   */
  findInsertionPoint(content) {
    const lines = content.split('\n');
    
    // Look for common section patterns where benchmark should be inserted
    const preferredSections = [
      '## Features',
      '## Usage',
      '## Installation',
      '## Getting Started',
      '## Documentation'
    ];

    // Find the first preferred section and insert after it
    for (const section of preferredSections) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().toLowerCase().startsWith(section.toLowerCase())) {
          // Find the end of this section
          let sectionEnd = i + 1;
          while (sectionEnd < lines.length && !lines[sectionEnd].trim().startsWith('## ')) {
            sectionEnd++;
          }
          
          return {
            found: true,
            index: sectionEnd,
            reason: `After ${section} section`
          };
        }
      }
    }

    // If no preferred section found, look for any ## section and insert before the last one
    const sectionIndices = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('## ')) {
        sectionIndices.push(i);
      }
    }

    if (sectionIndices.length > 0) {
      // Insert before the last section (usually License, Contributing, etc.)
      return {
        found: true,
        index: sectionIndices[sectionIndices.length - 1],
        reason: 'Before last section'
      };
    }

    return {
      found: false,
      index: -1,
      reason: 'No suitable insertion point found'
    };
  }

  /**
   * Preserve existing content while updating benchmark section
   * @param {string} originalContent - Original content
   * @param {string} newSectionContent - New section content
   * @returns {string} Preserved content
   */
  preserveExistingContent(originalContent, newSectionContent) {
    // This method ensures that non-benchmark content is preserved
    const sectionInfo = this.findBenchmarkSection(originalContent);
    
    if (sectionInfo.found) {
      return this.replaceBenchmarkSection(originalContent, newSectionContent, sectionInfo);
    } else {
      return this.addBenchmarkSection(originalContent, newSectionContent);
    }
  }

  /**
   * Create backup of current README
   * @param {string} content - Content to backup
   */
  createBackup(content) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedBackupPath = this.readmePath + `.backup-${timestamp}`;
      
      // Create timestamped backup
      fs.writeFileSync(timestampedBackupPath, content, 'utf8');
      
      // Create/update latest backup
      fs.writeFileSync(this.backupPath, content, 'utf8');
      
      logWithTimestamp(`Backup created: ${timestampedBackupPath}`);
    } catch (error) {
      logWithTimestamp(`Warning: Could not create backup: ${error.message}`, 'warn');
    }
  }

  /**
   * Restore README from backup
   */
  restoreFromBackup() {
    try {
      if (fileExists(this.backupPath)) {
        const backupContent = fs.readFileSync(this.backupPath, 'utf8');
        fs.writeFileSync(this.readmePath, backupContent, 'utf8');
        logWithTimestamp('README restored from backup');
        return true;
      } else {
        logWithTimestamp('No backup file found for restoration', 'warn');
        return false;
      }
    } catch (error) {
      logWithTimestamp(`Error restoring from backup: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Validate new content before writing
   * @param {string} originalContent - Original content
   * @param {string} newContent - New content
   * @returns {Object} Validation results
   */
  validateNewContent(originalContent, newContent) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check if content is not empty
    if (!newContent || newContent.trim().length === 0) {
      validation.isValid = false;
      validation.errors.push('New content is empty');
      return validation;
    }

    // Check if content is significantly shorter (possible data loss)
    const originalLength = originalContent.length;
    const newLength = newContent.length;
    const reductionRatio = (originalLength - newLength) / originalLength;

    if (reductionRatio > 0.5) {
      validation.isValid = false;
      validation.errors.push(`Content reduced by ${(reductionRatio * 100).toFixed(1)}% - possible data loss`);
    } else if (reductionRatio > 0.2) {
      validation.warnings.push(`Content reduced by ${(reductionRatio * 100).toFixed(1)}%`);
    }

    // Check if benchmark section exists in new content
    if (!newContent.includes(this.sectionMarker)) {
      validation.warnings.push('Benchmark section marker not found in new content');
    }

    // Check for basic markdown structure
    const hasHeadings = /^#{1,6}\s+.+$/m.test(newContent);
    if (!hasHeadings) {
      validation.warnings.push('No markdown headings found in new content');
    }

    return validation;
  }

  /**
   * Get README statistics
   * @returns {Object} README statistics
   */
  getREADMEStats() {
    if (!fileExists(this.readmePath)) {
      return {
        exists: false,
        size: 0,
        lines: 0,
        hasBenchmarkSection: false
      };
    }

    try {
      const content = fs.readFileSync(this.readmePath, 'utf8');
      const lines = content.split('\n');
      const sectionInfo = this.findBenchmarkSection(content);

      return {
        exists: true,
        size: content.length,
        lines: lines.length,
        hasBenchmarkSection: sectionInfo.found,
        benchmarkSectionLines: sectionInfo.found ? (sectionInfo.end - sectionInfo.start + 1) : 0,
        lastModified: fs.statSync(this.readmePath).mtime
      };
    } catch (error) {
      logWithTimestamp(`Error getting README stats: ${error.message}`, 'error');
      return {
        exists: true,
        error: error.message
      };
    }
  }

  /**
   * Preview changes without writing to file
   * @param {string} markdownContent - New benchmark section content
   * @returns {Object} Preview information
   */
  previewChanges(markdownContent) {
    if (!fileExists(this.readmePath)) {
      return {
        error: 'README file not found',
        canPreview: false
      };
    }

    try {
      const originalContent = fs.readFileSync(this.readmePath, 'utf8');
      const sectionInfo = this.findBenchmarkSection(originalContent);
      
      let newContent;
      if (sectionInfo.found) {
        newContent = this.replaceBenchmarkSection(originalContent, markdownContent, sectionInfo);
      } else {
        newContent = this.addBenchmarkSection(originalContent, markdownContent);
      }

      return {
        canPreview: true,
        changes: {
          originalSize: originalContent.length,
          newSize: newContent.length,
          sizeDifference: newContent.length - originalContent.length,
          sectionExists: sectionInfo.found,
          operation: sectionInfo.found ? 'replace' : 'add'
        },
        preview: {
          first100Chars: newContent.substring(0, 100) + '...',
          benchmarkSectionPreview: markdownContent.substring(0, 200) + '...'
        }
      };
    } catch (error) {
      return {
        error: error.message,
        canPreview: false
      };
    }
  }

  /**
   * Clean up old backup files
   * @param {number} maxBackups - Maximum number of backups to keep
   */
  cleanupBackups(maxBackups = 5) {
    try {
      const dir = path.dirname(this.readmePath);
      const baseName = path.basename(this.readmePath);
      const files = fs.readdirSync(dir);
      
      // Find backup files
      const backupFiles = files
        .filter(file => file.startsWith(baseName + '.backup-'))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          stat: fs.statSync(path.join(dir, file))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime); // Sort by modification time, newest first

      // Remove old backups
      if (backupFiles.length > maxBackups) {
        const filesToDelete = backupFiles.slice(maxBackups);
        
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          logWithTimestamp(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (error) {
      logWithTimestamp(`Error cleaning up backups: ${error.message}`, 'warn');
    }
  }

  /**
   * Advanced backup management with versioning
   * @param {string} content - Content to backup
   * @param {string} operation - Operation being performed
   * @returns {Object} Backup information
   */
  createVersionedBackup(content, operation = 'update') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupInfo = {
      timestamp,
      operation,
      size: content.length,
      path: null,
      success: false
    };

    try {
      const dir = path.dirname(this.readmePath);
      const baseName = path.basename(this.readmePath, '.md');
      
      // Create versioned backup with operation info
      const versionedBackupPath = path.join(dir, `${baseName}.backup-${operation}-${timestamp}.md`);
      
      // Add metadata header to backup
      const backupContent = `<!-- Backup created: ${new Date().toISOString()} -->\n` +
                           `<!-- Operation: ${operation} -->\n` +
                           `<!-- Original size: ${content.length} chars -->\n\n` +
                           content;
      
      fs.writeFileSync(versionedBackupPath, backupContent, 'utf8');
      
      // Update latest backup
      fs.writeFileSync(this.backupPath, content, 'utf8');
      
      backupInfo.path = versionedBackupPath;
      backupInfo.success = true;
      
      logWithTimestamp(`Versioned backup created: ${path.basename(versionedBackupPath)}`);
      
      // Clean up old backups
      this.cleanupBackups();
      
      return backupInfo;
    } catch (error) {
      backupInfo.error = error.message;
      logWithTimestamp(`Error creating versioned backup: ${error.message}`, 'error');
      return backupInfo;
    }
  }

  /**
   * List all available backups
   * @returns {Object[]} Array of backup information
   */
  listBackups() {
    try {
      const dir = path.dirname(this.readmePath);
      const baseName = path.basename(this.readmePath);
      const files = fs.readdirSync(dir);
      
      const backups = files
        .filter(file => file.startsWith(baseName + '.backup'))
        .map(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          // Try to extract operation from filename
          const operationMatch = file.match(/\.backup-([^-]+)-/);
          const operation = operationMatch ? operationMatch[1] : 'unknown';
          
          return {
            filename: file,
            path: filePath,
            size: stat.size,
            created: stat.mtime,
            operation,
            isLatest: file === path.basename(this.backupPath)
          };
        })
        .sort((a, b) => b.created - a.created);

      return backups;
    } catch (error) {
      logWithTimestamp(`Error listing backups: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Restore from specific backup
   * @param {string} backupPath - Path to backup file
   * @returns {Object} Restoration results
   */
  restoreFromSpecificBackup(backupPath) {
    const restoreResult = {
      success: false,
      backupUsed: backupPath,
      originalSize: 0,
      restoredSize: 0,
      error: null
    };

    try {
      if (!fileExists(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Read current README size for comparison
      if (fileExists(this.readmePath)) {
        const currentContent = fs.readFileSync(this.readmePath, 'utf8');
        restoreResult.originalSize = currentContent.length;
      }

      // Read backup content
      let backupContent = fs.readFileSync(backupPath, 'utf8');
      
      // Remove backup metadata if present
      backupContent = this.cleanBackupMetadata(backupContent);
      
      restoreResult.restoredSize = backupContent.length;

      // Create a backup of current state before restoring
      if (fileExists(this.readmePath)) {
        const currentContent = fs.readFileSync(this.readmePath, 'utf8');
        this.createVersionedBackup(currentContent, 'pre-restore');
      }

      // Restore from backup
      fs.writeFileSync(this.readmePath, backupContent, 'utf8');
      
      restoreResult.success = true;
      logWithTimestamp(`README restored from: ${path.basename(backupPath)}`);
      
      return restoreResult;
    } catch (error) {
      restoreResult.error = error.message;
      logWithTimestamp(`Error restoring from backup: ${error.message}`, 'error');
      return restoreResult;
    }
  }

  /**
   * Clean backup metadata from content
   * @param {string} content - Backup content
   * @returns {string} Cleaned content
   */
  cleanBackupMetadata(content) {
    // Remove backup metadata comments
    const lines = content.split('\n');
    const cleanedLines = [];
    let skipMetadata = false;

    for (const line of lines) {
      if (line.trim().startsWith('<!-- Backup created:') || 
          line.trim().startsWith('<!-- Operation:') || 
          line.trim().startsWith('<!-- Original size:')) {
        skipMetadata = true;
        continue;
      }
      
      if (skipMetadata && line.trim() === '') {
        skipMetadata = false;
        continue;
      }
      
      if (!skipMetadata) {
        cleanedLines.push(line);
      }
    }

    return cleanedLines.join('\n');
  }

  /**
   * Validate README integrity after operations
   * @returns {Object} Integrity check results
   */
  validateIntegrity() {
    const integrity = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: null
    };

    try {
      if (!fileExists(this.readmePath)) {
        integrity.isValid = false;
        integrity.errors.push('README file does not exist');
        return integrity;
      }

      const content = fs.readFileSync(this.readmePath, 'utf8');
      const stats = this.getREADMEStats();
      integrity.stats = stats;

      // Check for basic markdown structure
      if (!content.includes('#')) {
        integrity.warnings.push('No markdown headings found');
      }

      // Check for minimum content length
      if (content.length < 100) {
        integrity.warnings.push('README content is very short');
      }

      // Check for benchmark section
      const sectionInfo = this.findBenchmarkSection(content);
      if (!sectionInfo.found) {
        integrity.warnings.push('Benchmark section not found');
      }

      // Check for common README sections
      const commonSections = ['# ', '## Installation', '## Usage', '## Features'];
      const missingSections = commonSections.filter(section => 
        !content.toLowerCase().includes(section.toLowerCase())
      );
      
      if (missingSections.length > 0) {
        integrity.warnings.push(`Missing common sections: ${missingSections.join(', ')}`);
      }

      // Check for broken markdown syntax
      const brokenLinks = content.match(/\[([^\]]+)\]\(\s*\)/g);
      if (brokenLinks) {
        integrity.warnings.push(`Found ${brokenLinks.length} broken link(s)`);
      }

      logWithTimestamp(`README integrity check completed: ${integrity.errors.length} errors, ${integrity.warnings.length} warnings`);
      
      return integrity;
    } catch (error) {
      integrity.isValid = false;
      integrity.errors.push(`Integrity check failed: ${error.message}`);
      return integrity;
    }
  }

  /**
   * Create rollback point before major operations
   * @param {string} operationName - Name of the operation
   * @returns {Object} Rollback point information
   */
  createRollbackPoint(operationName) {
    const rollbackInfo = {
      success: false,
      operationName,
      timestamp: new Date().toISOString(),
      rollbackId: null,
      path: null
    };

    try {
      if (!fileExists(this.readmePath)) {
        throw new Error('README file does not exist');
      }

      const content = fs.readFileSync(this.readmePath, 'utf8');
      const rollbackId = `rollback-${operationName}-${Date.now()}`;
      
      const rollbackPath = path.join(
        path.dirname(this.readmePath),
        `${path.basename(this.readmePath, '.md')}.${rollbackId}.md`
      );

      // Create rollback file with metadata
      const rollbackContent = `<!-- Rollback Point -->\n` +
                             `<!-- Operation: ${operationName} -->\n` +
                             `<!-- Created: ${rollbackInfo.timestamp} -->\n` +
                             `<!-- Rollback ID: ${rollbackId} -->\n\n` +
                             content;

      fs.writeFileSync(rollbackPath, rollbackContent, 'utf8');

      rollbackInfo.success = true;
      rollbackInfo.rollbackId = rollbackId;
      rollbackInfo.path = rollbackPath;

      logWithTimestamp(`Rollback point created: ${rollbackId}`);
      
      return rollbackInfo;
    } catch (error) {
      rollbackInfo.error = error.message;
      logWithTimestamp(`Error creating rollback point: ${error.message}`, 'error');
      return rollbackInfo;
    }
  }

  /**
   * Execute rollback to specific point
   * @param {string} rollbackId - Rollback point ID
   * @returns {Object} Rollback results
   */
  executeRollback(rollbackId) {
    const rollbackResult = {
      success: false,
      rollbackId,
      error: null
    };

    try {
      const rollbackPath = path.join(
        path.dirname(this.readmePath),
        `${path.basename(this.readmePath, '.md')}.${rollbackId}.md`
      );

      if (!fileExists(rollbackPath)) {
        throw new Error(`Rollback point not found: ${rollbackId}`);
      }

      // Create backup of current state
      if (fileExists(this.readmePath)) {
        const currentContent = fs.readFileSync(this.readmePath, 'utf8');
        this.createVersionedBackup(currentContent, 'pre-rollback');
      }

      // Restore from rollback point
      const rollbackContent = fs.readFileSync(rollbackPath, 'utf8');
      const cleanedContent = this.cleanBackupMetadata(rollbackContent);
      
      fs.writeFileSync(this.readmePath, cleanedContent, 'utf8');

      rollbackResult.success = true;
      logWithTimestamp(`Rollback executed: ${rollbackId}`);
      
      return rollbackResult;
    } catch (error) {
      rollbackResult.error = error.message;
      logWithTimestamp(`Error executing rollback: ${error.message}`, 'error');
      return rollbackResult;
    }
  }

  /**
   * Get backup and recovery status
   * @returns {Object} Status information
   */
  getBackupStatus() {
    const status = {
      hasLatestBackup: fileExists(this.backupPath),
      backupCount: 0,
      totalBackupSize: 0,
      oldestBackup: null,
      newestBackup: null,
      rollbackPoints: []
    };

    try {
      const backups = this.listBackups();
      status.backupCount = backups.length;
      status.totalBackupSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      
      if (backups.length > 0) {
        status.oldestBackup = backups[backups.length - 1];
        status.newestBackup = backups[0];
      }

      // Find rollback points
      const dir = path.dirname(this.readmePath);
      const files = fs.readdirSync(dir);
      const baseName = path.basename(this.readmePath, '.md');
      
      status.rollbackPoints = files
        .filter(file => file.includes(`${baseName}.rollback-`))
        .map(file => {
          const rollbackId = file.replace(`${baseName}.`, '').replace('.md', '');
          return {
            id: rollbackId,
            filename: file,
            created: fs.statSync(path.join(dir, file)).mtime
          };
        })
        .sort((a, b) => b.created - a.created);

      return status;
    } catch (error) {
      status.error = error.message;
      return status;
    }
  }
}