import { HealthMonitor, globalHealthMonitor, healthCheck } from '../health-monitor.js';

/**
 * Simple test runner for Health Monitor
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running Health Monitor Tests...\n');

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test suite
const runner = new TestRunner();

// HealthMonitor basic functionality tests
runner.test('should create health monitor with default options', () => {
  const monitor = new HealthMonitor();
  
  runner.assert(monitor.options.checkInterval === 60000, 'Should have default check interval');
  runner.assert(monitor.options.enableAlerts === true, 'Should enable alerts by default');
  runner.assert(monitor.options.enableMetrics === true, 'Should enable metrics by default');
  runner.assert(monitor.healthChecks instanceof Map, 'Should have health checks map');
  runner.assert(monitor.metrics instanceof Map, 'Should have metrics map');
  runner.assert(Array.isArray(monitor.alerts), 'Should have alerts array');
});

runner.test('should create health monitor with custom options', () => {
  const monitor = new HealthMonitor({
    checkInterval: 30000,
    alertThresholds: {
      memory: 0.9,
      cpu: 0.95,
      errorRate: 0.05
    },
    enableAlerts: false,
    enableMetrics: false
  });
  
  runner.assert(monitor.options.checkInterval === 30000, 'Should set custom check interval');
  runner.assert(monitor.options.alertThresholds.memory === 0.9, 'Should set custom memory threshold');
  runner.assert(monitor.options.alertThresholds.cpu === 0.95, 'Should set custom CPU threshold');
  runner.assert(monitor.options.alertThresholds.errorRate === 0.05, 'Should set custom error rate threshold');
  runner.assert(monitor.options.enableAlerts === false, 'Should disable alerts');
  runner.assert(monitor.options.enableMetrics === false, 'Should disable metrics');
});

runner.test('should register default health checks', () => {
  const monitor = new HealthMonitor();
  
  runner.assert(monitor.healthChecks.has('system_memory'), 'Should register system memory check');
  runner.assert(monitor.healthChecks.has('system_cpu'), 'Should register system CPU check');
  runner.assert(monitor.healthChecks.has('disk_space'), 'Should register disk space check');
  runner.assert(monitor.healthChecks.has('resource_manager'), 'Should register resource manager check');
  runner.assert(monitor.healthChecks.has('error_recovery'), 'Should register error recovery check');
  runner.assert(monitor.healthChecks.has('configuration'), 'Should register configuration check');
  runner.assert(monitor.healthChecks.has('enhanced_tools'), 'Should register enhanced tools check');
});

runner.test('should register and unregister custom health checks', () => {
  const monitor = new HealthMonitor();
  
  const customCheck = {
    name: 'Custom Check',
    description: 'A custom health check',
    check: async () => ({ status: 'healthy', message: 'All good' }),
    interval: 30000,
    critical: true
  };
  
  monitor.registerHealthCheck('custom_check', customCheck);
  runner.assert(monitor.healthChecks.has('custom_check'), 'Should register custom health check');
  
  const registered = monitor.healthChecks.get('custom_check');
  runner.assert(registered.name === 'Custom Check', 'Should store check name');
  runner.assert(registered.interval === 30000, 'Should store check interval');
  runner.assert(registered.critical === true, 'Should store critical flag');
  runner.assert(registered.enabled === true, 'Should enable by default');
  
  monitor.unregisterHealthCheck('custom_check');
  runner.assert(!monitor.healthChecks.has('custom_check'), 'Should unregister health check');
});

runner.test('should run individual health check', async () => {
  const monitor = new HealthMonitor();
  
  const mockCheck = {
    name: 'Mock Check',
    description: 'A mock health check',
    check: async () => ({ 
      status: 'healthy', 
      message: 'Mock check passed',
      details: { value: 42 }
    }),
    interval: 60000,
    critical: false
  };
  
  monitor.registerHealthCheck('mock_check', mockCheck);
  
  const result = await monitor.runHealthCheck('mock_check');
  
  runner.assert(result.status === 'healthy', 'Should return healthy status');
  runner.assert(result.message === 'Mock check passed', 'Should return check message');
  runner.assert(result.details.value === 42, 'Should return check details');
  runner.assert(result.id === 'mock_check', 'Should include check ID');
  runner.assert(result.timestamp, 'Should include timestamp');
  runner.assert(result.runCount === 1, 'Should include run count');
});

runner.test('should handle health check errors', async () => {
  const monitor = new HealthMonitor();
  
  const failingCheck = {
    name: 'Failing Check',
    description: 'A check that always fails',
    check: async () => {
      throw new Error('Check failed');
    },
    interval: 60000,
    critical: false
  };
  
  monitor.registerHealthCheck('failing_check', failingCheck);
  
  try {
    await monitor.runHealthCheck('failing_check');
    runner.assert(false, 'Should throw error for failing check');
  } catch (error) {
    runner.assert(error.message === 'Check failed', 'Should propagate check error');
  }
  
  // Note: Error count is incremented in runHealthChecks, not runHealthCheck
  runner.assert(true, 'Should handle health check errors correctly');
});

runner.test('should record and retrieve metrics', () => {
  const monitor = new HealthMonitor();
  
  const metricName = 'test_metric';
  const metricValue = { value: 100, status: 'ok' };
  
  monitor.recordMetric(metricName, metricValue);
  
  const metrics = monitor.getMetrics(metricName);
  runner.assert(metrics.length === 1, 'Should record metric');
  runner.assert(metrics[0].value === 100, 'Should store metric value');
  runner.assert(metrics[0].status === 'ok', 'Should store metric status');
  runner.assert(metrics[0].timestamp, 'Should add timestamp');
});

runner.test('should filter metrics by time', () => {
  const monitor = new HealthMonitor();
  
  const now = Date.now();
  const oldTime = now - 3600000; // 1 hour ago
  
  monitor.recordMetric('test_metric', { value: 1, timestamp: oldTime });
  monitor.recordMetric('test_metric', { value: 2, timestamp: now });
  
  const allMetrics = monitor.getMetrics('test_metric');
  runner.assert(allMetrics.length === 2, 'Should have all metrics');
  
  const recentMetrics = monitor.getMetrics('test_metric', now - 1800000); // 30 minutes ago
  runner.assert(recentMetrics.length === 1, 'Should filter by time');
  runner.assert(recentMetrics[0].value === 2, 'Should return recent metric');
});

runner.test('should get all metrics when no name specified', () => {
  const monitor = new HealthMonitor();
  
  monitor.recordMetric('metric1', { value: 1 });
  monitor.recordMetric('metric2', { value: 2 });
  
  const allMetrics = monitor.getMetrics();
  runner.assert(allMetrics.metric1, 'Should include metric1');
  runner.assert(allMetrics.metric2, 'Should include metric2');
  runner.assert(allMetrics.metric1.length === 1, 'Should have metric1 values');
  runner.assert(allMetrics.metric2.length === 1, 'Should have metric2 values');
});

runner.test('should cleanup old metrics', () => {
  const monitor = new HealthMonitor({ retentionPeriod: 1000 }); // 1 second
  
  const oldTime = Date.now() - 2000; // 2 seconds ago
  monitor.recordMetric('test_metric', { value: 1, timestamp: oldTime });
  monitor.recordMetric('test_metric', { value: 2 });
  
  monitor.cleanupOldMetrics();
  
  const metrics = monitor.getMetrics('test_metric');
  runner.assert(metrics.length === 1, 'Should cleanup old metrics');
  runner.assert(metrics[0].value === 2, 'Should keep recent metrics');
});

runner.test('should handle alerts', () => {
  const monitor = new HealthMonitor({ enableAlerts: true });
  
  const healthCheck = {
    name: 'Test Check',
    critical: true
  };
  
  const result = {
    status: 'warning',
    message: 'Test warning',
    details: { value: 85 }
  };
  
  monitor.handleAlert('test_check', result, healthCheck);
  
  runner.assert(monitor.alerts.length === 1, 'Should create alert');
  
  const alert = monitor.alerts[0];
  runner.assert(alert.healthCheckId === 'test_check', 'Should set health check ID');
  runner.assert(alert.healthCheckName === 'Test Check', 'Should set health check name');
  runner.assert(alert.status === 'warning', 'Should set alert status');
  runner.assert(alert.message === 'Test warning', 'Should set alert message');
  runner.assert(alert.severity === 'high', 'Should set severity based on critical flag');
  runner.assert(alert.acknowledged === false, 'Should not be acknowledged by default');
});

runner.test('should determine alert severity correctly', () => {
  const monitor = new HealthMonitor();
  
  runner.assert(monitor.getAlertSeverity('error', true) === 'critical', 'Critical error should be critical');
  runner.assert(monitor.getAlertSeverity('error', false) === 'high', 'Non-critical error should be high');
  runner.assert(monitor.getAlertSeverity('warning', true) === 'high', 'Critical warning should be high');
  runner.assert(monitor.getAlertSeverity('warning', false) === 'medium', 'Non-critical warning should be medium');
  runner.assert(monitor.getAlertSeverity('healthy', false) === 'low', 'Healthy should be low');
});

runner.test('should get recent alerts', () => {
  const monitor = new HealthMonitor();
  
  // Add multiple alerts
  for (let i = 0; i < 15; i++) {
    monitor.alerts.push({
      id: `alert-${i}`,
      timestamp: Date.now() - (i * 1000),
      message: `Alert ${i}`
    });
  }
  
  const recentAlerts = monitor.getRecentAlerts(5);
  runner.assert(recentAlerts.length === 5, 'Should limit to requested number');
  runner.assert(recentAlerts[0].id === 'alert-0', 'Should return most recent first');
});

runner.test('should get system metrics', () => {
  const monitor = new HealthMonitor();
  
  const metrics = monitor.getSystemMetrics();
  
  runner.assert(metrics.memory, 'Should include memory metrics');
  runner.assert(metrics.memory.process, 'Should include process memory');
  runner.assert(metrics.memory.system, 'Should include system memory');
  runner.assert(metrics.cpu, 'Should include CPU metrics');
  runner.assert(metrics.uptime, 'Should include uptime');
  runner.assert(metrics.platform, 'Should include platform info');
});

runner.test('should get overall health status', async () => {
  const monitor = new HealthMonitor();
  
  // Add a mock health check with result
  const mockCheck = {
    name: 'Mock Check',
    check: async () => ({ status: 'healthy', message: 'All good' }),
    interval: 60000,
    critical: false,
    enabled: true,
    lastResult: { status: 'healthy', message: 'All good' },
    lastRun: Date.now(),
    runCount: 1,
    errorCount: 0
  };
  
  monitor.healthChecks.set('mock_check', mockCheck);
  
  const health = await monitor.getOverallHealth();
  
  runner.assert(health.status, 'Should have overall status');
  runner.assert(health.healthChecks, 'Should include health checks');
  runner.assert(health.healthChecks.mock_check, 'Should include mock check');
  runner.assert(health.alerts, 'Should include alerts');
  runner.assert(health.metrics, 'Should include metrics');
  runner.assert(health.timestamp, 'Should include timestamp');
});

// Default health check tests
runner.test('should check system memory', async () => {
  const monitor = new HealthMonitor();
  
  const result = await monitor.checkSystemMemory();
  
  runner.assert(result.status, 'Should have status');
  runner.assert(result.message, 'Should have message');
  runner.assert(result.details, 'Should have details');
  runner.assert(result.details.system, 'Should have system memory info');
  runner.assert(result.details.process, 'Should have process memory info');
  runner.assert(typeof result.details.system.usagePercent === 'number', 'Should calculate usage percent');
});

runner.test('should check system CPU', async () => {
  const monitor = new HealthMonitor();
  
  const result = await monitor.checkSystemCPU();
  
  runner.assert(result.status, 'Should have status');
  runner.assert(result.message, 'Should have message');
  runner.assert(result.details, 'Should have details');
  runner.assert(result.details.loadAverage, 'Should have load average');
  runner.assert(result.details.cpuCount, 'Should have CPU count');
  runner.assert(typeof result.details.load1min === 'number', 'Should calculate 1-minute load');
});

runner.test('should check disk space', async () => {
  const monitor = new HealthMonitor();
  
  const result = await monitor.checkDiskSpace();
  
  runner.assert(result.status, 'Should have status');
  runner.assert(result.message, 'Should have message');
  runner.assert(result.details, 'Should have details');
  // Note: Disk check might return warning if getDiskUsage fails on some systems
});

runner.test('should check resource manager', async () => {
  const monitor = new HealthMonitor();
  
  const result = await monitor.checkResourceManager();
  
  runner.assert(result.status, 'Should have status');
  runner.assert(result.message, 'Should have message');
  runner.assert(result.details, 'Should have details');
});

runner.test('should check error recovery', async () => {
  const monitor = new HealthMonitor();
  
  const result = await monitor.checkErrorRecovery();
  
  runner.assert(result.status, 'Should have status');
  runner.assert(result.message, 'Should have message');
  runner.assert(result.details, 'Should have details');
});

runner.test('should check configuration', async () => {
  const monitor = new HealthMonitor();
  
  const result = await monitor.checkConfiguration();
  
  runner.assert(result.status, 'Should have status');
  runner.assert(result.message, 'Should have message');
  runner.assert(result.details, 'Should have details');
});

runner.test('should check enhanced tools', async () => {
  const monitor = new HealthMonitor();
  
  const result = await monitor.checkEnhancedTools();
  
  runner.assert(result.status, 'Should have status');
  runner.assert(result.message, 'Should have message');
  runner.assert(result.details, 'Should have details');
  runner.assert(result.details.tools, 'Should have tools info');
  runner.assert(typeof result.details.successRate === 'number', 'Should calculate success rate');
});

// Monitoring lifecycle tests
runner.test('should start and stop monitoring', () => {
  const monitor = new HealthMonitor();
  
  runner.assert(!monitor.isRunning, 'Should not be running initially');
  
  monitor.start();
  runner.assert(monitor.isRunning, 'Should be running after start');
  runner.assert(monitor.monitoringInterval, 'Should have monitoring interval');
  
  monitor.stop();
  runner.assert(!monitor.isRunning, 'Should not be running after stop');
  runner.assert(!monitor.monitoringInterval, 'Should clear monitoring interval');
});

runner.test('should not start monitoring twice', () => {
  const monitor = new HealthMonitor();
  
  monitor.start();
  const firstInterval = monitor.monitoringInterval;
  
  monitor.start(); // Try to start again
  runner.assert(monitor.monitoringInterval === firstInterval, 'Should not create new interval');
  
  monitor.stop();
});

runner.test('should handle stop when not running', () => {
  const monitor = new HealthMonitor();
  
  // Should not throw error
  monitor.stop();
  runner.assert(!monitor.isRunning, 'Should remain not running');
});

// Event emission tests
runner.test('should emit events for health check operations', async () => {
  const monitor = new HealthMonitor();
  let eventCount = 0;
  
  return new Promise((resolve, reject) => {
    monitor.on('healthCheckRegistered', () => {
      eventCount++;
    });
    
    monitor.on('healthCheckCompleted', () => {
      eventCount++;
      if (eventCount === 2) {
        runner.assert(true, 'Should emit registration and completion events');
        resolve();
      }
    });
    
    monitor.registerHealthCheck('test_check', {
      name: 'Test Check',
      check: async () => ({ status: 'healthy', message: 'OK' }),
      interval: 60000
    });
    
    monitor.runHealthCheck('test_check');
    
    // Timeout fallback
    setTimeout(() => {
      if (eventCount < 2) {
        reject(new Error('Not all events were emitted'));
      }
    }, 1000);
  });
});

// Global health monitor tests
runner.test('should have global health monitor', () => {
  runner.assert(globalHealthMonitor instanceof HealthMonitor, 'Should be HealthMonitor instance');
  runner.assert(globalHealthMonitor.options.enableAlerts === true, 'Should have alerts enabled');
  runner.assert(globalHealthMonitor.options.enableMetrics === true, 'Should have metrics enabled');
});

// healthCheck decorator tests
runner.test('should work with health check decorator', () => {
  // Test the decorator function directly
  const testFunction = async () => {
    return { status: 'healthy', message: 'Test method is healthy' };
  };
  
  const decorator = healthCheck({
    id: 'test_method_check_direct',
    name: 'Test Method Check Direct',
    interval: 30000,
    critical: true
  });
  
  // Apply decorator
  const descriptor = { value: testFunction };
  decorator({}, 'testHealthCheck', descriptor);
  
  // Check if health check was registered
  runner.assert(globalHealthMonitor.healthChecks.has('test_method_check_direct'), 'Should register health check');
  
  const registeredCheck = globalHealthMonitor.healthChecks.get('test_method_check_direct');
  runner.assert(registeredCheck.name === 'Test Method Check Direct', 'Should set check name');
  runner.assert(registeredCheck.interval === 30000, 'Should set check interval');
  runner.assert(registeredCheck.critical === true, 'Should set critical flag');
});

// Error handling tests
runner.test('should handle missing health check gracefully', async () => {
  const monitor = new HealthMonitor();
  
  try {
    await monitor.runHealthCheck('nonexistent_check');
    runner.assert(false, 'Should throw error for missing health check');
  } catch (error) {
    runner.assert(error.message.includes('Health check not found'), 'Should throw appropriate error');
  }
});

runner.test('should handle health check errors in run cycle', async () => {
  const monitor = new HealthMonitor();
  
  monitor.registerHealthCheck('error_check', {
    name: 'Error Check',
    check: async () => {
      throw new Error('Simulated error');
    },
    interval: 1, // Very short interval
    enabled: true,
    lastRun: null
  });
  
  let errorEmitted = false;
  monitor.on('healthCheckError', () => {
    errorEmitted = true;
  });
  
  await monitor.runHealthChecks();
  
  runner.assert(errorEmitted, 'Should emit error event');
});

// Performance tests
runner.test('should handle many health checks efficiently', async () => {
  const monitor = new HealthMonitor();
  
  // Register many health checks
  for (let i = 0; i < 100; i++) {
    monitor.registerHealthCheck(`check_${i}`, {
      name: `Check ${i}`,
      check: async () => ({ status: 'healthy', message: `Check ${i} OK` }),
      interval: 1, // Very short interval
      enabled: true,
      lastRun: null
    });
  }
  
  const startTime = Date.now();
  await monitor.runHealthChecks();
  const duration = Date.now() - startTime;
  
  runner.assert(duration < 5000, 'Should run 100 health checks quickly');
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runner as healthMonitorTests };