#!/usr/bin/env node

import { createServer } from 'net';
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Port checker and management utility
 * Handles port availability, conflict detection, and process management
 */
class PortChecker {
  constructor() {
    this.defaultPorts = [1932, 3000, 5173, 8080, 8000];
  }

  /**
   * Check if a specific port is available
   * @param {number} port - Port number to check
   * @returns {Promise<boolean>} - True if port is available
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Find an available port from a list of candidates
   * @param {number[]} ports - Array of port numbers to check
   * @returns {Promise<number|null>} - First available port or null
   */
  async findAvailablePort(ports = this.defaultPorts) {
    for (const port of ports) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    return null;
  }

  /**
   * Get information about what's using a specific port
   * @param {number} port - Port number to check
   * @returns {Object} - Process information
   */
  getPortUsage(port) {
    try {
      // Try lsof first (more detailed info)
      const lsofResult = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
      const lines = lsofResult.trim().split('\n');
      
      if (lines.length > 1) {
        const processLine = lines[1]; // Skip header
        const parts = processLine.split(/\s+/);
        
        return {
          available: false,
          pid: parts[1],
          command: parts[0],
          user: parts[2],
          details: processLine,
          method: 'lsof'
        };
      }
    } catch (lsofError) {
      try {
        // Fallback to netstat
        const netstatResult = execSync(`netstat -tulpn 2>/dev/null | grep :${port}`, { encoding: 'utf8' });
        
        if (netstatResult.trim()) {
          const lines = netstatResult.trim().split('\n');
          const processInfo = lines[0];
          
          // Extract PID from netstat output (format varies by OS)
          const pidMatch = processInfo.match(/(\d+)\//);
          const pid = pidMatch ? pidMatch[1] : 'unknown';
          
          return {
            available: false,
            pid: pid,
            command: 'unknown',
            user: 'unknown',
            details: processInfo,
            method: 'netstat'
          };
        }
      } catch (netstatError) {
        // If both fail, the port might still be unavailable
        // This could happen on some systems or with certain permissions
        return {
          available: false,
          pid: 'unknown',
          command: 'unknown',
          user: 'unknown',
          details: 'Port appears to be in use but process details unavailable',
          method: 'fallback',
          error: `lsof: ${lsofError.message}, netstat: ${netstatError.message}`
        };
      }
    }

    return {
      available: true,
      pid: null,
      command: null,
      user: null,
      details: null,
      method: 'available'
    };
  }

  /**
   * Kill process using a specific port
   * @param {number} port - Port number
   * @returns {Promise<boolean>} - True if process was killed successfully
   */
  async killProcessOnPort(port) {
    try {
      const usage = this.getPortUsage(port);
      
      if (usage.available || !usage.pid || usage.pid === 'unknown') {
        return false;
      }

      // Try to kill the process
      execSync(`kill -TERM ${usage.pid}`, { encoding: 'utf8' });
      
      // Wait a moment and check if it's really dead
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stillRunning = !await this.isPortAvailable(port);
      
      if (stillRunning) {
        // Force kill if TERM didn't work
        execSync(`kill -KILL ${usage.pid}`, { encoding: 'utf8' });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return await this.isPortAvailable(port);
    } catch (error) {
      console.error(chalk.red(`Failed to kill process on port ${port}:`), error.message);
      return false;
    }
  }

  /**
   * Comprehensive port check with detailed information
   * @param {number} port - Port to check
   * @returns {Promise<Object>} - Detailed port information
   */
  async checkPort(port) {
    const available = await this.isPortAvailable(port);
    
    if (available) {
      return {
        port: port,
        available: true,
        status: 'available',
        message: `Port ${port} is available`,
        usage: null
      };
    }

    const usage = this.getPortUsage(port);
    
    return {
      port: port,
      available: false,
      status: 'occupied',
      message: `Port ${port} is in use`,
      usage: usage,
      canKill: usage.pid && usage.pid !== 'unknown'
    };
  }

  /**
   * Check multiple ports and return detailed status
   * @param {number[]} ports - Array of ports to check
   * @returns {Promise<Object[]>} - Array of port status objects
   */
  async checkMultiplePorts(ports) {
    const results = [];
    
    for (const port of ports) {
      const result = await this.checkPort(port);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Smart port selection for development server
   * @param {number} preferredPort - Preferred port number
   * @returns {Promise<Object>} - Port selection result
   */
  async selectPort(preferredPort = 1932) {
    console.log(chalk.blue(`🔍 Checking port availability...`));
    
    // First check the preferred port
    const preferredResult = await this.checkPort(preferredPort);
    
    if (preferredResult.available) {
      return {
        selected: preferredPort,
        available: true,
        message: `Using preferred port ${preferredPort}`,
        alternatives: []
      };
    }

    console.log(chalk.yellow(`⚠️  Port ${preferredPort} is occupied`));
    
    // Show what's using the preferred port
    if (preferredResult.usage) {
      console.log(chalk.gray(`   Process: ${preferredResult.usage.command} (PID: ${preferredResult.usage.pid})`));
    }

    // Look for alternatives
    const alternativePorts = this.defaultPorts.filter(p => p !== preferredPort);
    const availablePort = await this.findAvailablePort(alternativePorts);
    
    if (availablePort) {
      return {
        selected: availablePort,
        available: true,
        message: `Using alternative port ${availablePort}`,
        alternatives: alternativePorts,
        conflictInfo: preferredResult
      };
    }

    // No ports available
    return {
      selected: null,
      available: false,
      message: 'No available ports found',
      alternatives: alternativePorts,
      conflictInfo: preferredResult
    };
  }

  /**
   * Print port status information
   * @param {Object} portInfo - Port information object
   */
  printPortStatus(portInfo) {
    console.log('\n' + chalk.bold('Port Status:'));
    console.log('━'.repeat(30));

    if (portInfo.available) {
      console.log(chalk.green('✓') + ` Port ${portInfo.selected}: Available`);
      if (portInfo.alternatives && portInfo.alternatives.length > 0) {
        console.log(chalk.gray(`  (Alternative to ${portInfo.conflictInfo?.port})`));
      }
    } else {
      console.log(chalk.red('✗') + ' No available ports found');
      
      if (portInfo.conflictInfo && portInfo.conflictInfo.usage) {
        const usage = portInfo.conflictInfo.usage;
        console.log(chalk.yellow('\nPort Conflict Details:'));
        console.log(chalk.gray(`  Port: ${portInfo.conflictInfo.port}`));
        console.log(chalk.gray(`  Process: ${usage.command} (PID: ${usage.pid})`));
        console.log(chalk.gray(`  User: ${usage.user}`));
        
        if (usage.canKill) {
          console.log(chalk.blue('\nSuggestion:'));
          console.log(chalk.blue(`  Kill process: kill ${usage.pid}`));
        }
      }
    }

    console.log('');
  }

  /**
   * Interactive port conflict resolution
   * @param {number} port - Conflicted port
   * @returns {Promise<Object>} - Resolution result
   */
  async resolvePortConflict(port) {
    const portInfo = await this.checkPort(port);
    
    if (portInfo.available) {
      return { resolved: true, port: port, action: 'none' };
    }

    console.log(chalk.yellow(`\n⚠️  Port ${port} is occupied`));
    
    if (portInfo.usage) {
      console.log(chalk.gray(`Process: ${portInfo.usage.command} (PID: ${portInfo.usage.pid})`));
    }

    // For now, just find an alternative port
    // In a full implementation, you might want to prompt the user
    const alternativePort = await this.findAvailablePort(this.defaultPorts.filter(p => p !== port));
    
    if (alternativePort) {
      console.log(chalk.blue(`✓ Found alternative port: ${alternativePort}`));
      return { 
        resolved: true, 
        port: alternativePort, 
        action: 'alternative',
        originalPort: port
      };
    }

    return { 
      resolved: false, 
      port: null, 
      action: 'failed',
      originalPort: port
    };
  }
}

// Export for use in other modules
export default PortChecker;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PortChecker();
  const port = parseInt(process.argv[2]) || 1932;
  
  console.log(chalk.blue(`Checking port ${port}...`));
  
  const result = await checker.selectPort(port);
  checker.printPortStatus(result);
  
  process.exit(result.available ? 0 : 1);
}