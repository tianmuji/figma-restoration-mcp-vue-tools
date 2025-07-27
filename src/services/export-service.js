/**
 * PDF 导出服务 - 将对比报告导出为 PDF 格式
 */
export class PDFExporter {
  constructor() {
    this.templates = new Map();
    this.defaultTemplate = 'standard';
    this.loadTemplates();
  }

  /**
   * 加载报告模板
   */
  loadTemplates() {
    // 标准模板
    this.templates.set('standard', {
      name: '标准报告',
      description: '包含完整对比信息的标准格式报告',
      layout: 'portrait',
      sections: ['header', 'summary', 'images', 'analysis', 'recommendations'],
      styles: {
        fontSize: 12,
        lineHeight: 1.6,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        colors: {
          primary: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          text: '#1f2937',
          muted: '#6b7280'
        }
      }
    });

    // 简洁模板
    this.templates.set('compact', {
      name: '简洁报告',
      description: '只包含关键信息的简洁格式报告',
      layout: 'portrait',
      sections: ['header', 'summary', 'images'],
      styles: {
        fontSize: 11,
        lineHeight: 1.4,
        margins: { top: 15, right: 15, bottom: 15, left: 15 },
        colors: {
          primary: '#374151',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
          text: '#111827',
          muted: '#4b5563'
        }
      }
    });

    // 详细模板
    this.templates.set('detailed', {
      name: '详细报告',
      description: '包含所有分析数据的详细格式报告',
      layout: 'portrait',
      sections: ['header', 'summary', 'images', 'analysis', 'regions', 'colors', 'recommendations', 'appendix'],
      styles: {
        fontSize: 10,
        lineHeight: 1.5,
        margins: { top: 25, right: 25, bottom: 25, left: 25 },
        colors: {
          primary: '#1e40af',
          success: '#047857',
          warning: '#92400e',
          error: '#991b1b',
          text: '#0f172a',
          muted: '#64748b'
        }
      }
    });
  }

  /**
   * 导出 PDF 报告
   * @param {Object} reportData - 报告数据
   * @param {Object} options - 导出选项
   * @returns {Promise<Blob>} PDF 文件 Blob
   */
  async exportToPDF(reportData, options = {}) {
    const {
      template = this.defaultTemplate,
      filename = null,
      includeImages = true,
      includeAnalysis = true,
      includeRecommendations = true
    } = options;

    try {
      // 获取模板配置
      const templateConfig = this.templates.get(template);
      if (!templateConfig) {
        throw new Error(`Unknown template: ${template}`);
      }

      // 生成 PDF 内容
      const pdfContent = await this.generatePDFContent(reportData, templateConfig, {
        includeImages,
        includeAnalysis,
        includeRecommendations
      });

      // 使用浏览器的打印功能生成 PDF（简化实现）
      const pdfBlob = await this.generatePDFBlob(pdfContent, templateConfig);

      // 如果提供了文件名，触发下载
      if (filename) {
        this.downloadPDF(pdfBlob, filename);
      }

      return pdfBlob;
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error(`PDF 导出失败: ${error.message}`);
    }
  }

