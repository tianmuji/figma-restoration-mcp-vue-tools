/**
 * 错误处理服务
 * Error Handling Service
 * 
 * 统一处理组件预览系统中的各种错误
 * 提供错误恢复机制和用户友好的错误信息
 */

export class ErrorHandlingService {
  constructor() {
    this.errorHistory = [];
    this.errorListeners = new Set();
    this.maxHistorySize = 50;
    this.setupGlobalErrorHandling();
  }

  /**
   * 错误类型定义
   */
  static ErrorTypes = {
    COMPONENT_NOT_FOUND: 'component-not-found',
    COMPONENT_LOAD_ERROR: 'component-load-error',
    COMPONENT_RENDER_ERROR: 'component-render-error',
    NETWORK_ERROR: 'network-error',
    JAVASCRIPT_ERROR: 'javascript-error',
    PROMISE_REJECTION: 'promise-rejection',
    INITIALIZATION_ERROR: 'initialization-error',
    SCREENSHOT_ERROR: 'screenshot-error',
    URL_PARAMETER_ERROR: 'url-parameter-error'
  };

  /**
   * 错误严重程度
   */
  static ErrorSeverity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  /**
   * 处理错误
   */
  handleError(error, context = {}) {
    const errorInfo = this.createErrorInfo(error, context);
    
    // 添加到历史记录
    this.addToHistory(errorInfo);
    
    // 记录错误
    this.logError(errorInfo);
    
    // 通知监听器
    this.notifyListeners(errorInfo);
    
    // 尝试恢复
    this.attemptRecovery(errorInfo);
    
    return errorInfo;
  }

