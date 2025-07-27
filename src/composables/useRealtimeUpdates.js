import { ref, onMounted, onUnmounted, watch } from 'vue';
import { realtimeUpdateManager } from '../services/websocket-service.js';
import { autoUpdateService } from '../services/file-watcher.js';

/**
 * 实时更新组合式 API
 * @param {Object} options - 配置选项
 * @returns {Object} 实时更新相关的响应式数据和方法
 */
export function useRealtimeUpdates(options = {}) {
  const {
    componentName = null,
    enableAutoUpdate = true,
    enableWebSocket = true,
    autoHideDelay = 3000
  } = options;

  // 响应式状态
  const isConnected = ref(false);
  const connectionStatus = ref('disconnected');
  const updateStatus = ref('idle');
  const updateMessage = ref('');
  const updateProgress = ref(null);
  const updateDetails = ref([]);
  const lastUpdateTime = ref(null);
  const hasUpdates = ref(false);

  // 内部状态
  const callbacks = new Set();
  const isInitialized = ref(false);

  /**
   * 初始化实时更新
   */
  const initialize = async () => {
    if (isInitialized.value) return;

    try {
      // 初始化 WebSocket 连接
      if (enableWebSocket) {
        await initializeWebSocket();
      }

      // 初始化自动更新服务
      if (enableAutoUpdate) {
        initializeAutoUpdate();
      }

      isInitialized.value = true;
      console.log('Realtime updates initialized');
    } catch (error) {
      console.error('Failed to initialize realtime updates:', error);
      updateStatus.value = 'error';
      updateMessage.value = '初始化实时更新失败';
    }
  };

  /**
   * 初始化 WebSocket 连接
   */
  const initializeWebSocket = async () => {
    try {
      await realtimeUpdateManager.initialize();

      // 监听连接状态变化
      realtimeUpdateManager.wsService.on('connected', () => {
        isConnected.value = true;
        connectionStatus.value = 'connected';
        updateStatus.value = 'success';
        updateMessage.value = '已连接到实时更新服务';
        addUpdateDetail('success', 'WebSocket 连接成功');
      });

      realtimeUpdateManager.wsService.on('disconnected', () => {
        isConnected.value = false;
        connectionStatus.value = 'disconnected';
        updateStatus.value = 'error';
        updateMessage.value = '与实时更新服务断开连接';
        addUpdateDetail('warning', 'WebSocket 连接断开');
      });

      realtimeUpdateManager.wsService.on('reconnecting', (data) => {
        connectionStatus.value = 'connecting';
        updateStatus.value = 'connecting';
        updateMessage.value = `正在重连... (第${data.attempt}次尝试)`;
        addUpdateDetail('info', `重连尝试 ${data.attempt}`);
      });

      // 订阅更新
      if (componentName) {
        subscribeToComponent(componentName);
      } else {
        subscribeToGlobal();
      }

    } catch (error) {
      console.error('WebSocket initialization failed:', error);
      isConnected.value = false;
      connectionStatus.value = 'error';
    }
  };

  /**
   * 初始化自动更新服务
   */
  const initializeAutoUpdate = () => {
    // 监听自动更新事件
    autoUpdateService.addUpdateCallback((event) => {
      handleAutoUpdateEvent(event);
    });

    // 如果指定了组件，开始监听文件变化
    if (componentName) {
      autoUpdateService.startWatching(componentName);
    }
  };

  /**
   * 处理自动更新事件
   * @param {Object} event - 更新事件
   */
  const handleAutoUpdateEvent = (event) => {
    const { type, componentName: eventComponent } = event;

    // 如果指定了组件名，只处理相关组件的事件
    if (componentName && eventComponent !== componentName) {
      return;
    }

    switch (type) {
      case 'file_change_detected':
        updateStatus.value = 'updating';
        updateMessage.value = '检测到文件变化，准备更新...';
        addUpdateDetail('info', `文件变化: ${eventComponent}`);
        break;

      case 'update_started':
        updateStatus.value = 'updating';
        updateMessage.value = '正在更新组件...';
        updateProgress.value = 0;
        addUpdateDetail('info', `开始更新: ${eventComponent}`);
        break;

      case 'update_completed':
        updateStatus.value = 'success';
        updateMessage.value = '组件更新完成';
        updateProgress.value = 100;
        lastUpdateTime.value = new Date();
        addUpdateDetail('success', `更新完成: ${eventComponent}`);

        // 通知回调
        notifyCallbacks({
          type: 'component_updated',
          componentName: eventComponent,
          result: event.result
        });
        break;

      case 'update_failed':
        updateStatus.value = 'error';
        updateMessage.value = '组件更新失败';
        updateProgress.value = null;
        addUpdateDetail('error', `更新失败: ${event.error}`);
        break;
    }
  };

  /**
   * 订阅组件更新
   * @param {string} name - 组件名称
   */
  const subscribeToComponent = (name) => {
    if (!enableWebSocket) return;

    realtimeUpdateManager.subscribeToComponent(name, (data) => {
      handleComponentUpdate(data);
    });
  };

  /**
   * 订阅全局更新
   */
  const subscribeToGlobal = () => {
    if (!enableWebSocket) return;

    realtimeUpdateManager.subscribeToGlobal((data) => {
      handleGlobalUpdate(data);
    });
  };

  /**
   * 处理组件更新
   * @param {Object} data - 更新数据
   */
  const handleComponentUpdate = (data) => {
    const { updateType, componentName: updatedComponent, result } = data;

    updateStatus.value = 'success';
    updateMessage.value = `组件 ${updatedComponent} 已更新`;
    lastUpdateTime.value = new Date();
    hasUpdates.value = true;

    addUpdateDetail('success', `${updatedComponent} ${updateType} 更新`);

    // 通知回调
    notifyCallbacks({
      type: 'component_updated',
      componentName: updatedComponent,
      updateType,
      result
    });
  };

  /**
   * 处理全局更新
   * @param {Object} data - 更新数据
   */
  const handleGlobalUpdate = (data) => {
    updateStatus.value = 'success';
    updateMessage.value = '系统数据已更新';
    lastUpdateTime.value = new Date();
    hasUpdates.value = true;

    addUpdateDetail('info', '全局数据更新');

    // 通知回调
    notifyCallbacks({
      type: 'global_updated',
      data
    });
  };

  /**
   * 添加更新详情
   * @param {string} type - 详情类型
   * @param {string} message - 详情消息
   */
  const addUpdateDetail = (type, message) => {
    const detail = {
      type,
      message,
      timestamp: new Date()
    };

    updateDetails.value.unshift(detail);

    // 限制详情数量
    if (updateDetails.value.length > 20) {
      updateDetails.value = updateDetails.value.slice(0, 20);
    }
  };

  /**
   * 添加更新回调
   * @param {Function} callback - 回调函数
   */
  const addUpdateCallback = (callback) => {
    callbacks.add(callback);
  };

  /**
   * 移除更新回调
   * @param {Function} callback - 回调函数
   */
  const removeUpdateCallback = (callback) => {
    callbacks.delete(callback);
  };

  /**
   * 通知所有回调
   * @param {Object} data - 通知数据
   */
  const notifyCallbacks = (data) => {
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  };

  /**
   * 手动刷新
   */
  const refresh = async () => {
    if (!componentName) return;

    try {
      updateStatus.value = 'updating';
      updateMessage.value = '正在手动刷新...';
      updateProgress.value = 0;

      // 触发手动更新
      const response = await fetch(`/api/components/${componentName}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'manual_refresh'
        })
      });

      if (!response.ok) {
        throw new Error(`刷新失败: ${response.statusText}`);
      }

      const result = await response.json();

      updateStatus.value = 'success';
      updateMessage.value = '手动刷新完成';
      updateProgress.value = 100;
      lastUpdateTime.value = new Date();

      addUpdateDetail('success', '手动刷新完成');

      // 通知回调
      notifyCallbacks({
        type: 'manual_refresh_completed',
        componentName,
        result
      });

      return result;
    } catch (error) {
      updateStatus.value = 'error';
      updateMessage.value = `刷新失败: ${error.message}`;
      updateProgress.value = null;

      addUpdateDetail('error', `手动刷新失败: ${error.message}`);
      throw error;
    }
  };

  /**
   * 重试连接
   */
  const retry = async () => {
    try {
      updateStatus.value = 'connecting';
      updateMessage.value = '正在重试连接...';

      if (enableWebSocket) {
        await realtimeUpdateManager.wsService.connect();
      }

      updateStatus.value = 'success';
      updateMessage.value = '重连成功';
      addUpdateDetail('success', '重连成功');
    } catch (error) {
      updateStatus.value = 'error';
      updateMessage.value = `重连失败: ${error.message}`;
      addUpdateDetail('error', `重连失败: ${error.message}`);
    }
  };

  /**
   * 清除更新状态
   */
  const clearStatus = () => {
    updateStatus.value = 'idle';
    updateMessage.value = '';
    updateProgress.value = null;
    hasUpdates.value = false;
  };

  /**
   * 清除更新详情
   */
  const clearDetails = () => {
    updateDetails.value = [];
  };

  /**
   * 获取状态信息
   */
  const getStatus = () => {
    return {
      isConnected: isConnected.value,
      connectionStatus: connectionStatus.value,
      updateStatus: updateStatus.value,
      updateMessage: updateMessage.value,
      updateProgress: updateProgress.value,
      lastUpdateTime: lastUpdateTime.value,
      hasUpdates: hasUpdates.value,
      detailsCount: updateDetails.value.length,
      callbacksCount: callbacks.size,
      isInitialized: isInitialized.value
    };
  };

  // 生命周期钩子
  onMounted(() => {
    initialize();
  });

  onUnmounted(() => {
    // 清理资源
    if (componentName) {
      if (enableWebSocket) {
        realtimeUpdateManager.unsubscribeFromComponent(componentName, handleComponentUpdate);
      }
      if (enableAutoUpdate) {
        autoUpdateService.stopWatching(componentName);
      }
    } else if (enableWebSocket) {
      realtimeUpdateManager.unsubscribeFromGlobal(handleGlobalUpdate);
    }

    callbacks.clear();
  });

  // 监听组件名变化
  watch(() => componentName, (newName, oldName) => {
    if (oldName && enableWebSocket) {
      realtimeUpdateManager.unsubscribeFromComponent(oldName, handleComponentUpdate);
    }
    if (oldName && enableAutoUpdate) {
      autoUpdateService.stopWatching(oldName);
    }

    if (newName) {
      if (enableWebSocket) {
        subscribeToComponent(newName);
      }
      if (enableAutoUpdate) {
        autoUpdateService.startWatching(newName);
      }
    }
  });

  return {
    // 状态
    isConnected,
    connectionStatus,
    updateStatus,
    updateMessage,
    updateProgress,
    updateDetails,
    lastUpdateTime,
    hasUpdates,
    isInitialized,

    // 方法
    initialize,
    refresh,
    retry,
    clearStatus,
    clearDetails,
    addUpdateCallback,
    removeUpdateCallback,
    getStatus
  };
}