  /**
   * 生成 PDF 内容
   * @param {Object} reportData - 报告数据
   * @param {Object} templateConfig - 模板配置
   * @param {Object} options - 选项
   * @returns {Promise<string>} HTML 内容
   */
  async generatePDFContent(reportData, templateConfig, options) {
    const { sections, styles } = templateConfig;
    const { includeImages, includeAnalysis, includeRecommendations } = options;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>组件还原度对比报告 - ${reportData.componentName}</title>
        <style>
          ${this.generatePDFStyles(styles)}
        </style>
      </head>
      <body>
    `;

    // 生成各个部分
    for (const section of sections) {
      switch (section) {
        case 'header':
          htmlContent += this.generateHeaderSection(reportData, styles);
          break;
        case 'summary':
          htmlContent += this.generateSummarySection(reportData, styles);
          break;
        case 'images':
          if (includeImages) {
            htmlContent += await this.generateImagesSection(reportData, styles);
          }
          break;
        case 'analysis':
          if (includeAnalysis) {
            htmlContent += this.generateAnalysisSection(reportData, styles);
          }
          break;
        case 'regions':
          if (includeAnalysis && reportData.analysis.regions) {
            htmlContent += this.generateRegionsSection(reportData, styles);
          }
          break;
        case 'colors':
          if (includeAnalysis && reportData.analysis.colorAnalysis) {
            htmlContent += this.generateColorsSection(reportData, styles);
          }
          break;
        case 'recommendations':
          if (includeRecommendations && reportData.recommendations) {
            htmlContent += this.generateRecommendationsSection(reportData, styles);
          }
          break;
        case 'appendix':
          htmlContent += this.generateAppendixSection(reportData, styles);
          break;
      }
    }

    htmlContent += `
        </body>
      </html>
    `;

    return htmlContent;
  }

  /**
   * 生成 PDF 样式
   * @param {Object} styles - 样式配置
   * @returns {string} CSS 样式
   */
  generatePDFStyles(styles) {
    return `
      @page {
        margin: ${styles.margins.top}mm ${styles.margins.right}mm ${styles.margins.bottom}mm ${styles.margins.left}mm;
        size: A4;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${styles.fontSize}px;
        line-height: ${styles.lineHeight};
        color: ${styles.colors.text};
        margin: 0;
        padding: 0;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid ${styles.colors.primary};
      }
      
      .header h1 {
        color: ${styles.colors.primary};
        font-size: 24px;
        margin: 0 0 10px 0;
      }
      
      .header .subtitle {
        color: ${styles.colors.muted};
        font-size: 14px;
      }
      
      .section {
        margin-bottom: 25px;
        page-break-inside: avoid;
      }
      
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: ${styles.colors.primary};
        margin: 0 0 15px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .summary-item {
        padding: 15px;
        background: #f9fafb;
        border-radius: 8px;
        border-left: 4px solid ${styles.colors.primary};
      }
      
      .summary-label {
        font-size: 12px;
        color: ${styles.colors.muted};
        margin-bottom: 5px;
      }
      
      .summary-value {
        font-size: 20px;
        font-weight: 700;
        color: ${styles.colors.text};
      }
      
      .status-excellent { color: ${styles.colors.success}; }
      .status-good { color: ${styles.colors.primary}; }
      .status-needs-improvement { color: ${styles.colors.warning}; }
      .status-poor { color: ${styles.colors.error}; }
      
      .images-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .image-panel {
        text-align: center;
      }
      
      .image-panel h4 {
        font-size: 14px;
        margin: 0 0 10px 0;
        color: ${styles.colors.text};
      }
      
      .image-panel img {
        max-width: 100%;
        height: auto;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
      }
      
      .analysis-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      .analysis-table th,
      .analysis-table td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .analysis-table th {
        background: #f9fafb;
        font-weight: 600;
        color: ${styles.colors.text};
      }
      
      .recommendation-item {
        margin-bottom: 15px;
        padding: 15px;
        background: #f9fafb;
        border-radius: 8px;
        border-left: 4px solid ${styles.colors.warning};
      }
      
      .recommendation-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: ${styles.colors.text};
      }
      
      .recommendation-description {
        color: ${styles.colors.muted};
        margin-bottom: 10px;
      }
      
