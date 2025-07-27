/**
 * 对比数据服务 - 负责读取和管理对比报告数据
 */
export class ComparisonDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 获取组件的对比报告
   * @param {string} componentName - 组件名称
   * @returns {Promise<Object>} 对比报告数据
   */
  async getComparisonReport(componentName) {
    const cacheKey = `report_${componentName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // 尝试从组件目录读取报告
      const reportPath = `/src/components/${componentName}/results/comparison-report.json`;
      const response = await fetch(reportPath);
      
      if (!response.ok) {
        // 如果找不到报告，返回模拟数据
        console.warn(`Report not found for ${componentName}, using mock data`);
        return this.getMockReportData(componentName);
      }
      
      const reportData = await response.json();
      
      // 验证报告数据结构
      this.validateReportData(reportData);
      
      // 缓存数据
      this.cache.set(cacheKey, {
        data: reportData,
        timestamp: Date.now()
      });
      
      return reportData;
    } catch (error) {
      console.error('Failed to load comparison report:', error);
      // 返回模拟数据作为后备
      return this.getMockReportData(componentName);
    }
  }

  /**
   * 获取模拟的报告数据
   * @param {string} componentName - 组件名称
   * @returns {Object} 模拟报告数据
   */
  getMockReportData(componentName) {
    const mockData = {
      DesignV1: {
        componentName: 'DesignV1',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        summary: {
          matchPercentage: 87.86,
          status: 'needs_improvement',
          totalIssues: 7,
          diffPixels: 62308,
          totalPixels: 513216
        },
        images: {
          expected: `/src/components/DesignV1/results/expected.png`,
          actual: `/src/components/DesignV1/results/actual.png`,
          diff: `/src/components/DesignV1/results/diff.png`,
          heatmap: `/src/components/DesignV1/results/heatmap.png`
        },
        analysis: {
          matchPercentage: 87.86,
          diffPixels: 62308,
          totalPixels: 513216,
          dimensions: { width: 594, height: 864 },
          regions: [
            {
              x: 0, y: 0, width: 594, height: 864,
              pixelCount: 513216,
              severity: 'high',
              type: 'size',
              description: '593x863 区域存在尺寸差异，涉及 513216 个像素'
            }
          ],
          colorAnalysis: [
            {
              expectedColor: 'rgb(0,0,0)',
              actualColor: 'rgb(217,217,217)',
              pixelCount: 12294
            }
          ]
        },
        recommendations: {
          immediate: [
            {
              type: 'size',
              title: '修复组件尺寸差异',
              description: '组件的实际尺寸与设计稿不匹配，需要调整CSS尺寸属性',
              impact: 'high',
              category: 'visual',
              steps: ['检查CSS width和height属性', '确保box-sizing设置正确', '验证padding和margin值']
            }
          ],
          longTerm: [
            {
              type: 'color',
              title: '优化颜色一致性',
              description: '部分颜色与设计稿存在细微差异，建议使用设计系统中的标准颜色',
              impact: 'medium',
              category: 'visual'
            }
          ]
        }
      }
    };

    return mockData[componentName] || {
      componentName,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      summary: {
        matchPercentage: 0,
        status: 'unknown',
        totalIssues: 0,
        diffPixels: 0,
        totalPixels: 0
      },
      images: {
        expected: '',
        actual: '',
        diff: ''
      },
      analysis: {
        matchPercentage: 0,
        diffPixels: 0,
        totalPixels: 0,
        dimensions: { width: 0, height: 0 },
        regions: [],
        colorAnalysis: []
      },
      recommendations: {
        immediate: [],
        longTerm: []
      }
    };
  }

  /**
   * 获取所有组件的汇总信息
   * @returns {Promise<Array>} 组件汇总列表
   */
  async getComponentsSummary() {
    const cacheKey = 'components_summary';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // 尝试从实际的组件目录扫描数据
      const summaryData = await this.scanComponentsDirectory();
      
      // 缓存数据
      this.cache.set(cacheKey, {
        data: summaryData,
        timestamp: Date.now()
      });
      
      return summaryData;
    } catch (error) {
      console.error('Failed to load components summary:', error);
      // 返回模拟数据作为后备
      return this.getMockComponentsSummary();
    }
  }

  /**
   * 扫描组件目录获取汇总信息
   * @returns {Promise<Array>} 组件汇总数据
   */
  async scanComponentsDirectory() {
    const components = [];
    const knownComponents = ['DesignV1'];
    
    for (const componentName of knownComponents) {
      try {
        // 尝试加载组件的对比报告
        const reportPath = `/src/components/${componentName}/results/comparison-report.json`;
        const response = await fetch(reportPath);
        
        if (response.ok) {
          const report = await response.json();
          components.push({
            componentName: report.componentName,
            matchPercentage: report.summary.matchPercentage,
            status: report.summary.status,
            lastUpdated: report.timestamp,
            issueCount: report.summary.totalIssues || 0,
            diffPixels: report.summary.diffPixels,
            totalPixels: report.summary.totalPixels,
            description: `${componentName} 组件还原度分析`
          });
        } else {
          // 如果没有报告，添加默认数据
          components.push({
            componentName,
            matchPercentage: 0,
            status: 'unknown',
            lastUpdated: new Date().toISOString(),
            issueCount: 0,
            diffPixels: 0,
            totalPixels: 0,
            description: `${componentName} 组件 - 未进行对比分析`
          });
        }
      } catch (error) {
        console.warn(`Failed to load data for component ${componentName}:`, error);
        // 添加错误状态的组件
        components.push({
          componentName,
          matchPercentage: 0,
          status: 'error',
          lastUpdated: new Date().toISOString(),
          issueCount: 0,
          diffPixels: 0,
          totalPixels: 0,
          description: `${componentName} 组件 - 数据加载失败`
        });
      }
    }
    
    return components;
  }

  /**
   * 获取模拟的组件汇总数据
   * @returns {Array} 模拟组件数据
   */
  getMockComponentsSummary() {
    return [
      {
        componentName: 'DesignV1',
        matchPercentage: 87.86,
        status: 'needs_improvement',
        lastUpdated: new Date().toISOString(),
        issueCount: 7,
        diffPixels: 62308,
        totalPixels: 513216,
        description: 'DesignV1 组件还原度分析 - 包含方形元素和文本'
      }
    ];
  }

  /**
   * 获取组件的历史对比数据
   * @param {string} componentName - 组件名称
   * @param {number} limit - 返回记录数限制
   * @returns {Promise<Array>} 历史对比数据
   */
  async getComparisonHistory(componentName, limit = 10) {
    try {
      const response = await fetch(`/api/reports/${componentName}/history?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load history for ${componentName}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to load comparison history:', error);
      throw new Error(`无法加载组件 ${componentName} 的历史数据: ${error.message}`);
    }
  }

  /**
   * 触发组件重新截图和对比
   * @param {string} componentName - 组件名称
   * @returns {Promise<Object>} 新的对比结果
   */
  async refreshComponent(componentName) {
    try {
      const response = await fetch(`/api/components/${componentName}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to refresh ${componentName}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 清除缓存
      this.clearComponentCache(componentName);
      
      return result;
    } catch (error) {
      console.error('Failed to refresh component:', error);
      throw new Error(`无法刷新组件 ${componentName}: ${error.message}`);
    }
  }

  /**
   * 批量刷新多个组件
   * @param {Array<string>} componentNames - 组件名称列表
   * @returns {Promise<Array>} 刷新结果列表
   */
  async refreshComponents(componentNames) {
    try {
      const response = await fetch('/api/components/batch-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ components: componentNames })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to batch refresh components: ${response.statusText}`);
      }
      
      const results = await response.json();
      
      // 清除相关缓存
      componentNames.forEach(name => this.clearComponentCache(name));
      this.cache.delete('components_summary');
      
      return results;
    } catch (error) {
      console.error('Failed to batch refresh components:', error);
      throw new Error(`批量刷新组件失败: ${error.message}`);
    }
  }

  /**
   * 导出对比报告
   * @param {string} componentName - 组件名称
   * @param {string} format - 导出格式 ('pdf', 'json', 'html')
   * @returns {Promise<Blob>} 导出的文件数据
   */
  async exportReport(componentName, format = 'pdf') {
    try {
      const response = await fetch(`/api/reports/${componentName}/export?format=${format}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export report: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // 触发下载
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${componentName}-comparison-report.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      return blob;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw new Error(`导出报告失败: ${error.message}`);
    }
  }

  /**
   * 生成分享链接
   * @param {string} componentName - 组件名称
   * @param {Object} options - 分享选项
   * @returns {Promise<string>} 分享链接
   */
  async generateShareLink(componentName, options = {}) {
    try {
      const response = await fetch('/api/share/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          componentName,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate share link: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.shareUrl;
    } catch (error) {
      console.error('Failed to generate share link:', error);
      throw new Error(`生成分享链接失败: ${error.message}`);
    }
  }

  /**
   * 搜索组件
   * @param {string} query - 搜索关键词
   * @param {Object} filters - 过滤条件
   * @returns {Promise<Array>} 搜索结果
   */
  async searchComponents(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });
      
      const response = await fetch(`/api/components/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to search components:', error);
      throw new Error(`搜索组件失败: ${error.message}`);
    }
  }

  /**
   * 获取系统统计信息
   * @returns {Promise<Object>} 系统统计数据
   */
  async getSystemStats() {
    const cacheKey = 'system_stats';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // 从组件汇总数据计算统计信息
      const components = await this.getComponentsSummary();
      const statsData = this.calculateSystemStats(components);
      
      // 缓存数据
      this.cache.set(cacheKey, {
        data: statsData,
        timestamp: Date.now()
      });
      
      return statsData;
    } catch (error) {
      console.error('Failed to load system stats:', error);
      // 返回默认统计数据
      return this.getDefaultSystemStats();
    }
  }

  /**
   * 从组件数据计算系统统计信息
   * @param {Array} components - 组件列表
   * @returns {Object} 统计数据
   */
  calculateSystemStats(components) {
    const totalComponents = components.length;
    const totalMatch = components.reduce((sum, c) => sum + c.matchPercentage, 0);
    const averageMatchPercentage = totalComponents > 0 ? totalMatch / totalComponents : 0;
    
    const statusCounts = components.reduce((counts, c) => {
      const status = c.status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    return {
      totalComponents,
      averageMatchPercentage,
      statusDistribution: statusCounts,
      lastUpdate: new Date().toISOString(),
      componentsWithIssues: components.filter(c => c.issueCount > 0).length,
      totalIssues: components.reduce((sum, c) => sum + (c.issueCount || 0), 0)
    };
  }

  /**
   * 获取默认系统统计数据
   * @returns {Object} 默认统计数据
   */
  getDefaultSystemStats() {
    return {
      totalComponents: 2,
      averageMatchPercentage: 91.53,
      statusDistribution: {
        excellent: 1,
        needs_improvement: 1
      },
      lastUpdate: new Date().toISOString(),
      componentsWithIssues: 1,
      totalIssues: 7
    };
  }

  /**
   * 验证报告数据结构
   * @param {Object} reportData - 报告数据
   * @throws {Error} 如果数据结构无效
   */
  validateReportData(reportData) {
    const requiredFields = ['componentName', 'timestamp', 'summary', 'images', 'analysis'];
    
    for (const field of requiredFields) {
      if (!reportData[field]) {
        throw new Error(`Invalid report data: missing field '${field}'`);
      }
    }
    
    // 验证summary结构
    const summaryFields = ['matchPercentage', 'status', 'diffPixels', 'totalPixels'];
    for (const field of summaryFields) {
      if (reportData.summary[field] === undefined) {
        throw new Error(`Invalid summary data: missing field '${field}'`);
      }
    }
    
    // 验证images结构
    const imageFields = ['expected', 'actual', 'diff'];
    for (const field of imageFields) {
      if (!reportData.images[field]) {
        throw new Error(`Invalid images data: missing field '${field}'`);
      }
    }
  }

  /**
   * 清除组件相关缓存
   * @param {string} componentName - 组件名称
   */
  clearComponentCache(componentName) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(componentName)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemory: JSON.stringify(Array.from(this.cache.values())).length
    };
  }
}

