#!/usr/bin/env node

/**
 * Comprehensive test suite for all reliability infrastructure components
 * This file runs all infrastructure tests and provides a summary report
 */

import { timeoutManagerTests } from './timeout-manager.test.js';
import { errorHandlerTests } from './error-handler.test.js';
import { operationLoggerTests } from './operation-logger.test.js';
import { configManagerTests } from './config-manager.test.js';
import { reliabilityWrapperTests } from './reliability-wrapper.test.js';

/**
 * Test suite runner for infrastructure components
 */
class InfrastructureTestSuite {
  constructor() {
    this.testSuites = [
      { name: 'TimeoutManager', runner: timeoutManagerTests },
      { name: 'ErrorHandler', runner: errorHandlerTests },
      { name: 'OperationLogger', runner: operationLoggerTests },
      { name: 'ConfigManager', runner: configManagerTests },
      { name: 'ReliabilityWrapper', runner: reliabilityWrapperTests }
    ];
    this.results = [];
  }

  /**
   * Run all infrastructure tests
   */
  async runAll() {
    console.log('🚀 Running Reliability Infrastructure Test Suite\n');
    console.log('=' .repeat(60));

    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    for (const suite of this.testSuites) {
      console.log(`\n📦 Testing ${suite.name}...`);
      console.log('-'.repeat(40));

      try {
        // Capture console output for cleaner reporting
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        let output = '';
        console.log = (...args) => {
          output += args.join(' ') + '\n';
        };
        console.error = (...args) => {
          output += args.join(' ') + '\n';
        };
        console.warn = (...args) => {
          output += args.join(' ') + '\n';
        };

        const success = await suite.runner.run();
        
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;

        // Parse results from output
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.includes('Test Results:'));
        
        if (resultLine) {
          const match = resultLine.match(/(\d+) passed, (\d+) failed/);
          if (match) {
            const passed = parseInt(match[1]);
            const failed = parseInt(match[2]);
            
            totalPassed += passed;
            totalFailed += failed;
            totalTests += passed + failed;

            this.results.push({
              name: suite.name,
              passed,
              failed,
              success,
              total: passed + failed
            });

            if (success) {
              console.log(`✅ ${suite.name}: ${passed} tests passed`);
            } else {
              console.log(`❌ ${suite.name}: ${passed} passed, ${failed} failed`);
            }
          }
        }
      } catch (error) {
        console.log(`💥 ${suite.name}: Test suite failed - ${error.message}`);
        this.results.push({
          name: suite.name,
          passed: 0,
          failed: 1,
          success: false,
          total: 1,
          error: error.message
        });
        totalFailed++;
        totalTests++;
      }
    }

    // Print summary
    this.printSummary(totalPassed, totalFailed, totalTests);
    
    return totalFailed === 0;
  }

  /**
   * Print test summary report
   */
  printSummary(totalPassed, totalFailed, totalTests) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 INFRASTRUCTURE TEST SUMMARY');
    console.log('='.repeat(60));

    // Overall results
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
    console.log(`\n🎯 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${successRate}%`);

    // Per-component results
    console.log(`\n📋 Component Results:`);
    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      const rate = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : 0;
      console.log(`   ${status} ${result.name}: ${result.passed}/${result.total} (${rate}%)`);
      
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }

    // Infrastructure readiness assessment
    console.log(`\n🔧 Infrastructure Readiness:`);
    if (totalFailed === 0) {
      console.log('   ✅ All infrastructure components are ready for reliability enhancement');
      console.log('   ✅ TimeoutManager: Comprehensive timeout and retry handling');
      console.log('   ✅ ErrorHandler: Categorized error handling with user-friendly messages');
      console.log('   ✅ OperationLogger: Performance monitoring and detailed logging');
      console.log('   ✅ ConfigManager: Unified configuration management system');
      console.log('   ✅ ReliabilityWrapper: Tool enhancement with backward compatibility');
    } else {
      console.log('   ⚠️  Some infrastructure components have issues that need attention');
      console.log('   🔍 Review failed tests before proceeding with tool enhancements');
    }

    // Next steps
    console.log(`\n🚀 Next Steps:`);
    if (totalFailed === 0) {
      console.log('   1. ✅ Infrastructure components are ready');
      console.log('   2. 🔄 Proceed to implement ReliabilityWrapper base class');
      console.log('   3. 🛠️  Begin tool-specific reliability enhancements');
    } else {
      console.log('   1. 🔧 Fix failing infrastructure tests');
      console.log('   2. 🔄 Re-run infrastructure test suite');
      console.log('   3. ✅ Ensure all components pass before proceeding');
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Run specific test suite
   */
  async runSuite(suiteName) {
    const suite = this.testSuites.find(s => s.name.toLowerCase() === suiteName.toLowerCase());
    if (!suite) {
      console.log(`❌ Test suite '${suiteName}' not found`);
      console.log(`Available suites: ${this.testSuites.map(s => s.name).join(', ')}`);
      return false;
    }

    console.log(`🧪 Running ${suite.name} tests...\n`);
    return await suite.runner.run();
  }

  /**
   * Get test coverage report
   */
  getCoverageReport() {
    return {
      components: this.results.length,
      totalTests: this.results.reduce((sum, r) => sum + r.total, 0),
      totalPassed: this.results.reduce((sum, r) => sum + r.passed, 0),
      totalFailed: this.results.reduce((sum, r) => sum + r.failed, 0),
      successRate: this.results.length > 0 ? 
        (this.results.reduce((sum, r) => sum + r.passed, 0) / 
         this.results.reduce((sum, r) => sum + r.total, 0)) * 100 : 0,
      componentResults: this.results
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const suite = new InfrastructureTestSuite();
  
  const command = process.argv[2];
  
  if (command === 'suite' && process.argv[3]) {
    // Run specific test suite
    suite.runSuite(process.argv[3]).then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    // Run all tests
    suite.runAll().then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}

export { InfrastructureTestSuite };