      .recommendation-steps {
        font-size: 11px;
        color: ${styles.colors.muted};
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
    `;
  }

  /**
   * 生成头部部分
   * @param {Object} reportData - 报告数据
   * @param {Object} styles - 样式配置
   * @returns {string} HTML 内容
   */
  generateHeaderSection(reportData, styles) {
    const date = new Date(reportData.timestamp).toLocaleString('zh-CN');
    
    return `
      <div class="header">
        <h1>组件还原度对比报告</h1>
        <div class="subtitle">
          组件: ${reportData.componentName} | 生成时间: ${date}
        </div>
      </div>
    `;
  }

  /**
   * 生成摘要部分
   * @param {Object} reportData - 报告数据
   * @param {Object} styles - 样式配置
   * @returns {string} HTML 内容
   */
  generateSummarySection(reportData, styles) {
    const { summary } = reportData;
    const statusClass = this.getStatusClass(summary.matchPercentage);
    
    return `
      <div class="section">
        <h2 class="section-title">📊 对比摘要</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">还原度</div>
            <div class="summary-value ${statusClass}">${summary.matchPercentage.toFixed(1)}%</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">状态</div>
            <div class="summary-value ${statusClass}">${this.getStatusText(summary.status)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">差异像素</div>
            <div class="summary-value">${summary.diffPixels.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">总像素</div>
            <div class="summary-value">${summary.totalPixels.toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 生成图片部分
   * @param {Object} reportData - 报告数据
   * @param {Object} styles - 样式配置
   * @returns {Promise<string>} HTML 内容
   */
  async generateImagesSection(reportData, styles) {
    const { images } = reportData;
    
    // 将图片转换为 base64 以嵌入 PDF
    const expectedBase64 = await this.imageToBase64(images.expected);
    const actualBase64 = await this.imageToBase64(images.actual);
    const diffBase64 = await this.imageToBase64(images.diff);
    
    return `
      <div class="section page-break">
        <h2 class="section-title">🖼️ 图片对比</h2>
        <div class="images-grid">
          <div class="image-panel">
            <h4>原始设计 (Figma)</h4>
            <img src="${expectedBase64}" alt="原始设计" />
          </div>
          <div class="image-panel">
            <h4>实际截图</h4>
            <img src="${actualBase64}" alt="实际截图" />
          </div>
          <div class="image-panel">
            <h4>差异对比</h4>
            <img src="${diffBase64}" alt="差异对比" />
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 生成分析部分
   * @param {Object} reportData - 报告数据
   * @param {Object} styles - 样式配置
   * @returns {string} HTML 内容
   */
  generateAnalysisSection(reportData, styles) {
    const { analysis } = reportData;
    
    return `
      <div class="section">
        <h2 class="section-title">🔍 详细分析</h2>
        <table class="analysis-table">
          <tr>
            <th>指标</th>
            <th>数值</th>
            <th>说明</th>
          </tr>
          <tr>
            <td>匹配百分比</td>
            <td class="${this.getStatusClass(analysis.matchPercentage)}">${analysis.matchPercentage.toFixed(2)}%</td>
            <td>像素级匹配度</td>
          </tr>
          <tr>
            <td>差异像素数</td>
            <td>${analysis.diffPixels.toLocaleString()}</td>
            <td>不匹配的像素总数</td>
          </tr>
          <tr>
            <td>总像素数</td>
            <td>${analysis.totalPixels.toLocaleString()}</td>
            <td>图片总像素数</td>
          </tr>
          <tr>
            <td>差异区域数</td>
            <td>${analysis.regions?.length || 0}</td>
            <td>检测到的差异区域数量</td>
          </tr>
          <tr>
            <td>颜色差异数</td>
            <td>${analysis.colorAnalysis?.length || 0}</td>
            <td>检测到的颜色差异数量</td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * 生成建议部分
   * @param {Object} reportData - 报告数据
   * @param {Object} styles - 样式配置
   * @returns {string} HTML 内容
   */
  generateRecommendationsSection(reportData, styles) {
    const { recommendations } = reportData;
    let content = `
      <div class="section page-break">
        <h2 class="section-title">💡 优化建议</h2>
    `;

    // 立即修复建议
    if (recommendations.immediate && recommendations.immediate.length > 0) {
      content += '<h3>🚨 立即修复</h3>';
      recommendations.immediate.forEach(rec => {
        content += `
          <div class="recommendation-item no-break">
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-description">${rec.description}</div>
            ${rec.steps ? `<div class="recommendation-steps">修复步骤: ${rec.steps.join(', ')}</div>` : ''}
          </div>
        `;
      });
    }

    // 长期优化建议
    if (recommendations.longTerm && recommendations.longTerm.length > 0) {
      content += '<h3>🔧 长期优化</h3>';
      recommendations.longTerm.forEach(rec => {
        content += `
          <div class="recommendation-item no-break">
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-description">${rec.description}</div>
            ${rec.benefits ? `<div class="recommendation-steps">预期收益: ${rec.benefits.join(', ')}</div>` : ''}
          </div>
        `;
      });
    }

    content += '</div>';
    return content;
  }

  /**
   * 生成附录部分
   * @param {Object} reportData - 报告数据
   * @param {Object} styles - 样式配置
   * @returns {string} HTML 内容
   */
  generateAppendixSection(reportData, styles) {
    return `
      <div class="section page-break">
        <h2 class="section-title">📋 附录</h2>
        <table class="analysis-table">
          <tr>
            <th>项目</th>
            <th>信息</th>
          </tr>
          <tr>
            <td>报告版本</td>
            <td>${reportData.version}</td>
          </tr>
          <tr>
            <td>生成时间</td>
            <td>${new Date(reportData.timestamp).toLocaleString('zh-CN')}</td>
          </tr>
          <tr>
            <td>组件名称</td>
            <td>${reportData.componentName}</td>
          </tr>
          <tr>
            <td>工具版本</td>
            <td>Figma 还原监控 v1.0.0</td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * 生成 PDF Blob
   * @param {string} htmlContent - HTML 内容
   * @param {Object} templateConfig - 模板配置
   * @returns {Promise<Blob>} PDF Blob
   */
  async generatePDFBlob(htmlContent, templateConfig) {
    // 创建隐藏的 iframe 用于打印
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    
    document.body.appendChild(iframe);
    
    try {
      // 写入内容
      iframe.contentDocument.open();
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();
      
      // 等待内容加载完成
      await new Promise(resolve => {
        iframe.onload = resolve;
        setTimeout(resolve, 1000); // 备用超时
      });
      
      // 使用 html2canvas 和 jsPDF 生成 PDF（这里简化为返回 HTML blob）
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      
      return htmlBlob;
    } finally {
      document.body.removeChild(iframe);
    }
  }

  /**
   * 下载 PDF 文件
   * @param {Blob} pdfBlob - PDF Blob
   * @param {string} filename - 文件名
   */
  downloadPDF(pdfBlob, filename) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 图片转 base64
   * @param {string} imagePath - 图片路径
   * @returns {Promise<string>} base64 字符串
   */
  async imageToBase64(imagePath) {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 透明图片
    }
  }

  /**
   * 获取状态样式类
   * @param {number} percentage - 匹配百分比
   * @returns {string} 样式类名
   */
  getStatusClass(percentage) {
    if (percentage >= 95) return 'status-excellent';
    if (percentage >= 90) return 'status-good';
    if (percentage >= 80) return 'status-needs-improvement';
    return 'status-poor';
  }

  /**
   * 获取状态文本
   * @param {string} status - 状态
   * @returns {string} 状态文本
   */
  getStatusText(status) {
    const statusMap = {
      excellent: '优秀',
      good: '良好',
      needs_improvement: '需改进',
      poor: '较差',
      unknown: '未知'
    };
    return statusMap[status] || status;
  }

  /**
   * 获取可用模板列表
   * @returns {Array} 模板列表
   */
  getAvailableTemplates() {
    return Array.from(this.templates.entries()).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description
    }));
  }

  /**
   * 设置默认模板
   * @param {string} templateKey - 模板键
   */
  setDefaultTemplate(templateKey) {
    if (this.templates.has(templateKey)) {
      this.defaultTemplate = templateKey;
    }
  }
}

/**
 * 分享服务 - 创建可分享的对比结果链接
 */
export class ShareService {
  constructor() {
    this.baseUrl = window.location.origin;
    this.shareLinks = new Map();
    this.qrCodeCache = new Map();
  }

  /**
   * 生成分享链接
   * @param {string} componentName - 组件名称
   * @param {Object} options - 分享选项
   * @returns {Promise<Object>} 分享信息
   */
  async generateShareLink(componentName, options = {}) {
    const {
      includeImages = true,
      includeAnalysis = true,
      includeRecommendations = true,
      expiresIn = 7 * 24 * 60 * 60 * 1000, // 7天
      password = null,
      allowDownload = true
    } = options;

    try {
      // 生成分享 ID
      const shareId = this.generateShareId();
      const expiresAt = new Date(Date.now() + expiresIn);
      
      // 创建分享配置
      const shareConfig = {
        id: shareId,
        componentName,
        createdAt: new Date(),
        expiresAt,
        options: {
          includeImages,
          includeAnalysis,
          includeRecommendations,
          allowDownload
        },
        password,
        accessCount: 0,
        lastAccessed: null
      };

      // 保存分享配置
      this.shareLinks.set(shareId, shareConfig);
      
      // 生成分享 URL
      const shareUrl = `${this.baseUrl}/share/${shareId}`;
      
      // 生成二维码
      const qrCodeUrl = await this.generateQRCode(shareUrl);
      
      return {
        shareId,
        shareUrl,
        qrCodeUrl,
        expiresAt,
        password,
        config: shareConfig
      };
    } catch (error) {
      console.error('Failed to generate share link:', error);
      throw new Error(`生成分享链接失败: ${error.message}`);
    }
  }

  /**
   * 获取分享信息
   * @param {string} shareId - 分享 ID
   * @param {string} password - 密码（如果需要）
   * @returns {Promise<Object>} 分享数据
   */
  async getShareData(shareId, password = null) {
    const shareConfig = this.shareLinks.get(shareId);
    
    if (!shareConfig) {
      throw new Error('分享链接不存在或已过期');
    }
    
    // 检查是否过期
    if (new Date() > shareConfig.expiresAt) {
      this.shareLinks.delete(shareId);
      throw new Error('分享链接已过期');
    }
    
    // 检查密码
    if (shareConfig.password && shareConfig.password !== password) {
      throw new Error('密码错误');
    }
    
    // 更新访问统计
    shareConfig.accessCount++;
    shareConfig.lastAccessed = new Date();
    
    try {
      // 获取组件报告数据
      const response = await fetch(`/api/reports/${shareConfig.componentName}/comparison-report.json`);
      
      if (!response.ok) {
        throw new Error('无法获取组件数据');
      }
      
      const reportData = await response.json();
      
      // 根据分享选项过滤数据
      const filteredData = this.filterReportData(reportData, shareConfig.options);
      
      return {
        shareConfig,
        reportData: filteredData
      };
    } catch (error) {
      console.error('Failed to get share data:', error);
      throw new Error(`获取分享数据失败: ${error.message}`);
    }
  }

  /**
   * 生成二维码
   * @param {string} url - URL
   * @returns {Promise<string>} 二维码 URL
   */
  async generateQRCode(url) {
    // 检查缓存
    if (this.qrCodeCache.has(url)) {
      return this.qrCodeCache.get(url);
    }

    try {
      // 使用 QR Code API 生成二维码
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      
      // 验证二维码是否可用
      const response = await fetch(qrApiUrl);
      if (response.ok) {
        this.qrCodeCache.set(url, qrApiUrl);
        return qrApiUrl;
      }
      
      // 备用方案：生成简单的二维码占位符
      const fallbackQR = this.generateFallbackQRCode(url);
      this.qrCodeCache.set(url, fallbackQR);
      return fallbackQR;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return this.generateFallbackQRCode(url);
    }
  }

  /**
   * 生成备用二维码
   * @param {string} url - URL
   * @returns {string} 二维码数据 URL
   */
  generateFallbackQRCode(url) {
    // 创建简单的二维码占位符
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // 绘制背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    
    // 绘制边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 180, 180);
    
    // 绘制文本
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', 100, 100);
    ctx.fillText('Placeholder', 100, 120);
    
    return canvas.toDataURL();
  }

  /**
   * 过滤报告数据
   * @param {Object} reportData - 原始报告数据
   * @param {Object} options - 过滤选项
   * @returns {Object} 过滤后的数据
   */
  filterReportData(reportData, options) {
    const filtered = {
      componentName: reportData.componentName,
      timestamp: reportData.timestamp,
      version: reportData.version,
      summary: reportData.summary
    };

    if (options.includeImages) {
      filtered.images = reportData.images;
    }

    if (options.includeAnalysis) {
      filtered.analysis = reportData.analysis;
    }

    if (options.includeRecommendations) {
      filtered.recommendations = reportData.recommendations;
    }

    return filtered;
  }

  /**
   * 生成分享 ID
   * @returns {string} 分享 ID
   */
  generateShareId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 删除分享链接
   * @param {string} shareId - 分享 ID
   */
  deleteShareLink(shareId) {
    this.shareLinks.delete(shareId);
    console.log(`Share link ${shareId} deleted`);
  }

  /**
   * 清理过期的分享链接
   */
  cleanupExpiredLinks() {
    const now = new Date();
    const expiredIds = [];
    
    for (const [shareId, config] of this.shareLinks.entries()) {
      if (now > config.expiresAt) {
        expiredIds.push(shareId);
      }
    }
    
    expiredIds.forEach(id => {
      this.shareLinks.delete(id);
    });
    
    if (expiredIds.length > 0) {
      console.log(`Cleaned up ${expiredIds.length} expired share links`);
    }
  }

  /**
   * 获取分享统计
   * @returns {Object} 分享统计信息
   */
  getShareStats() {
    const stats = {
      totalShares: this.shareLinks.size,
      activeShares: 0,
      totalAccess: 0,
      recentAccess: 0
    };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const config of this.shareLinks.values()) {
      if (now <= config.expiresAt) {
        stats.activeShares++;
      }
      
      stats.totalAccess += config.accessCount;
      
      if (config.lastAccessed && config.lastAccessed > oneDayAgo) {
        stats.recentAccess++;
      }
    }

    return stats;
  }
}

// 创建单例实例
export const pdfExporter = new PDFExporter();
export const shareService = new ShareService();

// 定期清理过期的分享链接
setInterval(() => {
  shareService.cleanupExpiredLinks();
}, 60 * 60 * 1000); // 每小时清理一次