/**
 * 组件注册服务 - 维护所有组件的索引和元数据
 */
export class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.lastUpdate = null;
  }

  /**
   * 注册组件
   * @param {string} name - 组件名称
   * @param {Object} metadata - 组件元数据
   */
  registerComponent(name, metadata) {
    this.components.set(name, {
      ...metadata,
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    this.lastUpdate = new Date().toISOString();
  }

  /**
   * 获取组件信息
   * @param {string} name - 组件名称
   * @returns {Object|null} 组件信息
   */
  getComponent(name) {
    return this.components.get(name) || null;
  }

  /**
   * 获取所有组件
   * @returns {Array} 组件列表
   */
  getAllComponents() {
    return Array.from(this.components.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  /**
   * 更新组件元数据
   * @param {string} name - 组件名称
   * @param {Object} updates - 更新数据
   */
  updateComponent(name, updates) {
    const existing = this.components.get(name);
    if (existing) {
      this.components.set(name, {
        ...existing,
        ...updates,
        lastUpdated: new Date().toISOString()
      });
      this.lastUpdate = new Date().toISOString();
    }
  }

  /**
   * 移除组件
   * @param {string} name - 组件名称
   */
  removeComponent(name) {
    this.components.delete(name);
    this.lastUpdate = new Date().toISOString();
  }

  /**
   * 搜索组件
   * @param {string} query - 搜索查询
   * @param {Object} filters - 过滤条件
   * @returns {Array} 搜索结果
   */
  searchComponents(query, filters = {}) {
    const allComponents = this.getAllComponents();
    
    let results = allComponents;
    
    // 文本搜索
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(component => 
        component.name.toLowerCase().includes(lowerQuery) ||
        (component.description && component.description.toLowerCase().includes(lowerQuery)) ||
        (component.tags && component.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    }
    
    // 应用过滤器
    if (filters.status) {
      results = results.filter(component => component.status === filters.status);
    }
    
    if (filters.minMatchPercentage) {
      results = results.filter(component => 
        component.lastMatchPercentage >= filters.minMatchPercentage
      );
    }
    
    if (filters.maxMatchPercentage) {
      results = results.filter(component => 
        component.lastMatchPercentage <= filters.maxMatchPercentage
      );
    }
    
    return results;
  }

  /**
   * 获取注册表统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const components = this.getAllComponents();
    
    return {
      totalComponents: components.length,
      lastUpdate: this.lastUpdate,
      statusDistribution: this.getStatusDistribution(components),
      averageMatchPercentage: this.getAverageMatchPercentage(components)
    };
  }

  /**
   * 获取状态分布
   * @param {Array} components - 组件列表
   * @returns {Object} 状态分布
   */
  getStatusDistribution(components) {
    const distribution = {};
    components.forEach(component => {
      const status = component.status || 'unknown';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 获取平均匹配百分比
   * @param {Array} components - 组件列表
   * @returns {number} 平均匹配百分比
   */
  getAverageMatchPercentage(components) {
    const validComponents = components.filter(c => 
      typeof c.lastMatchPercentage === 'number'
    );
    
    if (validComponents.length === 0) return 0;
    
    const sum = validComponents.reduce((acc, c) => acc + c.lastMatchPercentage, 0);
    return sum / validComponents.length;
  }
}

// 创建单例实例
export const comparisonDataService = new ComparisonDataService();
export const componentRegistry = new ComponentRegistry();