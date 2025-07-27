/**
 * WebSocket 服务 - 支持页面的实时数据更新
 */
export class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = this.getWebSocketUrl();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.listeners = new Map();
    this.isConnecting = false;
    this.isManualClose = false;
  }

  /**
   * 获取 WebSocket URL
   * @returns {string} WebSocket URL
   */
  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }

  /**
   * 连接 WebSocket
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });

          if (!this.isManualClose && this.shouldReconnect(event.code)) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

        // 连接超时处理
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  /**
   * 发送消息
   * @param {Object} message - 消息对象
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket is not connected, message not sent:', message);
    }
  }

  /**
   * 处理接收到的消息
   * @param {MessageEvent} event - 消息事件
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      // 处理心跳响应
      if (message.type === 'pong') {
        this.handlePong();
        return;
      }

      // 触发相应的事件监听器
      this.emit(message.type, message.data);
      
      // 触发通用消息监听器
      this.emit('message', message);
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * 开始心跳检测
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
        
        // 设置心跳超时
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('Heartbeat timeout, closing connection');
          this.ws?.close();
        }, 5000);
      }
    }, 30000); // 每30秒发送一次心跳
  }

  /**
   * 停止心跳检测
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * 处理心跳响应
   */
  handlePong() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * 判断是否应该重连
   * @param {number} code - 关闭代码
   * @returns {boolean} 是否应该重连
   */
  shouldReconnect(code) {
    // 正常关闭或服务器关闭不重连
    if (code === 1000 || code === 1001) {
      return false;
    }
    
    return this.reconnectAttempts < this.maxReconnectAttempts;
  }

  /**
   * 安排重连
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isManualClose) {
        this.emit('reconnecting', { attempt: this.reconnectAttempts });
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 获取连接状态
   * @returns {string} 连接状态
   */
  getConnectionState() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  /**
   * 获取服务状态
   * @returns {Object} 服务状态
   */
  getStatus() {
    return {
      connectionState: this.getConnectionState(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      isConnecting: this.isConnecting,
      isManualClose: this.isManualClose,
      listenerCount: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      url: this.url
    };
  }

  /**
   * 订阅组件更新
   * @param {string} componentName - 组件名称
   */
  subscribeToComponent(componentName) {
    this.send({
      type: 'subscribe',
      data: {
        target: 'component',
        componentName
      }
    });
  }

  /**
   * 取消订阅组件更新
   * @param {string} componentName - 组件名称
   */
  unsubscribeFromComponent(componentName) {
    this.send({
      type: 'unsubscribe',
      data: {
        target: 'component',
        componentName
      }
    });
  }

  /**
   * 订阅全局更新
   */
  subscribeToGlobal() {
    this.send({
      type: 'subscribe',
      data: {
        target: 'global'
      }
    });
  }

  /**
   * 取消订阅全局更新
   */
  unsubscribeFromGlobal() {
    this.send({
      type: 'unsubscribe',
      data: {
        target: 'global'
      }
    });
  }
}

/**
 * 实时更新管理器 - 管理页面的实时数据同步
 */
