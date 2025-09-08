/**
 * Report Generator
 * Generates JSON reports and README content
 */

import fs from 'fs';
import path from 'path';
import { BENCHMARK_CONFIG, ACCURACY_CATEGORIES, STATUS_INDICATORS } from './config.js';
import { ensureDirectory, writeJsonFile, formatTimestamp, formatPercentage, createProgressBar, logWithTimestamp } from './utils.js';

/**
 * Interface for report options
 * @typedef {Object} ReportOptions
 * @property {boolean} includeDetails - Include detailed component information
 * @property {boolean} includeHistorical - Include historical data
 * @property {string} format - Output format ('json', 'markdown', 'both')
 * @property {string} outputDir - Output directory for reports
 */

export class ReportGenerator {
  constructor(options = {}) {
    this.options = {
      includeDetails: true,
      includeHistorical: false,
      format: 'both',
      outputDir: BENCHMARK_CONFIG.REPORTS_DIR,
      ...options
    };
  }

  /**
   * Generate comprehensive JSON report
   * @param {BenchmarkMetrics} metrics - Calculated metrics
   * @returns {string} JSON report string
   */
  generateJSONReport(metrics) {
    logWithTimestamp('Generating JSON report');

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        generator: 'figma-restoration-benchmark',
        options: this.options
      },
      summary: this.createSummarySection(metrics),
      distribution: this.createDistributionSection(metrics),
      components: this.createComponentsSection(metrics),
      trends: this.createTrendsSection(metrics),
      quality: this.createQualitySection(metrics),
      recommendations: this.createRecommendationsSection(metrics)
    };

    if (this.options.includeHistorical) {
      report.historical = this.createHistoricalSection(metrics);
    }

    const jsonString = JSON.stringify(report, null, 2);
    
    logWithTimestamp(`JSON report generated (${jsonString.length} characters)`);
    
    return jsonString;
  }

  /**
   * Create summary section for report
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {Object} Summary section
   */
  createSummarySection(metrics) {
    const { summary } = metrics;
    
    return {
      overview: {
        totalComponents: summary.totalComponents,
        completedComponents: summary.completedComponents,
        completionRate: summary.completionRate,
        lastUpdated: metrics.timestamp
      },
      accuracy: {
        average: summary.averageAccuracy,
        median: summary.medianAccuracy,
        best: summary.bestAccuracy,
        worst: summary.worstAccuracy,
        standardDeviation: summary.standardDeviation
      },
      performance: {
        bestComponent: summary.bestComponent,
        worstComponent: summary.worstComponent,
        totalAssets: summary.totalAssets,
        averageAssets: summary.averageAssets
      },
      status: {
        completed: summary.completedComponents,
        pending: summary.pendingComponents,
        failed: summary.failedComponents,
        notTested: summary.notTestedComponents
      }
    };
  }

  /**
   * Create distribution section for report
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {Object} Distribution section
   */
  createDistributionSection(metrics) {
    const { distribution } = metrics;
    
    return {
      counts: distribution.counts,
      percentages: distribution.percentages,
      categories: Object.entries(ACCURACY_CATEGORIES).reduce((acc, [key, category]) => {
        acc[key] = {
          label: category.label,
          threshold: `≥${category.min}%`,
          count: distribution.counts[key] || 0,
          percentage: distribution.percentages[key] || 0,
          components: distribution.componentsByCategory[key] || []
        };
        return acc;
      }, {}),
      totalEvaluated: distribution.totalEvaluated
    };
  }

  /**
   * Create components section for report
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {Object} Components section
   */
  createComponentsSection(metrics) {
    const components = metrics.components.map(component => {
      const baseInfo = {
        name: component.componentName,
        status: component.status,
        accuracy: component.matchPercentage,
        timestamp: component.timestamp,
        assetCount: component.assetCount
      };

      if (this.options.includeDetails) {
        return {
          ...baseInfo,
          details: {
            diffPixels: component.diffPixels,
            totalPixels: component.totalPixels,
            dimensions: component.dimensions,
            figmaNodeId: component.figmaNodeId,
            figmaFileKey: component.figmaFileKey,
            category: component.matchPercentage !== null 
              ? this.categorizeAccuracy(component.matchPercentage) 
              : null
          }
        };
      }

      return baseInfo;
    });

    return {
      list: components,
      count: components.length,
      byStatus: this.groupComponentsByStatus(components),
      byCategory: this.groupComponentsByCategory(components)
    };
  }

  /**
   * Create trends section for report
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {Object} Trends section
   */
  createTrendsSection(metrics) {
    const { trends } = metrics;
    
    return {
      overall: {
        improvementRate: trends.improvementRate,
        lastUpdated: trends.lastUpdated,
        direction: trends.improvementRate > 1 ? 'improving' : 
                  trends.improvementRate < -1 ? 'declining' : 'stable'
      },
      recentActivity: trends.recentActivity || [],
      statusTrends: trends.statusTrends || {
        improving: 0,
        stable: 0,
        declining: 0
      }
    };
  }

  /**
   * Create quality section for report
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {Object} Quality section
   */
  createQualitySection(metrics) {
    // This would typically use MetricsCalculator.getQualityScore()
    // For now, we'll create a basic quality assessment
    const { summary, distribution } = metrics;
    
    let qualityScore = 0;
    let qualityGrade = 'F';
    let qualityDescription = 'No data available';

    if (summary.completionRate !== null && summary.averageAccuracy !== null) {
      // Simple quality calculation
      const completionWeight = 0.3;
      const accuracyWeight = 0.7;
      
      qualityScore = (summary.completionRate * completionWeight) + 
                    (summary.averageAccuracy * accuracyWeight);

      if (qualityScore >= 90) {
        qualityGrade = 'A';
        qualityDescription = 'Excellent restoration quality';
      } else if (qualityScore >= 80) {
        qualityGrade = 'B';
        qualityDescription = 'Good restoration quality';
      } else if (qualityScore >= 70) {
        qualityGrade = 'C';
        qualityDescription = 'Fair restoration quality';
      } else if (qualityScore >= 60) {
        qualityGrade = 'D';
        qualityDescription = 'Poor restoration quality';
      } else {
        qualityGrade = 'F';
        qualityDescription = 'Needs significant improvement';
      }
    }

    return {
      score: Math.round(qualityScore * 10) / 10,
      grade: qualityGrade,
      description: qualityDescription,
      breakdown: {
        completionRate: summary.completionRate,
        averageAccuracy: summary.averageAccuracy,
        excellentRatio: distribution.percentages.excellent || 0
      }
    };
  }

  /**
   * Create recommendations section for report
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {Object} Recommendations section
   */
  createRecommendationsSection(metrics) {
    const recommendations = [];
    const { summary, distribution } = metrics;

    // Generate recommendations based on metrics
    if (summary.completionRate < 50) {
      recommendations.push({
        type: 'completion',
        priority: 'high',
        message: `Focus on completing more component restorations - only ${Math.round(summary.completionRate)}% are complete`,
        action: 'Complete pending component restorations'
      });
    }

    if (summary.averageAccuracy !== null && summary.averageAccuracy < 90) {
      recommendations.push({
        type: 'accuracy',
        priority: 'high',
        message: `Improve restoration accuracy - current average is ${summary.averageAccuracy.toFixed(1)}%`,
        action: 'Review and optimize low-accuracy components'
      });
    }

    if (distribution.counts.poor > 0) {
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        message: `Address ${distribution.counts.poor} component(s) with poor accuracy (<90%)`,
        action: 'Focus on components with accuracy below 90%'
      });
    }

    if (summary.failedComponents > 0) {
      recommendations.push({
        type: 'technical',
        priority: 'high',
        message: `Investigate ${summary.failedComponents} failed component(s)`,
        action: 'Debug technical issues preventing completion'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'maintenance',
        priority: 'low',
        message: 'Great work! Your restoration quality is excellent',
        action: 'Continue maintaining high quality standards'
      });
    }

    return {
      list: recommendations,
      count: recommendations.length,
      byPriority: {
        high: recommendations.filter(r => r.priority === 'high').length,
        medium: recommendations.filter(r => r.priority === 'medium').length,
        low: recommendations.filter(r => r.priority === 'low').length
      }
    };
  }

  /**
   * Create historical section for report
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {Object} Historical section
   */
  createHistoricalSection(metrics) {
    // Placeholder for historical data
    // In a real implementation, this would analyze historical benchmark data
    return {
      dataPoints: [],
      trends: {
        accuracyTrend: 'stable',
        completionTrend: 'improving',
        qualityTrend: 'stable'
      },
      milestones: []
    };
  }

  /**
   * Save JSON report to file
   * @param {string} jsonReport - JSON report string
   * @param {string} filename - Output filename
   * @returns {string} Full path to saved file
   */
  saveJSONReport(jsonReport, filename = BENCHMARK_CONFIG.REPORT.JSON_FILENAME) {
    const outputPath = path.join(this.options.outputDir, filename);
    
    try {
      ensureDirectory(this.options.outputDir);
      fs.writeFileSync(outputPath, jsonReport, 'utf8');
      
      logWithTimestamp(`JSON report saved to: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      logWithTimestamp(`Error saving JSON report: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Group components by status
   * @param {Object[]} components - Component list
   * @returns {Object} Components grouped by status
   */
  groupComponentsByStatus(components) {
    const grouped = {};
    
    for (const status of Object.values(BENCHMARK_CONFIG.STATUS)) {
      grouped[status] = components.filter(c => c.status === status);
    }
    
    return grouped;
  }

  /**
   * Group components by accuracy category
   * @param {Object[]} components - Component list
   * @returns {Object} Components grouped by category
   */
  groupComponentsByCategory(components) {
    const grouped = {
      excellent: [],
      good: [],
      fair: [],
      poor: [],
      unrated: []
    };

    for (const component of components) {
      if (component.accuracy === null) {
        grouped.unrated.push(component);
      } else {
        const category = this.categorizeAccuracy(component.accuracy);
        grouped[category].push(component);
      }
    }

    return grouped;
  }

  /**
   * Categorize accuracy level
   * @param {number} accuracy - Accuracy percentage
   * @returns {string} Category name
   */
  categorizeAccuracy(accuracy) {
    if (accuracy >= BENCHMARK_CONFIG.ACCURACY_THRESHOLDS.EXCELLENT) {
      return 'excellent';
    } else if (accuracy >= BENCHMARK_CONFIG.ACCURACY_THRESHOLDS.GOOD) {
      return 'good';
    } else if (accuracy >= BENCHMARK_CONFIG.ACCURACY_THRESHOLDS.FAIR) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Generate and save complete report
   * @param {BenchmarkMetrics} metrics - Calculated metrics
   * @param {string} outputDir - Output directory
   * @returns {Object} Report generation results
   */
  generateAndSaveReport(metrics, outputDir = null) {
    if (outputDir) {
      this.options.outputDir = outputDir;
    }

    const results = {
      jsonReport: null,
      jsonPath: null,
      markdownReport: null,
      markdownPath: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Generate JSON report
      if (this.options.format === 'json' || this.options.format === 'both') {
        results.jsonReport = this.generateJSONReport(metrics);
        results.jsonPath = this.saveJSONReport(results.jsonReport);
      }

      // Generate Markdown report
      if (this.options.format === 'markdown' || this.options.format === 'both') {
        results.markdownReport = this.generateMarkdownSection(metrics);
        // Note: Markdown is typically used for README updates, not saved as separate file
        logWithTimestamp('Markdown content generated for README integration');
      }

      logWithTimestamp('Report generation completed successfully');
      
      return results;
    } catch (error) {
      logWithTimestamp(`Error generating report: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Validate report data before generation
   * @param {BenchmarkMetrics} metrics - Metrics to validate
   * @returns {Object} Validation results
   */
  validateReportData(metrics) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!metrics) {
      validation.isValid = false;
      validation.errors.push('No metrics data provided');
      return validation;
    }

    if (!metrics.summary) {
      validation.isValid = false;
      validation.errors.push('Missing summary data');
    }

    if (!metrics.distribution) {
      validation.isValid = false;
      validation.errors.push('Missing distribution data');
    }

    if (!metrics.components || !Array.isArray(metrics.components)) {
      validation.isValid = false;
      validation.errors.push('Missing or invalid components data');
    }

    if (metrics.components && metrics.components.length === 0) {
      validation.warnings.push('No components found in metrics data');
    }

    return validation;
  }

  /**
   * Generate Markdown section for README
   * @param {BenchmarkMetrics} metrics - Calculated metrics
   * @returns {string} Markdown content
   */
  generateMarkdownSection(metrics) {
    logWithTimestamp('Generating Markdown section for README');

    const { summary, distribution } = metrics;
    const lastUpdated = formatTimestamp(metrics.timestamp);
    const completedCount = summary.completedComponents;
    const totalCount = summary.totalComponents;
    const avgAccuracy = summary.averageAccuracy;

    let markdown = `## 📊 Restoration Benchmark\n\n`;
    
    // Header with key stats
    markdown += `> Last updated: ${lastUpdated} | Components tested: ${completedCount}/${totalCount} | Average accuracy: ${formatPercentage(avgAccuracy)}\n\n`;

    // Overall Performance Table
    markdown += `### Overall Performance\n\n`;
    markdown += `| Metric | Value | Status |\n`;
    markdown += `|--------|-------|--------|\n`;
    markdown += `| **Total Components** | ${totalCount} | - |\n`;
    markdown += `| **Completed Tests** | ${completedCount} | ${this.getStatusEmoji(summary.completionRate)} ${formatPercentage(summary.completionRate)} |\n`;
    markdown += `| **Average Accuracy** | ${formatPercentage(avgAccuracy)} | ${this.getAccuracyEmoji(avgAccuracy)} ${this.getAccuracyLabel(avgAccuracy)} |\n`;
    
    if (summary.bestComponent) {
      markdown += `| **Best Performance** | ${formatPercentage(summary.bestAccuracy)} | 🏆 ${summary.bestComponent.name} |\n`;
    }
    
    markdown += `| **Completion Rate** | ${formatPercentage(summary.completionRate)} | ${this.getStatusEmoji(summary.completionRate)} ${this.getCompletionLabel(summary.completionRate)} |\n\n`;

    // Accuracy Distribution
    markdown += `### Accuracy Distribution\n\n`;
    markdown += '```\n';
    
    const maxBarWidth = 40;
    const totalEvaluated = distribution.totalEvaluated || 1;
    
    for (const [category, info] of Object.entries(ACCURACY_CATEGORIES)) {
      const count = distribution.counts[category] || 0;
      const percentage = totalEvaluated > 0 ? (count / totalEvaluated) * 100 : 0;
      const barWidth = Math.round((percentage / 100) * maxBarWidth);
      const bar = createProgressBar(percentage, maxBarWidth);
      
      markdown += `${info.label} (≥${info.min}%): ${bar} ${count} component${count !== 1 ? 's' : ''}\n`;
    }
    
    markdown += '```\n\n';

    // Component Details Table
    markdown += `### Component Details\n\n`;
    markdown += `| Component | Accuracy | Status | Assets | Last Updated |\n`;
    markdown += `|-----------|----------|--------|--------|-------------|\n`;

    // Sort components for display (completed first, then by accuracy)
    const sortedComponents = [...metrics.components].sort((a, b) => {
      if (a.status === BENCHMARK_CONFIG.STATUS.COMPLETED && b.status !== BENCHMARK_CONFIG.STATUS.COMPLETED) {
        return -1;
      }
      if (a.status !== BENCHMARK_CONFIG.STATUS.COMPLETED && b.status === BENCHMARK_CONFIG.STATUS.COMPLETED) {
        return 1;
      }
      if (a.matchPercentage !== null && b.matchPercentage !== null) {
        return b.matchPercentage - a.matchPercentage;
      }
      return a.componentName.localeCompare(b.componentName);
    });

    for (const component of sortedComponents) {
      const accuracy = formatPercentage(component.matchPercentage);
      const status = STATUS_INDICATORS[component.status] || component.status;
      const assets = component.assetCount || 0;
      const lastUpdated = formatTimestamp(component.timestamp);
      
      markdown += `| ${component.componentName} | ${accuracy} | ${status} | ${assets} | ${lastUpdated} |\n`;
    }

    markdown += '\n';

    // Quality Insights
    if (avgAccuracy !== null) {
      markdown += `### Quality Insights\n\n`;
      
      const insights = this.generateQualityInsights(metrics);
      for (const insight of insights) {
        markdown += `- ${insight}\n`;
      }
      markdown += '\n';
    }

    // Recommendations
    const recommendations = this.generateMarkdownRecommendations(metrics);
    if (recommendations.length > 0) {
      markdown += `### Recommendations\n\n`;
      for (const recommendation of recommendations) {
        markdown += `- ${recommendation}\n`;
      }
      markdown += '\n';
    }

    logWithTimestamp(`Markdown section generated (${markdown.length} characters)`);
    
    return markdown;
  }

  /**
   * Create visual indicators for README
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {string} Visual indicators content
   */
  createVisualIndicators(metrics) {
    const { distribution } = metrics;
    let indicators = '';

    // Create progress bars for each category
    const totalEvaluated = distribution.totalEvaluated || 1;
    
    for (const [category, info] of Object.entries(ACCURACY_CATEGORIES)) {
      const count = distribution.counts[category] || 0;
      const percentage = totalEvaluated > 0 ? (count / totalEvaluated) * 100 : 0;
      const bar = createProgressBar(percentage, 40);
      
      indicators += `${info.label} (≥${info.min}%): ${bar} ${count} component${count !== 1 ? 's' : ''}\n`;
    }

    return indicators;
  }

  /**
   * Format component table for README
   * @param {RestorationData[]} components - Component data
   * @returns {string} Formatted table
   */
  formatComponentTable(components) {
    let table = `| Component | Accuracy | Status | Assets | Last Updated |\n`;
    table += `|-----------|----------|--------|--------|-------------|\n`;

    for (const component of components) {
      const accuracy = formatPercentage(component.matchPercentage);
      const status = STATUS_INDICATORS[component.status] || component.status;
      const assets = component.assetCount || 0;
      const lastUpdated = formatTimestamp(component.timestamp);
      
      table += `| ${component.componentName} | ${accuracy} | ${status} | ${assets} | ${lastUpdated} |\n`;
    }

    return table;
  }

  /**
   * Generate quality insights for README
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {string[]} Array of insight strings
   */
  generateQualityInsights(metrics) {
    const insights = [];
    const { summary, distribution } = metrics;

    // Completion insights
    if (summary.completionRate >= 80) {
      insights.push(`🎯 High completion rate: ${formatPercentage(summary.completionRate)} of components tested`);
    } else if (summary.completionRate < 50) {
      insights.push(`⏳ Low completion rate: Only ${formatPercentage(summary.completionRate)} of components tested`);
    }

    // Accuracy insights
    if (summary.averageAccuracy >= 95) {
      insights.push(`⭐ Excellent average accuracy: ${formatPercentage(summary.averageAccuracy)}`);
    } else if (summary.averageAccuracy >= 90) {
      insights.push(`👍 Good average accuracy: ${formatPercentage(summary.averageAccuracy)}`);
    } else if (summary.averageAccuracy < 85) {
      insights.push(`📈 Room for improvement: Average accuracy is ${formatPercentage(summary.averageAccuracy)}`);
    }

    // Distribution insights
    const excellentRatio = (distribution.counts.excellent || 0) / (distribution.totalEvaluated || 1);
    if (excellentRatio >= 0.5) {
      insights.push(`🌟 ${distribution.counts.excellent} components achieve excellent quality (≥98%)`);
    }

    const poorCount = distribution.counts.poor || 0;
    if (poorCount > 0) {
      insights.push(`⚠️ ${poorCount} component${poorCount !== 1 ? 's' : ''} need${poorCount === 1 ? 's' : ''} attention (<90% accuracy)`);
    }

    // Asset insights
    if (summary.averageAssets > 8) {
      insights.push(`🖼️ Asset-rich components: Average ${summary.averageAssets.toFixed(1)} assets per component`);
    }

    return insights;
  }

  /**
   * Generate recommendations for README
   * @param {BenchmarkMetrics} metrics - Metrics data
   * @returns {string[]} Array of recommendation strings
   */
  generateMarkdownRecommendations(metrics) {
    const recommendations = [];
    const { summary, distribution } = metrics;

    // Completion recommendations
    if (summary.completionRate < 70) {
      recommendations.push(`🎯 **Priority**: Complete testing for ${summary.totalComponents - summary.completedComponents} remaining components`);
    }

    // Accuracy recommendations
    if (summary.averageAccuracy !== null && summary.averageAccuracy < 90) {
      recommendations.push(`📈 **Improve Quality**: Focus on components below 90% accuracy`);
    }

    // Distribution recommendations
    const poorCount = distribution.counts.poor || 0;
    if (poorCount > 0) {
      recommendations.push(`🔧 **Fix Issues**: Address ${poorCount} component${poorCount !== 1 ? 's' : ''} with poor accuracy`);
    }

    const excellentCount = distribution.counts.excellent || 0;
    const totalEvaluated = distribution.totalEvaluated || 1;
    if (excellentCount / totalEvaluated < 0.3) {
      recommendations.push(`⭐ **Aim Higher**: Target 30%+ components with excellent accuracy (≥98%)`);
    }

    // Technical recommendations
    if (summary.failedComponents > 0) {
      recommendations.push(`❌ **Debug**: Investigate ${summary.failedComponents} failed component${summary.failedComponents !== 1 ? 's' : ''}`);
    }

    if (recommendations.length === 0) {
      recommendations.push(`🎉 **Great Work**: Your restoration quality is excellent! Keep it up!`);
    }

    return recommendations;
  }

  /**
   * Get status emoji based on percentage
   * @param {number} percentage - Percentage value
   * @returns {string} Status emoji
   */
  getStatusEmoji(percentage) {
    if (percentage >= 90) return '🟢';
    if (percentage >= 70) return '🟡';
    if (percentage >= 50) return '🟠';
    return '🔴';
  }

  /**
   * Get accuracy emoji based on accuracy value
   * @param {number} accuracy - Accuracy percentage
   * @returns {string} Accuracy emoji
   */
  getAccuracyEmoji(accuracy) {
    if (accuracy === null) return '⚪';
    if (accuracy >= 98) return '🟢';
    if (accuracy >= 95) return '🔵';
    if (accuracy >= 90) return '🟡';
    return '🔴';
  }

  /**
   * Get accuracy label based on accuracy value
   * @param {number} accuracy - Accuracy percentage
   * @returns {string} Accuracy label
   */
  getAccuracyLabel(accuracy) {
    if (accuracy === null) return 'Not Available';
    if (accuracy >= 98) return 'Excellent';
    if (accuracy >= 95) return 'Good';
    if (accuracy >= 90) return 'Fair';
    return 'Needs Work';
  }

  /**
   * Get completion label based on completion rate
   * @param {number} rate - Completion rate percentage
   * @returns {string} Completion label
   */
  getCompletionLabel(rate) {
    if (rate >= 90) return 'Nearly Complete';
    if (rate >= 70) return 'Good Progress';
    if (rate >= 50) return 'In Progress';
    return 'Getting Started';
  }
}