/**
 * 文件监听服务 - 监听组件文件的变化
 */
export class FileWatcher {
  constructor() {
    this.watchers = new Map();
    this.callbacks = new Map();
    this.debounceTimers = new Map();
    this.debounceDelay = 1000; // 1秒防抖
  }

  /**
   * 开始监听组件文件变化
   * @param {string} componentName - 组件名称
   * @param {Function} callback - 变化回调函数
   */
  watchComponent(componentName, callback) {
    if (this.watchers.has(componentName)) {
      this.stopWatching(componentName);
    }

    // 存储回调函数
    this.callbacks.set(componentName, callback);

    // 在浏览器环境中，我们使用 Intersection Observer 和定时器来模拟文件监听
    if (typeof window !== 'undefined') {
      this.startBrowserWatching(componentName);
    } else {
      // Node.js 环境中使用真实的文件监听
      this.startNodeWatching(componentName);
    }
  }

  /**
   * 停止监听组件
   * @param {string} componentName - 组件名称
   */
  stopWatching(componentName) {
    const watcher = this.watchers.get(componentName);
    if (watcher) {
      if (typeof watcher.close === 'function') {
        watcher.close();
      } else if (typeof watcher === 'number') {
        clearInterval(watcher);
      }
      this.watchers.delete(componentName);
    }

    this.callbacks.delete(componentName);
    
    // 清除防抖定时器
    const debounceTimer = this.debounceTimers.get(componentName);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      this.debounceTimers.delete(componentName);
    }
  }

  /**
   * 停止所有监听
   */
  stopAllWatching() {
    for (const componentName of this.watchers.keys()) {
      this.stopWatching(componentName);
    }
  }

  /**
   * 浏览器环境下的文件监听（模拟）
   * @param {string} componentName - 组件名称
   */
  startBrowserWatching(componentName) {
    // 使用定时器定期检查文件修改时间
    const checkInterval = setInterval(async () => {
      try {
        await this.checkComponentChanges(componentName);
      } catch (error) {
        console.error(`Error checking changes for ${componentName}:`, error);
      }
    }, 2000); // 每2秒检查一次

    this.watchers.set(componentName, checkInterval);
  }

  /**
   * Node.js 环境下的真实文件监听
   * @param {string} componentName - 组件名称
   */
  startNodeWatching(componentName) {
    // 这里可以使用 chokidar 或 fs.watch 来监听文件变化
    console.log(`Starting file watching for ${componentName} (Node.js environment)`);
    
    // 模拟文件监听器
    const mockWatcher = {
      close: () => {
        console.log(`Stopped watching ${componentName}`);
      }
    };
    
    this.watchers.set(componentName, mockWatcher);
  }

  /**
   * 检查组件变化
   * @param {string} componentName - 组件名称
   */
  async checkComponentChanges(componentName) {
    try {
      // 检查组件相关文件的修改时间
      const response = await fetch(`/api/components/${componentName}/status`);
      
      if (!response.ok) {
        return; // 组件不存在或无法访问
      }
      
      const status = await response.json();
      const lastModified = new Date(status.lastModified);
      
      // 获取上次检查的时间
      const lastCheck = this.getLastCheckTime(componentName);
      
      if (lastModified > lastCheck) {
        this.updateLastCheckTime(componentName, lastModified);
        this.triggerCallback(componentName, {
          type: 'file_changed',
          componentName,
          lastModified,
          files: status.changedFiles || []
        });
      }
    } catch (error) {
      console.error(`Failed to check changes for ${componentName}:`, error);
    }
  }

  /**
   * 触发回调函数（带防抖）
   * @param {string} componentName - 组件名称
   * @param {Object} changeInfo - 变化信息
   */
  triggerCallback(componentName, changeInfo) {
    // 清除之前的防抖定时器
    const existingTimer = this.debounceTimers.get(componentName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的防抖定时器
    const debounceTimer = setTimeout(() => {
      const callback = this.callbacks.get(componentName);
      if (callback) {
        callback(changeInfo);
      }
      this.debounceTimers.delete(componentName);
    }, this.debounceDelay);

    this.debounceTimers.set(componentName, debounceTimer);
  }

  /**
   * 获取上次检查时间
   * @param {string} componentName - 组件名称
   * @returns {Date} 上次检查时间
   */
  getLastCheckTime(componentName) {
    const stored = localStorage.getItem(`lastCheck_${componentName}`);
    return stored ? new Date(stored) : new Date(0);
  }

  /**
   * 更新上次检查时间
   * @param {string} componentName - 组件名称
   * @param {Date} time - 检查时间
   */
  updateLastCheckTime(componentName, time) {
    localStorage.setItem(`lastCheck_${componentName}`, time.toISOString());
  }

  /**
   * 获取监听状态
   * @returns {Object} 监听状态信息
   */
  getWatchingStatus() {
    return {
      totalWatchers: this.watchers.size,
      watchedComponents: Array.from(this.watchers.keys()),
      activeCallbacks: this.callbacks.size,
      pendingDebounces: this.debounceTimers.size
    };
  }

  /**
   * 设置防抖延迟
   * @param {number} delay - 延迟时间（毫秒）
   */
  setDebounceDelay(delay) {
    this.debounceDelay = Math.max(100, delay); // 最小100ms
  }
}