export class RealtimeUpdateManager {
  constructor() {
    this.wsService = new WebSocketService();
    this.updateCallbacks = new Map();
    this.subscribedComponents = new Set();
    this.isGlobalSubscribed = false;
    this.lastUpdateTimes = new Map();
    this.updateQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * 初始化实时更新
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.wsService.connect();
      this.setupEventListeners();
      console.log('Realtime update manager initialized');
    } catch (error) {
      console.error('Failed to initialize realtime update manager:', error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 连接状态事件
    this.wsService.on('connected', () => {
      console.log('WebSocket connected, resubscribing...');
      this.resubscribe();
    });

    this.wsService.on('disconnected', () => {
      console.log('WebSocket disconnected');
    });

    // 组件更新事件
    this.wsService.on('component_updated', (data) => {
      this.handleComponentUpdate(data);
    });

    // 全局更新事件
    this.wsService.on('global_update', (data) => {
      this.handleGlobalUpdate(data);
    });

    // 批量更新事件
    this.wsService.on('batch_update', (data) => {
      this.handleBatchUpdate(data);
    });
  }

  /**
   * 重新订阅
   */
  resubscribe() {
    // 重新订阅组件
    this.subscribedComponents.forEach(componentName => {
      this.wsService.subscribeToComponent(componentName);
    });

    // 重新订阅全局更新
    if (this.isGlobalSubscribed) {
      this.wsService.subscribeToGlobal();
    }
  }

  /**
   * 订阅组件更新
   * @param {string} componentName - 组件名称
   * @param {Function} callback - 更新回调
   */
  subscribeToComponent(componentName, callback) {
    // 添加回调
    if (!this.updateCallbacks.has(componentName)) {
      this.updateCallbacks.set(componentName, new Set());
    }
    this.updateCallbacks.get(componentName).add(callback);

    // 订阅 WebSocket 更新
    if (!this.subscribedComponents.has(componentName)) {
      this.subscribedComponents.add(componentName);
      this.wsService.subscribeToComponent(componentName);
    }
  }

  /**
   * 取消订阅组件更新
   * @param {string} componentName - 组件名称
   * @param {Function} callback - 更新回调
   */
  unsubscribeFromComponent(componentName, callback) {
    const callbacks = this.updateCallbacks.get(componentName);
    if (callbacks) {
      callbacks.delete(callback);
      
      // 如果没有回调了，取消 WebSocket 订阅
      if (callbacks.size === 0) {
        this.updateCallbacks.delete(componentName);
        this.subscribedComponents.delete(componentName);
        this.wsService.unsubscribeFromComponent(componentName);
      }
    }
  }

  /**
   * 订阅全局更新
   * @param {Function} callback - 更新回调
   */
  subscribeToGlobal(callback) {
    if (!this.updateCallbacks.has('global')) {
      this.updateCallbacks.set('global', new Set());
    }
    this.updateCallbacks.get('global').add(callback);

    if (!this.isGlobalSubscribed) {
      this.isGlobalSubscribed = true;
      this.wsService.subscribeToGlobal();
    }
  }

  /**
   * 取消订阅全局更新
   * @param {Function} callback - 更新回调
   */
  unsubscribeFromGlobal(callback) {
    const callbacks = this.updateCallbacks.get('global');
    if (callbacks) {
      callbacks.delete(callback);
      
      if (callbacks.size === 0) {
        this.updateCallbacks.delete('global');
        this.isGlobalSubscribed = false;
        this.wsService.unsubscribeFromGlobal();
      }
    }
  }

  /**
   * 处理组件更新
   * @param {Object} data - 更新数据
   */
  handleComponentUpdate(data) {
    const { componentName, updateType, timestamp } = data;
    
    // 检查是否是重复更新
    const lastUpdate = this.lastUpdateTimes.get(componentName);
    if (lastUpdate && new Date(timestamp) <= lastUpdate) {
      return; // 忽略旧的或重复的更新
    }
    
    this.lastUpdateTimes.set(componentName, new Date(timestamp));
    
    // 添加到更新队列
    this.addToUpdateQueue({
      type: 'component',
      componentName,
      updateType,
      data,
      timestamp: new Date(timestamp)
    });
  }

  /**
   * 处理全局更新
   * @param {Object} data - 更新数据
   */
  handleGlobalUpdate(data) {
    this.addToUpdateQueue({
      type: 'global',
      data,
      timestamp: new Date()
    });
  }

  /**
   * 处理批量更新
   * @param {Object} data - 批量更新数据
   */
  handleBatchUpdate(data) {
    const { updates } = data;
    
    updates.forEach(update => {
      if (update.componentName) {
        this.handleComponentUpdate(update);
      } else {
        this.handleGlobalUpdate(update);
      }
    });
  }

  /**
   * 添加到更新队列
   * @param {Object} updateItem - 更新项
   */
  addToUpdateQueue(updateItem) {
    this.updateQueue.push(updateItem);
    this.processUpdateQueue();
  }

  /**
   * 处理更新队列
   */
  async processUpdateQueue() {
    if (this.isProcessingQueue || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.updateQueue.length > 0) {
        const updateItem = this.updateQueue.shift();
        await this.processUpdateItem(updateItem);
      }
    } catch (error) {
      console.error('Error processing update queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * 处理单个更新项
   * @param {Object} updateItem - 更新项
   */
  async processUpdateItem(updateItem) {
    const { type, componentName, data } = updateItem;
    
    try {
      if (type === 'component' && componentName) {
        // 通知组件更新回调
        const callbacks = this.updateCallbacks.get(componentName);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error(`Error in component update callback for ${componentName}:`, error);
            }
          });
        }
      } else if (type === 'global') {
        // 通知全局更新回调
        const callbacks = this.updateCallbacks.get('global');
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error('Error in global update callback:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing update item:', error);
    }
  }

  /**
   * 获取管理器状态
   * @returns {Object} 管理器状态
   */
  getStatus() {
    return {
      wsStatus: this.wsService.getStatus(),
      subscribedComponents: Array.from(this.subscribedComponents),
      isGlobalSubscribed: this.isGlobalSubscribed,
      callbackCount: Array.from(this.updateCallbacks.values()).reduce((sum, set) => sum + set.size, 0),
      queueLength: this.updateQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      lastUpdateTimes: Object.fromEntries(this.lastUpdateTimes)
    };
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.wsService.disconnect();
    this.updateCallbacks.clear();
    this.subscribedComponents.clear();
    this.updateQueue = [];
    this.lastUpdateTimes.clear();
    this.isGlobalSubscribed = false;
    console.log('Realtime update manager destroyed');
  }
}

// 创建单例实例
export const webSocketService = new WebSocketService();
export const realtimeUpdateManager = new RealtimeUpdateManager();