  /**
   * 创建错误信息对象
   */
  createErrorInfo(error, context) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack,
      type: this.determineErrorType(error, context),
      severity: this.determineSeverity(error, context),
      context: {
        component: context.component || null,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      },
      recovered: false,
      recoveryAttempts: 0
    };

    return errorInfo;
  }

  /**
   * 确定错误类型
   */
  determineErrorType(error, context) {
    const message = error.message || String(error);
    
    if (message.includes('not found') || message.includes('未找到')) {
      return ErrorHandlingService.ErrorTypes.COMPONENT_NOT_FOUND;
    }
    
    if (message.includes('Failed to fetch') || message.includes('网络')) {
      return ErrorHandlingService.ErrorTypes.NETWORK_ERROR;
    }
    
    if (context.type) {
      return context.type;
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorHandlingService.ErrorTypes.JAVASCRIPT_ERROR;
    }
    
    return ErrorHandlingService.ErrorTypes.COMPONENT_LOAD_ERROR;
  }

  /**
   * 确定错误严重程度
   */
  determineSeverity(error, context) {
    const type = this.determineErrorType(error, context);
    
    switch (type) {
      case ErrorHandlingService.ErrorTypes.COMPONENT_NOT_FOUND:
        return ErrorHandlingService.ErrorSeverity.MEDIUM;
      
      case ErrorHandlingService.ErrorTypes.NETWORK_ERROR:
        return ErrorHandlingService.ErrorSeverity.HIGH;
      
      case ErrorHandlingService.ErrorTypes.INITIALIZATION_ERROR:
        return ErrorHandlingService.ErrorSeverity.CRITICAL;
      
      case ErrorHandlingService.ErrorTypes.JAVASCRIPT_ERROR:
        return ErrorHandlingService.ErrorSeverity.HIGH;
      
      default:
        return ErrorHandlingService.ErrorSeverity.MEDIUM;
    }
  }

  /**
   * 尝试错误恢复
   */
  async attemptRecovery(errorInfo) {
    const { type, context } = errorInfo;
    let recovered = false;

    try {
      switch (type) {
        case ErrorHandlingService.ErrorTypes.COMPONENT_NOT_FOUND:
          recovered = await this.recoverComponentNotFound(errorInfo);
          break;
        
        case ErrorHandlingService.ErrorTypes.COMPONENT_LOAD_ERROR:
          recovered = await this.recoverComponentLoadError(errorInfo);
          break;
        
        case ErrorHandlingService.ErrorTypes.NETWORK_ERROR:
          recovered = await this.recoverNetworkError(errorInfo);
          break;
        
        case ErrorHandlingService.ErrorTypes.COMPONENT_RENDER_ERROR:
          recovered = await this.recoverRenderError(errorInfo);
          break;
        
        default:
          console.log(`⚠️ 暂无针对 ${type} 类型错误的恢复机制`);
      }
      
      if (recovered) {
        errorInfo.recovered = true;
        console.log(`✅ 错误恢复成功: ${errorInfo.id}`);
        
        // 通知恢复成功
        this.notifyRecovery(errorInfo);
      }
      
    } catch (recoveryError) {
      console.error(`❌ 错误恢复失败: ${errorInfo.id}`, recoveryError);
    }
    
    errorInfo.recoveryAttempts++;
    return recovered;
  }

  /**
   * 恢复组件未找到错误
   */
  async recoverComponentNotFound(errorInfo) {
    const { context } = errorInfo;
    
    if (context.component) {
      console.log(`🔄 尝试重新扫描组件: ${context.component}`);
      
      try {
        // 动态导入组件发现服务
        const { componentDiscoveryService } = await import('./ComponentDiscoveryService.js');
        
        // 重新扫描组件
        await componentDiscoveryService.scanComponents();
        
        // 检查组件是否现在可用
        const componentInfo = componentDiscoveryService.getComponentInfo(context.component);
        if (componentInfo) {
          console.log(`✅ 组件重新扫描成功: ${context.component}`);
          return true;
        }
      } catch (error) {
        console.error(`❌ 组件重新扫描失败: ${context.component}`, error);
      }
    }
    
    return false;
  }

  /**
   * 恢复组件加载错误
   */
  async recoverComponentLoadError(errorInfo) {
    const { context } = errorInfo;
    
    // 尝试清除模块缓存并重新加载
    if (context.component) {
      console.log(`🔄 尝试重新加载组件: ${context.component}`);
      
      try {
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { componentDiscoveryService } = await import('./ComponentDiscoveryService.js');
        const component = await componentDiscoveryService.loadComponent(context.component);
        
        if (component) {
          console.log(`✅ 组件重新加载成功: ${context.component}`);
          return true;
        }
      } catch (error) {
        console.error(`❌ 组件重新加载失败: ${context.component}`, error);
      }
    }
    
    return false;
  }

  /**
   * 恢复网络错误
   */
  async recoverNetworkError(errorInfo) {
    console.log('🔄 尝试恢复网络连接...');
    
    try {
      // 简单的网络连接测试
      const response = await fetch(window.location.origin, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        console.log('✅ 网络连接已恢复');
        return true;
      }
    } catch (error) {
      console.error('❌ 网络连接仍然存在问题', error);
    }
    
    return false;
  }

  /**
   * 恢复渲染错误
   */
  async recoverRenderError(errorInfo) {
    const { context } = errorInfo;
    
    console.log(`🔄 尝试恢复渲染错误: ${context.component}`);
    
    try {
      // 清理可能的DOM状态
      const targetElement = document.getElementById('screenshot-target');
      if (targetElement) {
        targetElement.innerHTML = '';
      }
      
      // 等待DOM清理完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ DOM状态已清理，可以重新尝试渲染');
      return true;
      
    } catch (error) {
      console.error('❌ DOM清理失败', error);
    }
    
    return false;
  }

  /**
   * 生成错误ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录错误
   */
  logError(errorInfo) {
    const { severity, type, message, context } = errorInfo;
    
    const logMethod = severity === ErrorHandlingService.ErrorSeverity.CRITICAL ? 'error' : 
                     severity === ErrorHandlingService.ErrorSeverity.HIGH ? 'error' :
                     severity === ErrorHandlingService.ErrorSeverity.MEDIUM ? 'warn' : 'log';
    
    console[logMethod](`🚨 [${severity.toUpperCase()}] ${type}:`, {
      message,
      context,
      id: errorInfo.id,
      timestamp: errorInfo.timestamp
    });
  }

  /**
   * 添加到历史记录
   */
  addToHistory(errorInfo) {
    this.errorHistory.unshift(errorInfo);
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory() {
    return [...this.errorHistory];
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory() {
    this.errorHistory = [];
  }

  /**
   * 添加错误监听器
   */
  addErrorListener(callback) {
    this.errorListeners.add(callback);
    
    return () => {
      this.errorListeners.delete(callback);
    };
  }

  /**
   * 通知错误监听器
   */
  notifyListeners(errorInfo) {
    this.errorListeners.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (error) {
        console.error('🚨 错误监听器执行失败:', error);
      }
    });
  }

  /**
   * 通知恢复成功
   */
  notifyRecovery(errorInfo) {
    // 发送自定义事件
    window.dispatchEvent(new CustomEvent('error-recovered', {
      detail: errorInfo
    }));
  }

  /**
   * 设置全局错误处理
   */
  setupGlobalErrorHandling() {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        type: ErrorHandlingService.ErrorTypes.JAVASCRIPT_ERROR,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: ErrorHandlingService.ErrorTypes.PROMISE_REJECTION
      });
    });
    
    console.log('🛡️ 全局错误处理已设置');
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(errorInfo) {
    const { type, context } = errorInfo;
    
    switch (type) {
      case ErrorHandlingService.ErrorTypes.COMPONENT_NOT_FOUND:
        return `组件 "${context.component}" 未找到，请检查组件是否存在于 src/components 目录中`;
      
      case ErrorHandlingService.ErrorTypes.COMPONENT_LOAD_ERROR:
        return `组件 "${context.component}" 加载失败，可能存在语法错误或依赖问题`;
      
      case ErrorHandlingService.ErrorTypes.NETWORK_ERROR:
        return '网络连接出现问题，请检查网络连接后重试';
      
      case ErrorHandlingService.ErrorTypes.COMPONENT_RENDER_ERROR:
        return `组件 "${context.component}" 渲染失败，请检查组件代码`;
      
      default:
        return '发生了未知错误，请刷新页面重试';
    }
  }

  /**
   * 获取恢复建议
   */
  getRecoverySuggestions(errorInfo) {
    const { type, context } = errorInfo;
    
    switch (type) {
      case ErrorHandlingService.ErrorTypes.COMPONENT_NOT_FOUND:
        return [
          '检查组件名称是否正确',
          '确认组件文件存在于 src/components 目录',
          '检查组件文件名是否为 index.vue',
          '尝试刷新页面重新扫描组件'
        ];
      
      case ErrorHandlingService.ErrorTypes.COMPONENT_LOAD_ERROR:
        return [
          '检查组件语法是否正确',
          '确认所有依赖都已正确导入',
          '查看浏览器控制台的详细错误信息',
          '尝试重新启动开发服务器'
        ];
      
      case ErrorHandlingService.ErrorTypes.NETWORK_ERROR:
        return [
          '检查网络连接',
          '确认开发服务器正在运行',
          '尝试刷新页面',
          '检查防火墙设置'
        ];
      
      default:
        return [
          '刷新页面重试',
          '检查浏览器控制台错误信息',
          '重新启动开发服务器'
        ];
    }
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    return {
      errorCount: this.errorHistory.length,
      recentErrors: this.errorHistory.slice(0, 5),
      listenerCount: this.errorListeners.size,
      timestamp: new Date().toISOString()
    };
  }
}

// 创建单例实例
export const errorHandlingService = new ErrorHandlingService();

// 开发环境下的调试功能
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  window.errorHandlingService = errorHandlingService;
  console.log('🔧 ErrorHandlingService 已挂载到 window.errorHandlingService');
}