/**
 * 自动更新服务 - 处理文件变化触发的自动更新
 */
export class AutoUpdateService {
  constructor() {
    this.fileWatcher = new FileWatcher();
    this.updateQueue = [];
    this.isProcessing = false;
    this.maxConcurrentUpdates = 3;
    this.updateCallbacks = new Set();
    this.enabled = true;
  }

  /**
   * 启用自动更新
   */
  enable() {
    this.enabled = true;
    console.log('Auto-update service enabled');
  }

  /**
   * 禁用自动更新
   */
  disable() {
    this.enabled = false;
    this.fileWatcher.stopAllWatching();
    console.log('Auto-update service disabled');
  }

  /**
   * 开始监听组件自动更新
   * @param {string} componentName - 组件名称
   */
  startWatching(componentName) {
    if (!this.enabled) return;

    this.fileWatcher.watchComponent(componentName, (changeInfo) => {
      this.handleFileChange(changeInfo);
    });
  }

  /**
   * 停止监听组件
   * @param {string} componentName - 组件名称
   */
  stopWatching(componentName) {
    this.fileWatcher.stopWatching(componentName);
  }

  /**
   * 处理文件变化
   * @param {Object} changeInfo - 变化信息
   */
  async handleFileChange(changeInfo) {
    if (!this.enabled) return;

    console.log('File change detected:', changeInfo);

    // 添加到更新队列
    this.addToUpdateQueue({
      componentName: changeInfo.componentName,
      type: 'auto_update',
      timestamp: new Date(),
      reason: 'file_changed',
      files: changeInfo.files
    });

    // 通知监听器
    this.notifyUpdateCallbacks({
      type: 'file_change_detected',
      componentName: changeInfo.componentName,
      timestamp: new Date()
    });
  }

  /**
   * 添加到更新队列
   * @param {Object} updateTask - 更新任务
   */
  addToUpdateQueue(updateTask) {
    // 检查是否已经有相同组件的更新任务
    const existingIndex = this.updateQueue.findIndex(
      task => task.componentName === updateTask.componentName
    );

    if (existingIndex !== -1) {
      // 更新现有任务
      this.updateQueue[existingIndex] = updateTask;
    } else {
      // 添加新任务
      this.updateQueue.push(updateTask);
    }

    // 开始处理队列
    this.processUpdateQueue();
  }

  /**
   * 处理更新队列
   */
  async processUpdateQueue() {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // 并发处理多个更新任务
      const tasks = this.updateQueue.splice(0, this.maxConcurrentUpdates);
      const promises = tasks.map(task => this.executeUpdate(task));
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error processing update queue:', error);
    } finally {
      this.isProcessing = false;
      
      // 如果还有任务，继续处理
      if (this.updateQueue.length > 0) {
        setTimeout(() => this.processUpdateQueue(), 100);
      }
    }
  }

  /**
   * 执行更新任务
   * @param {Object} updateTask - 更新任务
   */
  async executeUpdate(updateTask) {
    const { componentName, type, reason } = updateTask;

    try {
      console.log(`Executing ${type} for ${componentName} (reason: ${reason})`);

      // 通知开始更新
      this.notifyUpdateCallbacks({
        type: 'update_started',
        componentName,
        timestamp: new Date()
      });

      // 执行截图和对比
      const response = await fetch(`/api/components/${componentName}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason,
          autoUpdate: true
        })
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      const result = await response.json();

      // 通知更新完成
      this.notifyUpdateCallbacks({
        type: 'update_completed',
        componentName,
        result,
        timestamp: new Date()
      });

      console.log(`Update completed for ${componentName}:`, result);
    } catch (error) {
      console.error(`Update failed for ${componentName}:`, error);

      // 通知更新失败
      this.notifyUpdateCallbacks({
        type: 'update_failed',
        componentName,
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  /**
   * 添加更新回调
   * @param {Function} callback - 回调函数
   */
  addUpdateCallback(callback) {
    this.updateCallbacks.add(callback);
  }

  /**
   * 移除更新回调
   * @param {Function} callback - 回调函数
   */
  removeUpdateCallback(callback) {
    this.updateCallbacks.delete(callback);
  }

  /**
   * 通知更新回调
   * @param {Object} event - 事件信息
   */
  notifyUpdateCallbacks(event) {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  /**
   * 获取服务状态
   * @returns {Object} 服务状态
   */
  getStatus() {
    return {
      enabled: this.enabled,
      isProcessing: this.isProcessing,
      queueLength: this.updateQueue.length,
      watchingStatus: this.fileWatcher.getWatchingStatus(),
      callbackCount: this.updateCallbacks.size
    };
  }

  /**
   * 清空更新队列
   */
  clearQueue() {
    this.updateQueue = [];
    console.log('Update queue cleared');
  }

  /**
   * 设置最大并发更新数
   * @param {number} max - 最大并发数
   */
  setMaxConcurrentUpdates(max) {
    this.maxConcurrentUpdates = Math.max(1, Math.min(10, max));
  }

  /**
   * 销毁服务
   */
  destroy() {
    this.disable();
    this.clearQueue();
    this.updateCallbacks.clear();
    console.log('Auto-update service destroyed');
  }
}

// 创建单例实例
export const fileWatcher = new FileWatcher();
export const autoUpdateService = new AutoUpdateService();