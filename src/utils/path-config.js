import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 统一的路径配置工具
 * 解决MCP环境中process.cwd()返回根目录的问题
 */

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取MCP工具的根目录路径
 * @param {string} customPath - 自定义路径（可选）
 * @returns {string} MCP工具根目录的绝对路径
 */
export function getMCPToolsPath(customPath = null) {
  if (customPath) {
    return path.resolve(customPath);
  }
  
  // 从当前文件位置推导出MCP工具根目录
  // 当前文件在 src/utils/，所以需要向上两级
  const mcpToolsPath = path.resolve(__dirname, '../../');
  
  // 备用路径（如果推导失败）
  const fallbackPath = '/Users/yujie_wu/Documents/work/camscanner-cloud-vue3/figma-restoration-mcp-vue-tools';
  
  return mcpToolsPath || fallbackPath;
}

/**
 * 获取组件目录路径
 * @param {string} componentName - 组件名称
 * @param {string} customPath - 自定义MCP工具路径（可选）
 * @returns {string} 组件目录的绝对路径
 */
export function getComponentPath(componentName, customPath = null) {
  const mcpToolsPath = getMCPToolsPath(customPath);
  return path.join(mcpToolsPath, 'src/components', componentName);
}

/**
 * 获取结果目录路径
 * @param {string} componentName - 组件名称
 * @param {string} customPath - 自定义项目路径（可选）
 * @returns {string} 结果目录的绝对路径（现在指向组件目录）
 */
export function getResultsPath(componentName, customPath = null) {
  // 修改：现在返回组件目录，而不是单独的results目录
  if (customPath) {
    // 如果指定了自定义项目路径，则使用该项目的组件目录
    return path.join(customPath, 'src', 'components', componentName);
  }
  
  // 默认使用当前项目的组件目录
  // 假设当前工具在项目的子目录中，需要找到主项目的组件目录
  const mcpToolsPath = getMCPToolsPath(customPath);
  const projectRoot = path.resolve(mcpToolsPath, '..');
  return path.join(projectRoot, 'src', 'components', componentName);
}

/**
 * 获取输出目录路径
 * @param {string} componentName - 组件名称
 * @param {string} customPath - 自定义MCP工具路径（可选）
 * @returns {string} 输出目录的绝对路径
 */
export function getOutputPath(componentName, customPath = null) {
  const mcpToolsPath = getMCPToolsPath(customPath);
  return path.join(mcpToolsPath, 'output', componentName);
}

/**
 * 获取资源目录路径
 * @param {string} customPath - 自定义MCP工具路径（可选）
 * @returns {string} 资源目录的绝对路径
 */
export function getAssetsPath(customPath = null) {
  const mcpToolsPath = getMCPToolsPath(customPath);
  return path.join(mcpToolsPath, 'assets');
}

/**
 * 获取组件图片目录路径
 * @param {string} componentName - 组件名称
 * @param {string} customPath - 自定义MCP工具路径（可选）
 * @returns {string} 组件图片目录的绝对路径
 */
export function getComponentImagesPath(componentName, customPath = null) {
  const componentPath = getComponentPath(componentName, customPath);
  return path.join(componentPath, 'images');
}

/**
 * 获取组件的预期图片路径（Figma原图）
 * @param {string} componentName - 组件名称
 * @param {string} customPath - 自定义项目路径（可选）
 * @returns {string} 预期图片的绝对路径
 */
export function getComponentExpectedImagePath(componentName, customPath = null) {
  const componentPath = getResultsPath(componentName, customPath);
  return path.join(componentPath, 'expected.png');
}

/**
 * 获取组件的实际截图路径
 * @param {string} componentName - 组件名称
 * @param {string} customPath - 自定义项目路径（可选）
 * @returns {string} 实际截图的绝对路径
 */
export function getComponentActualImagePath(componentName, customPath = null) {
  const componentPath = getResultsPath(componentName, customPath);
  return path.join(componentPath, 'actual.png');
}

/**
 * 获取组件的差异图片路径
 * @param {string} componentName - 组件名称
 * @param {string} customPath - 自定义项目路径（可选）
 * @returns {string} 差异图片的绝对路径
 */
export function getComponentDiffImagePath(componentName, customPath = null) {
  const componentPath = getResultsPath(componentName, customPath);
  return path.join(componentPath, 'diff.png');
}

/**
 * 获取Vue开发服务器的URL
 * @param {number} port - 端口号（默认83）
 * @param {string} componentName - 组件名称（可选）
 * @returns {string} Vue开发服务器的URL
 */
export function getVueServerUrl(port = 83, componentName = null) {
  const baseUrl = `http://localhost:${port}`;
  return componentName ? `${baseUrl}/component/${componentName}` : baseUrl;
}

/**
 * 验证路径是否存在
 * @param {string} targetPath - 要验证的路径
 * @returns {Promise<boolean>} 路径是否存在
 */
export async function pathExists(targetPath) {
  try {
    const fs = await import('fs/promises');
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 创建目录（如果不存在）
 * @param {string} targetPath - 要创建的目录路径
 * @returns {Promise<boolean>} 是否成功创建
 */
export async function ensureDirectory(targetPath) {
  try {
    const fs = await import('fs/promises');
    await fs.mkdir(targetPath, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Failed to create directory: ${targetPath}`, error);
    return false;
  }
}

/**
 * 获取默认的MCP工具配置
 * @returns {object} 默认配置对象
 */
export function getDefaultConfig() {
  return {
    mcpToolsPath: getMCPToolsPath(),
    vueServerPort: 83,
    defaultViewport: { width: 1152, height: 772 },
    defaultScreenshotOptions: { 
      omitBackground: true, 
      deviceScaleFactor: 2 
    },
    defaultWaitOptions: { 
      waitUntil: 'networkidle2', 
      timeout: 15000, 
      additionalWait: 1000 
    }
  };
}
