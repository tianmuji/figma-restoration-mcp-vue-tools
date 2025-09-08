#!/usr/bin/env node

/**
 * Main Benchmark Execution Script
 * Orchestrates the complete benchmark workflow
 */

import { ComponentScanner } from './component-scanner.js';
import { DataCollector } from './data-collector.js';
import { MetricsCalculator } from './metrics-calculator.js';
import { ReportGenerator } from './report-generator.js';
import { READMESynchronizer } from './readme-synchronizer.js';
import { BENCHMARK_CONFIG } from './config.js';
import { logWithTimestamp, ensureDirectory } from './utils.js';

class BenchmarkOrchestrator {
  constructor(options = {}) {
    this.options = {
      componentsDir: BENCHMARK_CONFIG.COMPONENTS_DIR,
      outputDir: BENCHMARK_CONFIG.REPORTS_DIR,
      updateReadme: true,
      generateReport: true,
      verbose: false,
      dryRun: false,
      ...options
    };

    this.scanner = new ComponentScanner(this.options.componentsDir);
    this.collector = new DataCollector();
    this.calculator = new MetricsCalculator();
    this.reportGenerator = new ReportGenerator({
      outputDir: this.options.outputDir,
      includeDetails: true
    });
    this.readmeSynchronizer = new READMESynchronizer();

    this.results = {
      startTime: null,
      endTime: null,
      duration: null,
      componentsScanned: 0,
      dataCollected: 0,
      metricsCalculated: false,
      reportGenerated: false,
      readmeUpdated: false,
      errors: [],
      warnings: []
    };

    // Performance monitoring
    this.performance = {
      steps: {},
      memory: {},
      operations: []
    };

    this.progressCallback = null;
  }

  /**
   * Execute complete benchmark workflow
   * @returns {Object} Execution results
   */
  async execute() {
    this.results.startTime = new Date();
    
    logWithTimestamp('🚀 Starting Figma Restoration Benchmark');
    logWithTimestamp(`Configuration: ${JSON.stringify(this.options, null, 2)}`);

    try {
      // Step 1: Scan components
      await this.scanComponents();

      // Step 2: Collect restoration data
      await this.collectData();

      // Step 3: Calculate metrics
      await this.calculateMetrics();

      // Step 4: Generate reports
      if (this.options.generateReport) {
        await this.generateReports();
      }

      // Step 5: Update README
      if (this.options.updateReadme) {
        await this.updateReadme();
      }

      this.results.endTime = new Date();
      this.results.duration = this.results.endTime - this.results.startTime;

      // Log performance summary
      this.logPerformanceSummary();

      logWithTimestamp(`✅ Benchmark completed successfully in ${this.results.duration}ms`);
      
      return {
        success: true,
        results: this.results,
        metrics: this.calculator.getMetrics()
      };

    } catch (error) {
      this.results.endTime = new Date();
      this.results.duration = this.results.endTime - this.results.startTime;
      this.results.errors.push(error.message);

      logWithTimestamp(`❌ Benchmark failed: ${error.message}`, 'error');
      
      return {
        success: false,
        error: error.message,
        results: this.results
      };
    }
  }

  /**
   * Scan components step
   */
  async scanComponents() {
    logWithTimestamp('📁 Step 1: Scanning components...');
    this.startPerformanceMonitoring('scanComponents');
    
    try {
      const components = this.scanner.scanComponents();
      this.results.componentsScanned = components.length;
      this.recordOperation('scanComponents', 'Components scanned', components.length);

      if (components.length === 0) {
        this.results.warnings.push('No components found to scan');
        logWithTimestamp('⚠️ No components found', 'warn');
        return;
      }

      const summary = this.scanner.getScanSummary();
      logWithTimestamp(`Found ${components.length} components:`);
      logWithTimestamp(`  - With metadata: ${summary.withMetadata}`);
      logWithTimestamp(`  - With results: ${summary.withResults}`);
      logWithTimestamp(`  - With expected images: ${summary.withExpected}`);
      logWithTimestamp(`  - Total assets: ${summary.totalAssets}`);

      if (this.options.verbose) {
        for (const component of components) {
          logWithTimestamp(`  📦 ${component.name}: metadata=${component.hasMetadata}, results=${component.hasResults}, assets=${component.assetCount}`);
        }
      }

    } catch (error) {
      throw new Error(`Component scanning failed: ${error.message}`);
    } finally {
      this.endPerformanceMonitoring('scanComponents');
    }
  }

