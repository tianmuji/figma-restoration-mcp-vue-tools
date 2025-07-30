#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Status manager for auto-start functionality
 * Handles startup status tracking, process management, and duplicate detection
 */
class StatusManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.statusFile = join(projectPath, '.vscode', 'auto-start-status.json');
    this.lockFile = join(projectPath, '.vscode', 'auto-start.lock');
    
    this._status = null;
  }

  /**
   * Get default status structure
   */
  getDefaultStatus() {
    return {
      isRunning: false,
      pid: null,
      port: null,
      startTime: null,
      lastError: null,
      retryCount: 0,
      command: null,
      version: '1.0.0'
    };
  }

  /**
   * Load status from file
   */
  loadStatus() {
    try {
      if (existsSync(this.statusFile)) {
        const content = readFileSync(this.statusFile, 'utf8');
        const status = JSON.parse(content);
        
        // Validate and migrate old status format if needed
        return this.validateAndMigrateStatus(status);
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to load status file: ${error.message}`));
    }
    
    return this.getDefaultStatus();
  }

  /**
   * Validate and migrate status format
   */
  validateAndMigrateStatus(status) {
    const defaultStatus = this.getDefaultStatus();
    const migrated = { ...defaultStatus, ...status };
    
    // Ensure required fields exist
    if (!migrated.version) {
      migrated.version = '1.0.0';
    }
    
    // Validate data types
    if (typeof migrated.isRunning !== 'boolean') {
      migrated.isRunning = false;
    }
    
    if (migrated.pid && typeof migrated.pid !== 'number') {
      migrated.pid = parseInt(migrated.pid) || null;
    }
    
    if (migrated.port && typeof migrated.port !== 'number') {
      migrated.port = parseInt(migrated.port) || null;
    }
    
    if (migrated.retryCount && typeof migrated.retryCount !== 'number') {
      migrated.retryCount = parseInt(migrated.retryCount) || 0;
    }
    
    return migrated;
  }

  /**
   * Save status to file
   */
  saveStatus(status = null) {
    const statusToSave = status || this._status || this.getDefaultStatus();
    
    try {
      // Ensure .vscode directory exists
      const vscodeDir = dirname(this.statusFile);
      if (!existsSync(vscodeDir)) {
        execSync(`mkdir -p "${vscodeDir}"`);
      }
      
      const content = JSON.stringify(statusToSave, null, 2);
      writeFileSync(this.statusFile, content, 'utf8');
      
      this._status = statusToSave;
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to save status: ${error.message}`));
      return false;
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    if (!this._status) {
      this._status = this.loadStatus();
    }
    return { ...this._status };
  }

  /**
   * Update status
   */
  updateStatus(updates) {
    const current = this.getStatus();
    const updated = { ...current, ...updates };
    
    // Always update timestamp when status changes
    if (updates.isRunning !== undefined) {
      updated.startTime = updates.isRunning ? new Date().toISOString() : current.startTime;
    }
    
    this._status = updated;
    return this.saveStatus(updated);
  }

  /**
   * Check if process is actually running
   */
  isProcessRunning(pid) {
    if (!pid) return false;
    
    try {
      // Send signal 0 to check if process exists
      process.kill(pid, 0);
      return true;
    } catch (error) {
      // Process doesn't exist or we don't have permission
      return false;
    }
  }

  /**
   * Get process information
   */
  getProcessInfo(pid) {
    if (!pid) return null;
    
    try {
      const cmd = `ps -p ${pid} -o pid,ppid,command,etime,pcpu,pmem`;
      const output = execSync(cmd, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      
      if (lines.length > 1) {
        const processLine = lines[1].trim();
        const parts = processLine.split(/\s+/);
        
        return {
          pid: parseInt(parts[0]),
          ppid: parseInt(parts[1]),
          command: parts.slice(2, -3).join(' '),
          etime: parts[parts.length - 3],
          cpu: parts[parts.length - 2],
          memory: parts[parts.length - 1]
        };
      }
    } catch (error) {
      // Process not found or command failed
    }
    
    return null;
  }

  /**
   * Validate current status against actual system state
   */
  validateStatus() {
    const status = this.getStatus();
    const issues = [];
    const fixes = {};
    
    // Check if marked as running but process doesn't exist
    if (status.isRunning && status.pid) {
      if (!this.isProcessRunning(status.pid)) {
        issues.push(`Process ${status.pid} is not running`);
        fixes.isRunning = false;
        fixes.pid = null;
        fixes.lastError = 'Process terminated unexpectedly';
      }
    }
    
    // Check if start time is too old (more than 1 hour ago)
    if (status.isRunning && status.startTime) {
      const startTime = new Date(status.startTime);
      const now = new Date();
      const hoursSinceStart = (now - startTime) / (1000 * 60 * 60);
      
      if (hoursSinceStart > 1) {
        issues.push(`Status shows running for ${hoursSinceStart.toFixed(1)} hours`);
        // Don't auto-fix this, just warn
      }
    }
    
    // Apply fixes if any issues found
    if (Object.keys(fixes).length > 0) {
      this.updateStatus(fixes);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      fixes: Object.keys(fixes)
    };
  }

  /**
   * Start tracking a new process
   */
  startTracking(pid, port, command) {
    const updates = {
      isRunning: true,
      pid: pid,
      port: port,
      command: command,
      startTime: new Date().toISOString(),
      lastError: null,
      retryCount: 0
    };
    
    return this.updateStatus(updates);
  }

  /**
   * Stop tracking current process
   */
  stopTracking(error = null) {
    const updates = {
      isRunning: false,
      pid: null,
      lastError: error
    };
    
    return this.updateStatus(updates);
  }

  /**
   * Increment retry count
   */
  incrementRetry() {
    const status = this.getStatus();
    return this.updateStatus({
      retryCount: (status.retryCount || 0) + 1
    });
  }

  /**
   * Reset retry count
   */
  resetRetry() {
    return this.updateStatus({ retryCount: 0 });
  }

  /**
   * Check if another instance is already starting (lock mechanism)
   */
  acquireLock() {
    try {
      if (existsSync(this.lockFile)) {
        const lockContent = readFileSync(this.lockFile, 'utf8');
        const lockData = JSON.parse(lockContent);
        
        // Check if lock is stale (older than 2 minutes)
        const lockTime = new Date(lockData.timestamp);
        const now = new Date();
        const minutesSinceLock = (now - lockTime) / (1000 * 60);
        
        if (minutesSinceLock < 2) {
          return {
            acquired: false,
            reason: 'Another instance is starting',
            lockData
          };
        } else {
          // Stale lock, remove it
          this.releaseLock();
        }
      }
      
      // Create new lock
      const lockData = {
        pid: process.pid,
        timestamp: new Date().toISOString(),
        command: process.argv.join(' ')
      };
      
      writeFileSync(this.lockFile, JSON.stringify(lockData, null, 2), 'utf8');
      
      return {
        acquired: true,
        lockData
      };
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to acquire lock: ${error.message}`));
      return {
        acquired: true, // Assume we can proceed if lock mechanism fails
        error: error.message
      };
    }
  }

  /**
   * Release the startup lock
   */
  releaseLock() {
    try {
      if (existsSync(this.lockFile)) {
        execSync(`rm -f "${this.lockFile}"`);
      }
      return true;
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to release lock: ${error.message}`));
      return false;
    }
  }

  /**
   * Check if we should skip startup based on current status
   */
  shouldSkipStartup() {
    const status = this.getStatus();
    const validation = this.validateStatus();
    
    // Skip if already running and process is valid
    if (status.isRunning && status.pid && this.isProcessRunning(status.pid)) {
      return {
        skip: true,
        reason: 'Development server is already running',
        pid: status.pid,
        port: status.port
      };
    }
    
    // Skip if started very recently (within 30 seconds)
    if (status.startTime) {
      const startTime = new Date(status.startTime);
      const now = new Date();
      const secondsSinceStart = (now - startTime) / 1000;
      
      if (secondsSinceStart < 30) {
        return {
          skip: true,
          reason: 'Development server was started recently',
          secondsAgo: Math.round(secondsSinceStart)
        };
      }
    }
    
    // Skip if too many recent retries
    if (status.retryCount && status.retryCount >= 3) {
      return {
        skip: true,
        reason: 'Too many recent startup attempts',
        retryCount: status.retryCount
      };
    }
    
    return {
      skip: false,
      validation
    };
  }

  /**
   * Print current status
   */
  printStatus() {
    const status = this.getStatus();
    const validation = this.validateStatus();
    
    console.log(chalk.bold('\nAuto-Start Status:'));
    console.log('━'.repeat(40));
    
    // Running status
    if (status.isRunning) {
      console.log(chalk.green('✓') + ' Status: Running');
      
      if (status.pid) {
        const processInfo = this.getProcessInfo(status.pid);
        if (processInfo) {
          console.log(`  PID: ${status.pid}`);
          console.log(`  Command: ${processInfo.command}`);
          console.log(`  Runtime: ${processInfo.etime}`);
          console.log(`  CPU: ${processInfo.cpu}%`);
          console.log(`  Memory: ${processInfo.memory}%`);
        } else {
          console.log(chalk.red(`  PID: ${status.pid} (process not found)`));
        }
      }
      
      if (status.port) {
        console.log(`  Port: ${status.port}`);
      }
      
      if (status.startTime) {
        const startTime = new Date(status.startTime);
        console.log(`  Started: ${startTime.toLocaleString()}`);
      }
    } else {
      console.log(chalk.gray('○') + ' Status: Not running');
      
      if (status.lastError) {
        console.log(chalk.red(`  Last Error: ${status.lastError}`));
      }
    }
    
    // Retry information
    if (status.retryCount > 0) {
      console.log(chalk.yellow(`  Retry Count: ${status.retryCount}`));
    }
    
    // Validation issues
    if (!validation.valid) {
      console.log(chalk.yellow('\nValidation Issues:'));
      validation.issues.forEach(issue => {
        console.log(chalk.yellow(`  • ${issue}`));
      });
      
      if (validation.fixes.length > 0) {
        console.log(chalk.blue(`  Applied fixes: ${validation.fixes.join(', ')}`));
      }
    }
    
    console.log('');
  }

  /**
   * Clean up status and lock files
   */
  cleanup() {
    try {
      this.releaseLock();
      
      // Reset status to default
      this.saveStatus(this.getDefaultStatus());
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to cleanup: ${error.message}`));
      return false;
    }
  }
}

// Export for use in other modules
export default StatusManager;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new StatusManager();
  const command = process.argv[2];
  
  switch (command) {
    case 'show':
    case 'status':
      manager.printStatus();
      break;
      
    case 'validate':
      const validation = manager.validateStatus();
      if (validation.valid) {
        console.log(chalk.green('✓ Status is valid'));
      } else {
        console.log(chalk.yellow('⚠ Status validation issues:'));
        validation.issues.forEach(issue => {
          console.log(chalk.yellow(`  • ${issue}`));
        });
      }
      break;
      
    case 'cleanup':
      if (manager.cleanup()) {
        console.log(chalk.green('✓ Cleanup completed'));
      } else {
        console.log(chalk.red('✗ Cleanup failed'));
        process.exit(1);
      }
      break;
      
    case 'lock':
      const lockResult = manager.acquireLock();
      if (lockResult.acquired) {
        console.log(chalk.green('✓ Lock acquired'));
      } else {
        console.log(chalk.yellow(`⚠ Lock not acquired: ${lockResult.reason}`));
        process.exit(1);
      }
      break;
      
    case 'unlock':
      if (manager.releaseLock()) {
        console.log(chalk.green('✓ Lock released'));
      } else {
        console.log(chalk.red('✗ Failed to release lock'));
        process.exit(1);
      }
      break;
      
    default:
      console.log('Usage: status-manager.js <command>');
      console.log('Commands:');
      console.log('  show|status   - Show current status');
      console.log('  validate      - Validate current status');
      console.log('  cleanup       - Clean up status and lock files');
      console.log('  lock          - Acquire startup lock');
      console.log('  unlock        - Release startup lock');
      break;
  }
}