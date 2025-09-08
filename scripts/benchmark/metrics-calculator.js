/**
 * Metrics Calculator
 * Computes comprehensive statistics and quality metrics
 */

import { BENCHMARK_CONFIG, ACCURACY_CATEGORIES } from './config.js';
import { logWithTimestamp } from './utils.js';

/**
 * Interface for benchmark metrics
 * @typedef {Object} BenchmarkMetrics
 * @property {Object} summary - Summary statistics
 * @property {Object} distribution - Accuracy distribution
 * @property {RestorationData[]} components - Component data
 * @property {Object} trends - Trend analysis
 * @property {string} timestamp - Generation timestamp
 */

export class MetricsCalculator {
  constructor() {
    this.calculatedMetrics = null;
  }

  /**
   * Calculate comprehensive metrics from restoration data
   * @param {RestorationData[]} restorationData - Array of restoration data
   * @returns {BenchmarkMetrics} Calculated metrics
   */
  calculateMetrics(restorationData) {
    logWithTimestamp(`Calculating metrics for ${restorationData.length} components`);

    const metrics = {
      summary: this.calculateSummaryStatistics(restorationData),
      distribution: this.calculateAccuracyDistribution(restorationData),
      components: this.sortComponentsByAccuracy(restorationData),
      trends: this.calculateTrends(restorationData),
      timestamp: new Date().toISOString(),
      metadata: {
        totalComponents: restorationData.length,
        calculationTime: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    this.calculatedMetrics = metrics;
    
    logWithTimestamp(`Metrics calculation completed. Average accuracy: ${metrics.summary.averageAccuracy?.toFixed(1) || 'N/A'}%`);
    
    return metrics;
  }

  /**
   * Calculate summary statistics
   * @param {RestorationData[]} data - Restoration data
   * @returns {Object} Summary statistics
   */
  calculateSummaryStatistics(data) {
    const totalComponents = data.length;
    const completedComponents = data.filter(d => d.status === BENCHMARK_CONFIG.STATUS.COMPLETED).length;
    
    // Get accuracy values for completed components
    const accuracyValues = data
      .filter(d => d.status === BENCHMARK_CONFIG.STATUS.COMPLETED && d.matchPercentage !== null)
      .map(d => d.matchPercentage)
      .sort((a, b) => a - b);

    let averageAccuracy = null;
    let medianAccuracy = null;
    let bestAccuracy = null;
    let worstAccuracy = null;

    if (accuracyValues.length > 0) {
      averageAccuracy = accuracyValues.reduce((sum, acc) => sum + acc, 0) / accuracyValues.length;
      medianAccuracy = this.calculateMedian(accuracyValues);
      bestAccuracy = Math.max(...accuracyValues);
      worstAccuracy = Math.min(...accuracyValues);
    }

    const completionRate = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0;

    // Find best and worst performing components
    const bestComponent = data.find(d => d.matchPercentage === bestAccuracy);
    const worstComponent = data.find(d => d.matchPercentage === worstAccuracy);

    // Calculate additional statistics
    const pendingComponents = data.filter(d => d.status === BENCHMARK_CONFIG.STATUS.PENDING).length;
    const failedComponents = data.filter(d => d.status === BENCHMARK_CONFIG.STATUS.FAILED).length;
    const notTestedComponents = data.filter(d => d.status === BENCHMARK_CONFIG.STATUS.NOT_TESTED).length;

    const totalAssets = data.reduce((sum, d) => sum + (d.assetCount || 0), 0);
    const averageAssets = totalComponents > 0 ? totalAssets / totalComponents : 0;

    return {
      totalComponents,
      completedComponents,
      pendingComponents,
      failedComponents,
      notTestedComponents,
      averageAccuracy,
      medianAccuracy,
      bestAccuracy,
      worstAccuracy,
      completionRate,
      bestComponent: bestComponent ? {
        name: bestComponent.componentName,
        accuracy: bestComponent.matchPercentage
      } : null,
      worstComponent: worstComponent ? {
        name: worstComponent.componentName,
        accuracy: worstComponent.matchPercentage
      } : null,
      totalAssets,
      averageAssets: Math.round(averageAssets * 10) / 10,
      standardDeviation: this.calculateStandardDeviation(accuracyValues, averageAccuracy)
    };
  }

  /**
   * Calculate accuracy distribution
   * @param {RestorationData[]} data - Restoration data
   * @returns {Object} Distribution statistics
   */
  calculateAccuracyDistribution(data) {
    const completedData = data.filter(d => 
      d.status === BENCHMARK_CONFIG.STATUS.COMPLETED && 
      d.matchPercentage !== null
    );

    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    };

    const componentsByCategory = {
      excellent: [],
      good: [],
      fair: [],
      poor: []
    };

    for (const component of completedData) {
      const category = this.categorizeAccuracy(component.matchPercentage);
      distribution[category]++;
      componentsByCategory[category].push({
        name: component.componentName,
        accuracy: component.matchPercentage
      });
    }

    // Calculate percentages
    const total = completedData.length;
    const distributionPercentages = {};
    
    for (const [category, count] of Object.entries(distribution)) {
      distributionPercentages[category] = total > 0 ? (count / total) * 100 : 0;
    }

    return {
      counts: distribution,
      percentages: distributionPercentages,
      componentsByCategory,
      totalEvaluated: total
    };
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
   * Sort components by accuracy
   * @param {RestorationData[]} data - Restoration data
   * @returns {RestorationData[]} Sorted components
   */
  sortComponentsByAccuracy(data) {
    return [...data].sort((a, b) => {
      // Completed components with accuracy first
      if (a.matchPercentage !== null && b.matchPercentage !== null) {
        return b.matchPercentage - a.matchPercentage;
      }
      
      // Components with accuracy come before those without
      if (a.matchPercentage !== null && b.matchPercentage === null) {
        return -1;
      }
      
      if (a.matchPercentage === null && b.matchPercentage !== null) {
        return 1;
      }
      
      // Sort by status priority
      const statusPriority = {
        [BENCHMARK_CONFIG.STATUS.COMPLETED]: 1,
        [BENCHMARK_CONFIG.STATUS.FAILED]: 2,
        [BENCHMARK_CONFIG.STATUS.PENDING]: 3,
        [BENCHMARK_CONFIG.STATUS.NOT_TESTED]: 4
      };
      
      const aPriority = statusPriority[a.status] || 5;
      const bPriority = statusPriority[b.status] || 5;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Finally sort by name
      return a.componentName.localeCompare(b.componentName);
    });
  }

  /**
   * Calculate trends and improvements
   * @param {RestorationData[]} data - Restoration data
   * @returns {Object} Trend analysis
   */
  calculateTrends(data) {
    const trends = {
      improvementRate: 0,
      lastUpdated: null,
      recentActivity: [],
      statusTrends: {
        improving: 0,
        stable: 0,
        declining: 0
      }
    };

    // Find most recent activity
    const componentsWithTimestamps = data
      .filter(d => d.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (componentsWithTimestamps.length > 0) {
      trends.lastUpdated = componentsWithTimestamps[0].timestamp;
      
      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      trends.recentActivity = componentsWithTimestamps
        .filter(d => new Date(d.timestamp) > sevenDaysAgo)
        .map(d => ({
          componentName: d.componentName,
          timestamp: d.timestamp,
          accuracy: d.matchPercentage,
          status: d.status
        }));
    }

    // Calculate improvement rate (placeholder - would need historical data)
    const completedComponents = data.filter(d => d.status === BENCHMARK_CONFIG.STATUS.COMPLETED);
    if (completedComponents.length > 0) {
      const averageAccuracy = completedComponents.reduce((sum, d) => sum + (d.matchPercentage || 0), 0) / completedComponents.length;
      
      // Simple heuristic: if average accuracy is above 95%, consider it improving
      if (averageAccuracy >= 95) {
        trends.improvementRate = 2.5; // Positive trend
      } else if (averageAccuracy >= 90) {
        trends.improvementRate = 1.0; // Slight improvement
      } else {
        trends.improvementRate = -0.5; // Needs improvement
      }
    }

    return trends;
  }

  /**
   * Calculate median value
   * @param {number[]} values - Sorted array of values
   * @returns {number} Median value
   */
  calculateMedian(values) {
    if (values.length === 0) return null;
    
    const mid = Math.floor(values.length / 2);
    
    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    } else {
      return values[mid];
    }
  }

  /**
   * Calculate standard deviation
   * @param {number[]} values - Array of values
   * @param {number} mean - Mean value
   * @returns {number|null} Standard deviation
   */
  calculateStandardDeviation(values, mean) {
    if (!values.length || mean === null) return null;
    
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Get quality score based on metrics
   * @param {BenchmarkMetrics} metrics - Calculated metrics
   * @returns {Object} Quality score assessment
   */
  getQualityScore(metrics = this.calculatedMetrics) {
    if (!metrics) {
      return {
        score: 0,
        grade: 'F',
        description: 'No metrics available'
      };
    }

    const { summary, distribution } = metrics;
    
    // Calculate weighted score
    let score = 0;
    let maxScore = 0;

    // Completion rate (30% weight)
    if (summary.completionRate !== null) {
      score += (summary.completionRate / 100) * 30;
    }
    maxScore += 30;

    // Average accuracy (40% weight)
    if (summary.averageAccuracy !== null) {
      score += (summary.averageAccuracy / 100) * 40;
    }
    maxScore += 40;

    // Distribution quality (30% weight)
    const excellentRatio = distribution.percentages.excellent / 100;
    const goodRatio = distribution.percentages.good / 100;
    const distributionScore = (excellentRatio * 1.0) + (goodRatio * 0.8);
    score += distributionScore * 30;
    maxScore += 30;

    const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;

    // Assign grade
    let grade, description;
    if (finalScore >= 90) {
      grade = 'A';
      description = 'Excellent restoration quality';
    } else if (finalScore >= 80) {
      grade = 'B';
      description = 'Good restoration quality';
    } else if (finalScore >= 70) {
      grade = 'C';
      description = 'Fair restoration quality';
    } else if (finalScore >= 60) {
      grade = 'D';
      description = 'Poor restoration quality';
    } else {
      grade = 'F';
      description = 'Needs significant improvement';
    }

    return {
      score: Math.round(finalScore * 10) / 10,
      grade,
      description,
      breakdown: {
        completionRate: summary.completionRate,
        averageAccuracy: summary.averageAccuracy,
        distributionScore: distributionScore * 100
      }
    };
  }

  /**
   * Generate recommendations based on metrics
   * @param {BenchmarkMetrics} metrics - Calculated metrics
   * @returns {string[]} Array of recommendations
   */
  generateRecommendations(metrics = this.calculatedMetrics) {
    if (!metrics) {
      return ['Run benchmark analysis to get recommendations'];
    }

    const recommendations = [];
    const { summary, distribution } = metrics;

    // Completion rate recommendations
    if (summary.completionRate < 50) {
      recommendations.push('🎯 Focus on completing more component restorations - only ' + 
        Math.round(summary.completionRate) + '% are complete');
    }

    // Accuracy recommendations
    if (summary.averageAccuracy !== null) {
      if (summary.averageAccuracy < 90) {
        recommendations.push('📈 Improve restoration accuracy - current average is ' + 
          summary.averageAccuracy.toFixed(1) + '%');
      }
      
      if (summary.standardDeviation > 10) {
        recommendations.push('📊 Work on consistency - accuracy varies significantly across components');
      }
    }

    // Distribution recommendations
    if (distribution.counts.poor > 0) {
      recommendations.push('🔧 Address ' + distribution.counts.poor + 
        ' component(s) with poor accuracy (<90%)');
    }

    if (distribution.counts.excellent < distribution.totalEvaluated * 0.5) {
      recommendations.push('⭐ Aim for more excellent results (≥98% accuracy) - currently ' + 
        distribution.counts.excellent + ' out of ' + distribution.totalEvaluated);
    }

    // Asset recommendations
    if (summary.averageAssets > 10) {
      recommendations.push('🖼️ Consider optimizing components with many assets (avg: ' + 
        summary.averageAssets + ' assets per component)');
    }

    // Status-specific recommendations
    if (summary.failedComponents > 0) {
      recommendations.push('❌ Investigate ' + summary.failedComponents + 
        ' failed component(s) - they may have technical issues');
    }

    if (summary.pendingComponents > summary.completedComponents) {
      recommendations.push('⏳ Many components are pending - consider batch processing to improve efficiency');
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 Great work! Your restoration quality is excellent');
    }

    return recommendations;
  }

  /**
   * Get calculated metrics
   * @returns {BenchmarkMetrics|null} Calculated metrics or null
   */
  getMetrics() {
    return this.calculatedMetrics;
  }

  /**
   * Clear calculated metrics
   */
  clearMetrics() {
    this.calculatedMetrics = null;
  }

  /**
   * Create component ranking with detailed categorization
   * @param {RestorationData[]} data - Restoration data
   * @returns {Object} Component ranking results
   */
  createComponentRanking(data) {
    const completedComponents = data.filter(d => 
      d.status === BENCHMARK_CONFIG.STATUS.COMPLETED && 
      d.matchPercentage !== null
    );

    const ranking = {
      topPerformers: [],
      needsImprovement: [],
      categories: {
        excellent: [],
        good: [],
        fair: [],
        poor: []
      },
      statistics: {
        totalRanked: completedComponents.length,
        averageRank: 0,
        medianAccuracy: 0
      }
    };

    // Sort by accuracy descending
    const sortedComponents = completedComponents
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .map((component, index) => ({
        ...component,
        rank: index + 1,
        category: this.categorizeAccuracy(component.matchPercentage),
        percentile: ((completedComponents.length - index) / completedComponents.length) * 100
      }));

    // Categorize components
    for (const component of sortedComponents) {
      ranking.categories[component.category].push(component);
    }

    // Identify top performers (top 25% or accuracy >= 95%)
    const topThreshold = Math.max(3, Math.ceil(sortedComponents.length * 0.25));
    ranking.topPerformers = sortedComponents
      .slice(0, topThreshold)
      .filter(c => c.matchPercentage >= 95);

    // Identify components needing improvement (bottom 25% or accuracy < 90%)
    const bottomThreshold = Math.max(3, Math.ceil(sortedComponents.length * 0.25));
    ranking.needsImprovement = sortedComponents
      .slice(-bottomThreshold)
      .filter(c => c.matchPercentage < 90);

    // Calculate statistics
    if (sortedComponents.length > 0) {
      const accuracies = sortedComponents.map(c => c.matchPercentage);
      ranking.statistics.averageRank = sortedComponents.reduce((sum, c) => sum + c.rank, 0) / sortedComponents.length;
      ranking.statistics.medianAccuracy = this.calculateMedian(accuracies);
    }

    return ranking;
  }

  /**
   * Analyze accuracy trends over time
   * @param {RestorationData[]} data - Restoration data with timestamps
   * @returns {Object} Trend analysis results
   */
  analyzeAccuracyTrends(data) {
    const componentsWithTimestamps = data
      .filter(d => d.timestamp && d.matchPercentage !== null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (componentsWithTimestamps.length < 2) {
      return {
        hasTrendData: false,
        message: 'Insufficient data for trend analysis'
      };
    }

    const trends = {
      hasTrendData: true,
      timespan: {
        start: componentsWithTimestamps[0].timestamp,
        end: componentsWithTimestamps[componentsWithTimestamps.length - 1].timestamp
      },
      overallTrend: 'stable',
      trendStrength: 0,
      periods: [],
      improvements: [],
      regressions: []
    };

    // Group by time periods (weekly)
    const periods = this.groupByTimePeriods(componentsWithTimestamps, 'week');
    trends.periods = periods;

    // Calculate overall trend
    const firstPeriodAvg = periods[0]?.averageAccuracy || 0;
    const lastPeriodAvg = periods[periods.length - 1]?.averageAccuracy || 0;
    const trendChange = lastPeriodAvg - firstPeriodAvg;

    trends.trendStrength = Math.abs(trendChange);

    if (trendChange > 2) {
      trends.overallTrend = 'improving';
    } else if (trendChange < -2) {
      trends.overallTrend = 'declining';
    } else {
      trends.overallTrend = 'stable';
    }

    // Identify specific improvements and regressions
    for (let i = 1; i < periods.length; i++) {
      const current = periods[i];
      const previous = periods[i - 1];
      const change = current.averageAccuracy - previous.averageAccuracy;

      if (change > 5) {
        trends.improvements.push({
          period: current.period,
          change: change,
          from: previous.averageAccuracy,
          to: current.averageAccuracy
        });
      } else if (change < -5) {
        trends.regressions.push({
          period: current.period,
          change: change,
          from: previous.averageAccuracy,
          to: current.averageAccuracy
        });
      }
    }

    return trends;
  }

  /**
   * Group components by time periods
   * @param {RestorationData[]} components - Components with timestamps
   * @param {string} periodType - Period type ('day', 'week', 'month')
   * @returns {Object[]} Grouped periods
   */
  groupByTimePeriods(components, periodType = 'week') {
    const periods = new Map();

    for (const component of components) {
      const date = new Date(component.timestamp);
      let periodKey;

      switch (periodType) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      if (!periods.has(periodKey)) {
        periods.set(periodKey, {
          period: periodKey,
          components: [],
          averageAccuracy: 0,
          count: 0
        });
      }

      periods.get(periodKey).components.push(component);
    }

    // Calculate averages for each period
    const periodArray = Array.from(periods.values());
    
    for (const period of periodArray) {
      const accuracies = period.components.map(c => c.matchPercentage);
      period.averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      period.count = period.components.length;
    }

    return periodArray.sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Generate detailed category analysis
   * @param {RestorationData[]} data - Restoration data
   * @returns {Object} Category analysis
   */
  generateCategoryAnalysis(data) {
    const analysis = {
      categories: {},
      insights: [],
      recommendations: []
    };

    const completedData = data.filter(d => 
      d.status === BENCHMARK_CONFIG.STATUS.COMPLETED && 
      d.matchPercentage !== null
    );

    // Analyze each category
    for (const [categoryName, categoryInfo] of Object.entries(ACCURACY_CATEGORIES)) {
      const categoryComponents = completedData.filter(d => 
        this.categorizeAccuracy(d.matchPercentage) === categoryName
      );

      const categoryAnalysis = {
        count: categoryComponents.length,
        percentage: completedData.length > 0 ? (categoryComponents.length / completedData.length) * 100 : 0,
        components: categoryComponents.map(c => ({
          name: c.componentName,
          accuracy: c.matchPercentage,
          assetCount: c.assetCount
        })),
        averageAccuracy: categoryComponents.length > 0 
          ? categoryComponents.reduce((sum, c) => sum + c.matchPercentage, 0) / categoryComponents.length 
          : 0,
        averageAssets: categoryComponents.length > 0
          ? categoryComponents.reduce((sum, c) => sum + (c.assetCount || 0), 0) / categoryComponents.length
          : 0,
        label: categoryInfo.label,
        color: categoryInfo.color,
        threshold: categoryInfo.min
      };

      analysis.categories[categoryName] = categoryAnalysis;

      // Generate insights for each category
      if (categoryComponents.length > 0) {
        if (categoryName === 'excellent' && categoryAnalysis.percentage > 50) {
          analysis.insights.push(`🌟 ${categoryAnalysis.percentage.toFixed(1)}% of components achieve excellent quality (≥98%)`);
        }
        
        if (categoryName === 'poor' && categoryComponents.length > 0) {
          analysis.insights.push(`⚠️ ${categoryComponents.length} component(s) need significant improvement (<90%)`);
        }
        
        if (categoryName === 'fair' && categoryAnalysis.percentage > 30) {
          analysis.insights.push(`📈 ${categoryAnalysis.percentage.toFixed(1)}% of components are in fair range (90-95%) - potential for improvement`);
        }
      }
    }

    // Generate category-specific recommendations
    const excellentCount = analysis.categories.excellent.count;
    const poorCount = analysis.categories.poor.count;
    const totalEvaluated = completedData.length;

    if (excellentCount / totalEvaluated < 0.3) {
      analysis.recommendations.push('🎯 Target: Increase excellent components to 30%+ of total');
    }

    if (poorCount > 0) {
      analysis.recommendations.push(`🔧 Priority: Address ${poorCount} poor-performing component(s)`);
    }

    if (analysis.categories.fair.count > analysis.categories.good.count) {
      analysis.recommendations.push('📊 Focus on moving fair components (90-95%) to good range (95-98%)');
    }

    return analysis;
  }

  /**
   * Calculate component similarity and clustering
   * @param {RestorationData[]} data - Restoration data
   * @returns {Object} Similarity analysis
   */
  calculateComponentSimilarity(data) {
    const completedData = data.filter(d => 
      d.status === BENCHMARK_CONFIG.STATUS.COMPLETED && 
      d.matchPercentage !== null
    );

    const similarity = {
      clusters: [],
      outliers: [],
      patterns: []
    };

    if (completedData.length < 3) {
      return {
        ...similarity,
        message: 'Insufficient data for similarity analysis'
      };
    }

    // Simple clustering based on accuracy ranges
    const clusters = {
      highPerformers: completedData.filter(d => d.matchPercentage >= 95),
      mediumPerformers: completedData.filter(d => d.matchPercentage >= 85 && d.matchPercentage < 95),
      lowPerformers: completedData.filter(d => d.matchPercentage < 85)
    };

    // Identify outliers (components significantly different from their cluster)
    for (const [clusterName, clusterData] of Object.entries(clusters)) {
      if (clusterData.length > 0) {
        const clusterAvg = clusterData.reduce((sum, d) => sum + d.matchPercentage, 0) / clusterData.length;
        const clusterStdDev = this.calculateStandardDeviation(
          clusterData.map(d => d.matchPercentage), 
          clusterAvg
        );

        similarity.clusters.push({
          name: clusterName,
          count: clusterData.length,
          averageAccuracy: clusterAvg,
          standardDeviation: clusterStdDev,
          components: clusterData.map(d => d.componentName)
        });

        // Find outliers (more than 2 standard deviations from cluster mean)
        if (clusterStdDev > 0) {
          const outliers = clusterData.filter(d => 
            Math.abs(d.matchPercentage - clusterAvg) > 2 * clusterStdDev
          );
          
          similarity.outliers.push(...outliers.map(d => ({
            componentName: d.componentName,
            accuracy: d.matchPercentage,
            cluster: clusterName,
            deviation: Math.abs(d.matchPercentage - clusterAvg)
          })));
        }
      }
    }

    // Identify patterns
    const assetCounts = completedData.map(d => d.assetCount || 0);
    const avgAssets = assetCounts.reduce((sum, count) => sum + count, 0) / assetCounts.length;
    
    const highAssetComponents = completedData.filter(d => (d.assetCount || 0) > avgAssets * 1.5);
    const lowAssetComponents = completedData.filter(d => (d.assetCount || 0) < avgAssets * 0.5);

    if (highAssetComponents.length > 0) {
      const highAssetAvgAccuracy = highAssetComponents.reduce((sum, d) => sum + d.matchPercentage, 0) / highAssetComponents.length;
      similarity.patterns.push({
        type: 'asset_correlation',
        description: `Components with many assets (${highAssetComponents.length}) have ${highAssetAvgAccuracy.toFixed(1)}% average accuracy`,
        components: highAssetComponents.map(d => d.componentName)
      });
    }

    return similarity;
  }
}