  /**
   * Collect restoration data step
   */
  async collectData() {
    logWithTimestamp('📊 Step 2: Collecting restoration data...');
    this.startPerformanceMonitoring('collectData');
    
    try {
      const components = this.scanner.getAllComponents();
      
      if (components.length === 0) {
        logWithTimestamp('No components to collect data from', 'warn');
        return;
      }

      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        this.updateProgress('collectData', i + 1, components.length, component.name);
        
        try {
          const restorationData = this.collector.collectRestorationData(component);
          this.results.dataCollected++;
          this.recordOperation('collectData', 'Data collected', 1);
          
          if (this.options.verbose) {
            logWithTimestamp(`  📋 ${component.name}: ${restorationData.status} (${restorationData.matchPercentage || 'N/A'}%)`);
          }
        } catch (error) {
          this.results.warnings.push(`Failed to collect data for ${component.name}: ${error.message}`);
          logWithTimestamp(`⚠️ Data collection failed for ${component.name}: ${error.message}`, 'warn');
        }
      }

      const summary = this.collector.getDataSummary();
      logWithTimestamp(`Data collected for ${this.results.dataCollected} components:`);
      logWithTimestamp(`  - Completed: ${summary.byStatus.completed || 0}`);
      logWithTimestamp(`  - Pending: ${summary.byStatus.pending || 0}`);
      logWithTimestamp(`  - Failed: ${summary.byStatus.failed || 0}`);
      logWithTimestamp(`  - Not tested: ${summary.byStatus.not_tested || 0}`);

      if (summary.accuracyStats.count > 0) {
        logWithTimestamp(`  - Average accuracy: ${summary.accuracyStats.average.toFixed(1)}%`);
        logWithTimestamp(`  - Best accuracy: ${summary.accuracyStats.max.toFixed(1)}%`);
      }

    } catch (error) {
      throw new Error(`Data collection failed: ${error.message}`);
    } finally {
      this.endPerformanceMonitoring('collectData');
    }
  }

  /**
   * Calculate metrics step
   */
  async calculateMetrics() {
    logWithTimestamp('🧮 Step 3: Calculating metrics...');
    this.startPerformanceMonitoring('calculateMetrics');
    
    try {
      const restorationData = this.collector.getAllData();
      
      if (restorationData.length === 0) {
        this.results.warnings.push('No restoration data available for metrics calculation');
        logWithTimestamp('⚠️ No restoration data for metrics', 'warn');
        return;
      }

      const metrics = this.calculator.calculateMetrics(restorationData);
      this.results.metricsCalculated = true;
      this.recordOperation('calculateMetrics', 'Metrics calculated', 1);

      // Log key metrics
      const { summary } = metrics;
      logWithTimestamp(`Metrics calculated:`);
      logWithTimestamp(`  - Total components: ${summary.totalComponents}`);
      logWithTimestamp(`  - Completion rate: ${summary.completionRate?.toFixed(1) || 'N/A'}%`);
      logWithTimestamp(`  - Average accuracy: ${summary.averageAccuracy?.toFixed(1) || 'N/A'}%`);
      
      if (summary.bestComponent) {
        logWithTimestamp(`  - Best performer: ${summary.bestComponent.name} (${summary.bestComponent.accuracy}%)`);
      }

      // Generate quality insights
      const qualityScore = this.calculator.getQualityScore(metrics);
      logWithTimestamp(`  - Quality score: ${qualityScore.score}% (Grade: ${qualityScore.grade})`);

      const recommendations = this.calculator.generateRecommendations(metrics);
      if (recommendations.length > 0 && this.options.verbose) {
        logWithTimestamp('📋 Recommendations:');
        recommendations.forEach(rec => logWithTimestamp(`    ${rec}`));
      }

    } catch (error) {
      throw new Error(`Metrics calculation failed: ${error.message}`);
    } finally {
      this.endPerformanceMonitoring('calculateMetrics');
    }
  }

  /**
   * Generate reports step
   */
  async generateReports() {
    logWithTimestamp('📄 Step 4: Generating reports...');
    this.startPerformanceMonitoring('generateReports');
    
    try {
      const metrics = this.calculator.getMetrics();
      
      if (!metrics) {
        this.results.warnings.push('No metrics available for report generation');
        logWithTimestamp('⚠️ No metrics for report generation', 'warn');
        return;
      }

      if (this.options.dryRun) {
        logWithTimestamp('🔍 Dry run: Skipping actual report generation');
        return;
      }

      // Ensure output directory exists
      ensureDirectory(this.options.outputDir);

      // Generate reports
      const reportResults = this.reportGenerator.generateAndSaveReport(metrics, this.options.outputDir);
      this.results.reportGenerated = true;
      this.recordOperation('generateReports', 'Reports generated', 1);

      logWithTimestamp(`Reports generated:`);
      if (reportResults.jsonPath) {
        logWithTimestamp(`  - JSON report: ${reportResults.jsonPath}`);
      }
      if (reportResults.markdownReport) {
        logWithTimestamp(`  - Markdown content: ${reportResults.markdownReport.length} characters`);
      }

    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    } finally {
      this.endPerformanceMonitoring('generateReports');
    }
  }

  /**
   * Update README step
   */
  async updateReadme() {
    logWithTimestamp('📝 Step 5: Updating README...');
    this.startPerformanceMonitoring('updateReadme');
    
    try {
      const metrics = this.calculator.getMetrics();
      
      if (!metrics) {
        this.results.warnings.push('No metrics available for README update');
        logWithTimestamp('⚠️ No metrics for README update', 'warn');
        return;
      }

      if (this.options.dryRun) {
        logWithTimestamp('🔍 Dry run: Previewing README changes');
        const markdownContent = this.reportGenerator.generateMarkdownSection(metrics);
        const preview = this.readmeSynchronizer.previewChanges(markdownContent);
        
        if (preview.canPreview) {
          logWithTimestamp(`Preview: ${preview.changes.operation} operation, size change: ${preview.changes.sizeDifference} chars`);
        } else {
          logWithTimestamp(`Preview failed: ${preview.error}`, 'warn');
        }
        return;
      }

      // Generate markdown content
      const markdownContent = this.reportGenerator.generateMarkdownSection(metrics);
      
      // Create rollback point
      const rollbackPoint = this.readmeSynchronizer.createRollbackPoint('benchmark-update');
      if (rollbackPoint.success) {
        logWithTimestamp(`Rollback point created: ${rollbackPoint.rollbackId}`);
      }

      // Update README
      const updateResult = this.readmeSynchronizer.updateREADME(markdownContent);
      
      if (updateResult.success) {
        this.results.readmeUpdated = true;
        this.recordOperation('updateReadme', 'README updated', 1);
        logWithTimestamp(`README updated successfully:`);
        logWithTimestamp(`  - Size change: ${updateResult.originalSize} → ${updateResult.newSize} chars`);
        logWithTimestamp(`  - Section ${updateResult.sectionFound ? 'replaced' : 'added'}`);
        logWithTimestamp(`  - Backup created: ${updateResult.backupCreated}`);
      } else {
        this.results.warnings.push(`README update failed: ${updateResult.error}`);
        logWithTimestamp(`⚠️ README update failed: ${updateResult.error}`, 'warn');
      }

      // Validate README integrity
      const integrity = this.readmeSynchronizer.validateIntegrity();
      if (!integrity.isValid) {
        logWithTimestamp(`⚠️ README integrity issues: ${integrity.errors.join(', ')}`, 'warn');
      }

    } catch (error) {
      throw new Error(`README update failed: ${error.message}`);
    } finally {
      this.endPerformanceMonitoring('updateReadme');
    }
  }

  /**
   * Start performance monitoring for a step
   * @param {string} stepName - Name of the step
   */
  startPerformanceMonitoring(stepName) {
    const startTime = process.hrtime.bigint();
    const memUsage = process.memoryUsage();
    
    this.performance.steps[stepName] = {
      startTime,
      startMemory: memUsage,
      operations: 0,
      subSteps: {}
    };

    if (this.options.verbose) {
      logWithTimestamp(`🔍 Performance: Starting ${stepName} (Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB)`);
    }
  }

  /**
   * End performance monitoring for a step
   * @param {string} stepName - Name of the step
   */
  endPerformanceMonitoring(stepName) {
    if (!this.performance.steps[stepName]) {
      return;
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    const step = this.performance.steps[stepName];
    
    step.endTime = endTime;
    step.endMemory = endMemory;
    step.duration = Number(endTime - step.startTime) / 1000000; // Convert to milliseconds
    step.memoryDelta = endMemory.heapUsed - step.startMemory.heapUsed;

    if (this.options.verbose) {
      logWithTimestamp(`✅ Performance: ${stepName} completed in ${step.duration.toFixed(2)}ms (Memory Δ: ${Math.round(step.memoryDelta / 1024)}KB)`);
    }
  }

  /**
   * Record an operation within a step
   * @param {string} stepName - Name of the step
   * @param {string} operation - Operation description
   * @param {number} count - Number of items processed
   */
  recordOperation(stepName, operation, count = 1) {
    if (this.performance.steps[stepName]) {
      this.performance.steps[stepName].operations += count;
    }

    this.performance.operations.push({
      step: stepName,
      operation,
      count,
      timestamp: new Date().toISOString()
    });

    if (this.options.verbose && count > 1) {
      logWithTimestamp(`📊 ${operation}: ${count} items`);
    }
  }

  /**
   * Update progress and call progress callback if set
   * @param {string} step - Current step
   * @param {number} current - Current progress
   * @param {number} total - Total items
   * @param {string} message - Progress message
   */
  updateProgress(step, current, total, message = '') {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    if (this.progressCallback) {
      this.progressCallback({
        step,
        current,
        total,
        percentage,
        message
      });
    }

    // Log progress at intervals
    if (total > 10 && current % Math.max(1, Math.floor(total / 10)) === 0) {
      logWithTimestamp(`📈 ${step}: ${current}/${total} (${percentage}%) ${message}`);
    }
  }

  /**
   * Set progress callback function
   * @param {Function} callback - Progress callback function
   */
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    const totalDuration = this.results.duration || 0;
    const stepMetrics = {};
    
    for (const [stepName, step] of Object.entries(this.performance.steps)) {
      if (step.duration) {
        stepMetrics[stepName] = {
          duration: step.duration,
          percentage: totalDuration > 0 ? (step.duration / totalDuration) * 100 : 0,
          operations: step.operations,
          memoryDelta: step.memoryDelta,
          throughput: step.operations > 0 ? step.operations / (step.duration / 1000) : 0
        };
      }
    }

    return {
      totalDuration,
      steps: stepMetrics,
      totalOperations: this.performance.operations.length,
      memoryPeak: Math.max(...Object.values(this.performance.steps)
        .filter(step => step.endMemory)
        .map(step => step.endMemory.heapUsed)),
      efficiency: this.calculateEfficiencyScore()
    };
  }

  /**
   * Calculate efficiency score based on performance metrics
   * @returns {number} Efficiency score (0-100)
   */
  calculateEfficiencyScore() {
    const totalDuration = this.results.duration || 0;
    const componentsProcessed = this.results.dataCollected;
    
    if (totalDuration === 0 || componentsProcessed === 0) {
      return 0;
    }

    // Base score on throughput (components per second)
    const throughput = (componentsProcessed / totalDuration) * 1000;
    
    // Normalize to 0-100 scale (assuming 1 component/second is 100% efficient)
    const efficiencyScore = Math.min(100, throughput * 100);
    
    return Math.round(efficiencyScore);
  }

  /**
   * Log performance summary
   */
  logPerformanceSummary() {
    if (!this.options.verbose) {
      return;
    }

    const perfMetrics = this.getPerformanceMetrics();
    
    logWithTimestamp('🎯 Performance Summary:');
    logWithTimestamp(`  Total Duration: ${perfMetrics.totalDuration.toFixed(2)}ms`);
    logWithTimestamp(`  Total Operations: ${perfMetrics.totalOperations}`);
    logWithTimestamp(`  Memory Peak: ${Math.round(perfMetrics.memoryPeak / 1024 / 1024)}MB`);
    logWithTimestamp(`  Efficiency Score: ${perfMetrics.efficiency}%`);
    
    logWithTimestamp('📊 Step Breakdown:');
    for (const [stepName, metrics] of Object.entries(perfMetrics.steps)) {
      logWithTimestamp(`  ${stepName}: ${metrics.duration.toFixed(2)}ms (${metrics.percentage.toFixed(1)}%) - ${metrics.operations} ops`);
    }
  }

  /**
   * Monitor system resources
   * @returns {Object} System resource information
   */
  getSystemResources() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version
    };
  }

  /**
   * Get execution summary with performance data
   * @returns {Object} Execution summary
   */
  getExecutionSummary() {
    const metrics = this.calculator.getMetrics();
    const perfMetrics = this.getPerformanceMetrics();
    const systemResources = this.getSystemResources();
    
    return {
      execution: {
        duration: this.results.duration,
        startTime: this.results.startTime,
        endTime: this.results.endTime,
        componentsScanned: this.results.componentsScanned,
        dataCollected: this.results.dataCollected,
        errors: this.results.errors.length,
        warnings: this.results.warnings.length
      },
      performance: perfMetrics,
      system: systemResources,
      metrics: metrics ? {
        totalComponents: metrics.summary.totalComponents,
        completionRate: metrics.summary.completionRate,
        averageAccuracy: metrics.summary.averageAccuracy,
        qualityGrade: this.calculator.getQualityScore(metrics).grade
      } : null,
      outputs: {
        reportGenerated: this.results.reportGenerated,
        readmeUpdated: this.results.readmeUpdated
      }
    };
  }
}

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed options
 */
