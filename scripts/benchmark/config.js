/**
 * Benchmark System Configuration
 * Central configuration for the Figma restoration benchmark system
 */

export const BENCHMARK_CONFIG = {
  // Directory paths
  COMPONENTS_DIR: './src/components',
  SCRIPTS_DIR: './scripts/benchmark',
  REPORTS_DIR: './benchmark-reports',
  
  // File patterns
  METADATA_FILE: 'metadata.json',
  EXPECTED_IMAGE: 'expected.png',
  ACTUAL_IMAGE: 'actual.png',
  DIFF_IMAGE: 'diff.png',
  
  // Accuracy thresholds
  ACCURACY_THRESHOLDS: {
    EXCELLENT: 98,  // >= 98%
    GOOD: 95,       // 95-98%
    FAIR: 90,       // 90-95%
    POOR: 0         // < 90%
  },
  
  // Status constants
  STATUS: {
    COMPLETED: 'completed',
    PENDING: 'pending',
    FAILED: 'failed',
    NOT_TESTED: 'not_tested'
  },
  
  // Report configuration
  REPORT: {
    JSON_FILENAME: 'benchmark-report.json',
    README_SECTION_MARKER: '## 📊 Restoration Benchmark',
    BACKUP_SUFFIX: '.backup'
  },
  
  // Performance settings
  PERFORMANCE: {
    MAX_CONCURRENT_SCANS: 10,
    PROGRESS_UPDATE_INTERVAL: 100
  }
};

export const ACCURACY_CATEGORIES = {
  excellent: { min: 98, label: '🟢 Excellent', color: 'green' },
  good: { min: 95, label: '🔵 Good', color: 'blue' },
  fair: { min: 90, label: '🟡 Fair', color: 'yellow' },
  poor: { min: 0, label: '🔴 Poor', color: 'red' }
};

export const STATUS_INDICATORS = {
  [BENCHMARK_CONFIG.STATUS.COMPLETED]: '✅ Complete',
  [BENCHMARK_CONFIG.STATUS.PENDING]: '⏳ Pending',
  [BENCHMARK_CONFIG.STATUS.FAILED]: '❌ Failed',
  [BENCHMARK_CONFIG.STATUS.NOT_TESTED]: '⚪ Not Tested'
};