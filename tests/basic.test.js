/**
 * 基本功能测试
 */

describe('Basic functionality', () => {
  test('should be able to run tests', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have Node.js version >= 18', () => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(18);
  });

  test('should be in test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});