function parseArguments(args) {
  const options = {
    componentsDir: BENCHMARK_CONFIG.COMPONENTS_DIR,
    outputDir: BENCHMARK_CONFIG.REPORTS_DIR,
    updateReadme: true,
    generateReport: true,
    verbose: false,
    dryRun: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-readme':
        options.updateReadme = false;
        break;
      case '--report-only':
        options.updateReadme = false;
        options.generateReport = true;
        break;
      case '--update-readme':
        options.updateReadme = true;
        options.generateReport = false;
        break;
      case '--components-dir':
        if (i + 1 < args.length) {
          options.componentsDir = args[++i];
        }
        break;
      case '--output-dir':
        if (i + 1 < args.length) {
          options.outputDir = args[++i];
        }
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
Figma Restoration Benchmark Tool

Usage: node benchmark.js [options]

Options:
  -h, --help              Show this help message
  -v, --verbose           Enable verbose logging
  --dry-run              Preview changes without writing files
  --no-readme            Skip README update
  --report-only          Generate report only (skip README update)
  --update-readme        Update README only (skip report generation)
  --components-dir DIR   Components directory (default: ${BENCHMARK_CONFIG.COMPONENTS_DIR})
  --output-dir DIR       Output directory for reports (default: ${BENCHMARK_CONFIG.REPORTS_DIR})

Examples:
  node benchmark.js                    # Run complete benchmark
  node benchmark.js --verbose         # Run with detailed logging
  node benchmark.js --dry-run         # Preview changes only
  node benchmark.js --report-only     # Generate JSON report only
  node benchmark.js --update-readme   # Update README only

The benchmark will:
1. Scan all components in the components directory
2. Collect restoration data from metadata files
3. Calculate comprehensive metrics and statistics
4. Generate JSON report and README content
5. Update README with current benchmark results
`);
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  if (options.help) {
    displayHelp();
    process.exit(0);
  }

  try {
    const orchestrator = new BenchmarkOrchestrator(options);
    const result = await orchestrator.execute();

    if (result.success) {
      const summary = orchestrator.getExecutionSummary();
      
      console.log('\n📊 Execution Summary:');
      console.log(`Duration: ${summary.execution.duration}ms`);
      console.log(`Components: ${summary.execution.componentsScanned} scanned, ${summary.execution.dataCollected} processed`);
      
      if (summary.metrics) {
        console.log(`Quality: ${summary.metrics.averageAccuracy?.toFixed(1) || 'N/A'}% average accuracy (Grade: ${summary.metrics.qualityGrade})`);
        console.log(`Completion: ${summary.metrics.completionRate?.toFixed(1) || 'N/A'}% (${summary.metrics.totalComponents} total components)`);
      }
      
      console.log(`Outputs: Report ${summary.outputs.reportGenerated ? '✅' : '❌'}, README ${summary.outputs.readmeUpdated ? '✅' : '❌'}`);
      
      if (summary.execution.warnings > 0) {
        console.log(`⚠️ ${summary.execution.warnings} warning(s) - check logs for details`);
      }

      process.exit(0);
    } else {
      console.error(`\n❌ Benchmark failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n💥 Unexpected error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BenchmarkOrchestrator, parseArguments, main };