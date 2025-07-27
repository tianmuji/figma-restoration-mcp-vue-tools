/**
 * 导出历史记录服务 - 跟踪导出的报告和分享链接
 */
export class ExportHistoryService {
  constructor() {
    this.storageKey = 'figma_export_history';
    this.maxHistoryItems = 100;
    this.history = this.loadHistory();
  }

  /**
   * 从本地存储加载历史记录
   * @returns {Array} 历史记录数组
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load export history:', error);
      return [];
    }
  }

  /**
   * 保存历史记录到本地存储
   */
  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save export history:', error);
    }
  }

  /**
   * 添加导出记录
   * @param {Object} exportRecord - 导出记录
   */
  addExportRecord(exportRecord) {
    const record = {
      id: this.generateRecordId(),
      timestamp: new Date().toISOString(),
      ...exportRecord
    };

    // 添加到历史记录开头
    this.history.unshift(record);

    // 限制历史记录数量
    if (this.history.length > this.maxHistoryItems) {
      this.history = this.history.slice(0, this.maxHistoryItems);
    }

    this.saveHistory();
    return record;
  }

  /**
   * 添加 PDF 导出记录
   * @param {string} componentName - 组件名称
   * @param {string} template - 使用的模板
   * @param {string} filename - 文件名
   * @param {number} fileSize - 文件大小（字节）
   * @param {Object} options - 导出选项
   * @returns {Object} 导出记录
   */
  addPDFExport(componentName, template, filename, fileSize, options = {}) {
    return this.addExportRecord({
      type: 'pdf',
      componentName,
      template,
      filename,
      fileSize,
      options,
      status: 'completed'
    });
  }

  /**
   * 添加分享链接记录
   * @param {string} componentName - 组件名称
   * @param {string} shareId - 分享 ID
   * @param {string} shareUrl - 分享 URL
   * @param {Date} expiresAt - 过期时间
   * @param {Object} options - 分享选项
   * @returns {Object} 分享记录
   */
  addShareLink(componentName, shareId, shareUrl, expiresAt, options = {}) {
    return this.addExportRecord({
      type: 'share',
      componentName,
      shareId,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      options,
      status: 'active',
      accessCount: 0
    });
  }

  /**
   * 添加批量导出记录
   * @param {Array<string>} componentNames - 组件名称列表
   * @param {string} exportType - 导出类型
   * @param {Object} options - 导出选项
   * @returns {Object} 批量导出记录
   */
  addBatchExport(componentNames, exportType, options = {}) {
    return this.addExportRecord({
      type: 'batch',
      exportType,
      componentNames,
      componentCount: componentNames.length,
      options,
      status: 'completed'
    });
  }

  /**
   * 更新记录状态
   * @param {string} recordId - 记录 ID
   * @param {Object} updates - 更新数据
   */
  updateRecord(recordId, updates) {
    const index = this.history.findIndex(record => record.id === recordId);
    if (index !== -1) {
      this.history[index] = {
        ...this.history[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveHistory();
    }
  }

  /**
   * 更新分享链接访问统计
   * @param {string} shareId - 分享 ID
   * @param {number} accessCount - 访问次数
   */
  updateShareAccess(shareId, accessCount) {
    const record = this.history.find(r => r.type === 'share' && r.shareId === shareId);
    if (record) {
      this.updateRecord(record.id, {
        accessCount,
        lastAccessed: new Date().toISOString()
      });
    }
  }

  /**
   * 标记分享链接为过期
   * @param {string} shareId - 分享 ID
   */
  markShareExpired(shareId) {
    const record = this.history.find(r => r.type === 'share' && r.shareId === shareId);
    if (record) {
      this.updateRecord(record.id, {
        status: 'expired'
      });
    }
  }

  /**
   * 删除记录
   * @param {string} recordId - 记录 ID
   */
  deleteRecord(recordId) {
    const index = this.history.findIndex(record => record.id === recordId);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.saveHistory();
    }
  }

  /**
   * 获取历史记录
   * @param {Object} filters - 过滤条件
   * @returns {Array} 过滤后的历史记录
   */
  getHistory(filters = {}) {
    let filtered = [...this.history];

    // 按类型过滤
    if (filters.type) {
      filtered = filtered.filter(record => record.type === filters.type);
    }

    // 按组件名过滤
    if (filters.componentName) {
      filtered = filtered.filter(record => 
        record.componentName === filters.componentName ||
        (record.componentNames && record.componentNames.includes(filters.componentName))
      );
    }

    // 按状态过滤
    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    // 按时间范围过滤
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(record => new Date(record.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(record => new Date(record.timestamp) <= toDate);
    }

    // 分页
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * 获取组件的导出历史
   * @param {string} componentName - 组件名称
   * @param {number} limit - 限制数量
   * @returns {Array} 组件导出历史
   */
  getComponentHistory(componentName, limit = 20) {
    return this.getHistory({
      componentName,
      limit
    });
  }

  /**
   * 获取最近的导出记录
   * @param {number} limit - 限制数量
   * @returns {Array} 最近的导出记录
   */
  getRecentExports(limit = 10) {
    return this.history.slice(0, limit);
  }

  /**
   * 获取活跃的分享链接
   * @returns {Array} 活跃的分享链接
   */
  getActiveShares() {
    const now = new Date();
    return this.history.filter(record => 
      record.type === 'share' && 
      record.status === 'active' &&
      new Date(record.expiresAt) > now
    );
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const stats = {
      total: this.history.length,
      byType: {},
      byStatus: {},
      byComponent: {},
      recentActivity: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      fileSize: {
        total: 0,
        average: 0
      },
      shares: {
        active: 0,
        expired: 0,
        totalAccess: 0
      }
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalFileSize = 0;
    let fileSizeCount = 0;

    this.history.forEach(record => {
      // 按类型统计
      stats.byType[record.type] = (stats.byType[record.type] || 0) + 1;

      // 按状态统计
      stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;

      // 按组件统计
      if (record.componentName) {
        stats.byComponent[record.componentName] = (stats.byComponent[record.componentName] || 0) + 1;
      }
      if (record.componentNames) {
        record.componentNames.forEach(name => {
          stats.byComponent[name] = (stats.byComponent[name] || 0) + 1;
        });
      }

      // 时间统计
      const recordDate = new Date(record.timestamp);
      if (recordDate >= today) {
        stats.recentActivity.today++;
      }
      if (recordDate >= thisWeek) {
        stats.recentActivity.thisWeek++;
      }
      if (recordDate >= thisMonth) {
        stats.recentActivity.thisMonth++;
      }

      // 文件大小统计
      if (record.fileSize) {
        totalFileSize += record.fileSize;
        fileSizeCount++;
      }

      // 分享统计
      if (record.type === 'share') {
        if (record.status === 'active' && new Date(record.expiresAt) > now) {
          stats.shares.active++;
        } else if (record.status === 'expired' || new Date(record.expiresAt) <= now) {
          stats.shares.expired++;
        }
        
        stats.shares.totalAccess += record.accessCount || 0;
      }
    });

    // 计算平均文件大小
    if (fileSizeCount > 0) {
      stats.fileSize.total = totalFileSize;
      stats.fileSize.average = totalFileSize / fileSizeCount;
    }

    return stats;
  }

  /**
   * 清理历史记录
   * @param {Object} options - 清理选项
   */
  cleanup(options = {}) {
    const {
      olderThan = 30, // 天数
      types = [], // 要清理的类型
      statuses = ['expired'], // 要清理的状态
      keepRecent = 10 // 保留最近的记录数
    } = options;

    const cutoffDate = new Date(Date.now() - olderThan * 24 * 60 * 60 * 1000);
    const originalLength = this.history.length;

    // 过滤要保留的记录
    this.history = this.history.filter((record, index) => {
      // 保留最近的记录
      if (index < keepRecent) {
        return true;
      }

      // 检查时间
      if (new Date(record.timestamp) < cutoffDate) {
        return false;
      }

      // 检查类型
      if (types.length > 0 && types.includes(record.type)) {
        return false;
      }

      // 检查状态
      if (statuses.includes(record.status)) {
        return false;
      }

      return true;
    });

    const cleanedCount = originalLength - this.history.length;
    
    if (cleanedCount > 0) {
      this.saveHistory();
      console.log(`Cleaned up ${cleanedCount} export history records`);
    }

    return cleanedCount;
  }

  /**
   * 导出历史记录
   * @param {string} format - 导出格式 ('json' | 'csv')
   * @returns {string} 导出数据
   */
  exportHistory(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.history, null, 2);
    }

    if (format === 'csv') {
      const headers = [
        'ID', 'Type', 'Component', 'Timestamp', 'Status', 
        'Filename', 'File Size', 'Share URL', 'Access Count'
      ];

      const rows = this.history.map(record => [
        record.id,
        record.type,
        record.componentName || record.componentNames?.join(';') || '',
        record.timestamp,
        record.status,
        record.filename || '',
        record.fileSize || '',
        record.shareUrl || '',
        record.accessCount || ''
      ]);

      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }

    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * 导入历史记录
   * @param {string} data - 导入数据
   * @param {string} format - 数据格式
   * @param {boolean} merge - 是否合并现有数据
   */
  importHistory(data, format = 'json', merge = true) {
    try {
      let importedHistory = [];

      if (format === 'json') {
        importedHistory = JSON.parse(data);
      } else {
        throw new Error(`Unsupported import format: ${format}`);
      }

      // 验证数据格式
      if (!Array.isArray(importedHistory)) {
        throw new Error('Invalid history data format');
      }

      if (merge) {
        // 合并数据，避免重复
        const existingIds = new Set(this.history.map(r => r.id));
        const newRecords = importedHistory.filter(r => !existingIds.has(r.id));
        
        this.history = [...newRecords, ...this.history];
        
        // 限制总数量
        if (this.history.length > this.maxHistoryItems) {
          this.history = this.history.slice(0, this.maxHistoryItems);
        }
      } else {
        this.history = importedHistory.slice(0, this.maxHistoryItems);
      }

      this.saveHistory();
      console.log(`Imported ${importedHistory.length} history records`);
    } catch (error) {
      console.error('Failed to import history:', error);
      throw new Error(`导入历史记录失败: ${error.message}`);
    }
  }

  /**
   * 生成记录 ID
   * @returns {string} 记录 ID
   */
  generateRecordId() {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清空所有历史记录
   */
  clearAll() {
    this.history = [];
    this.saveHistory();
    console.log('All export history cleared');
  }

  /**
   * 获取存储使用情况
   * @returns {Object} 存储信息
   */
  getStorageInfo() {
    const data = localStorage.getItem(this.storageKey) || '';
    return {
      recordCount: this.history.length,
      storageSize: new Blob([data]).size,
      maxRecords: this.maxHistoryItems,
      storageKey: this.storageKey
    };
  }
}

// 创建单例实例
export const exportHistoryService = new ExportHistoryService();

// 定期清理过期记录
setInterval(() => {
  exportHistoryService.cleanup({
    olderThan: 90, // 清理90天前的记录
    statuses: ['expired', 'failed'],
    keepRecent: 20
  });
}, 24 * 60 * 60 * 1000); // 每天清理一次