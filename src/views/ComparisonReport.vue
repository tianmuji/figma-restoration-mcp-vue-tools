<template>
  <div class="comparison-report">
    <div class="nav-bar">
      <h2>Figma Restoration Report: {{ componentName }}</h2>
      <div class="nav-actions">
        <router-link to="/" class="back-link">← Back to Home</router-link>
        <router-link :to="`/component/${componentName}`" class="view-component">View Component</router-link>
      </div>
    </div>

    <div class="report-content" v-if="reportData">
      <!-- Summary Section -->
      <div class="summary-section">
        <div class="summary-card" :class="summaryStatus">
          <h3>{{ reportData.componentName }} - Restoration Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="label">Match Percentage:</span>
              <span class="value" :class="matchClass">{{ matchPercentage }}%</span>
            </div>
            <div class="stat">
              <span class="label">Pixel Differences:</span>
              <span class="value">{{ pixelDifferences }}</span>
            </div>
            <div class="stat">
              <span class="label">Quality Level:</span>
              <span class="value" :class="statusClass">{{ qualityLevel }}</span>
            </div>
            <div class="stat">
              <span class="label">Image Size:</span>
              <span class="value">{{ imageDimensions }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Comparison Section -->
      <div class="comparison-section">
        <h3>Visual Comparison</h3>
        <div class="image-grid">
          <div class="image-item">
            <h4>Expected (Figma Design)</h4>
            <div class="image-container">
              <img v-if="expectedImage" :src="expectedImage" alt="Expected Design" />
              <div v-else class="no-image">
                <p>Expected image not available</p>
                <small>Please export from Figma and save as expected.png</small>
              </div>
            </div>
          </div>
          
          <div class="image-item">
            <h4>Actual (Vue Component)</h4>
            <div class="image-container">
              <img v-if="actualImage" :src="actualImage" alt="Actual Component" />
              <div v-else class="no-image">
                <p>Component screenshot not available</p>
                <small>Run snapdom_screenshot to generate</small>
              </div>
            </div>
          </div>
          
          <div class="image-item">
            <h4>Difference Overlay</h4>
            <div class="image-container">
              <img v-if="diffImage" :src="diffImage" alt="Difference Overlay" />
              <div v-else class="no-image">
                <p>Difference overlay not available</p>
                <small>Run figma_compare to generate</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Region Analysis Section -->
      <div class="region-section" v-if="regionAnalysis">
        <h3>Difference Analysis</h3>
        <div class="region-summary">
          <div class="region-stats">
            <div class="stat">
              <span class="label">Difference Regions:</span>
              <span class="value">{{ regionAnalysis.regions?.length || 0 }}</span>
            </div>
            <div class="stat">
              <span class="label">Total Pixels:</span>
              <span class="value">{{ (regionAnalysis.summary?.totalPixels || 0).toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="recommendations" v-if="regionAnalysis.recommendations?.length">
            <h4>Optimization Recommendations</h4>
            <div v-for="(rec, index) in regionAnalysis.recommendations" :key="index" class="recommendation-item">
              <span class="priority" :class="`priority-${rec.priority}`">{{ rec.priority }}</span>
              <div class="rec-content">
                <strong>{{ rec.type }}:</strong> {{ rec.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Details Section -->
      <div class="details-section">
        <h3>Technical Details</h3>
        <div class="details-grid">
          <div class="detail-card">
            <h4>Component Information</h4>
            <ul>
              <li><strong>Name:</strong> {{ componentName }}</li>
              <li><strong>Report Generated:</strong> {{ formatDate(reportData.timestamp) }}</li>
              <li><strong>Component Path:</strong> <code>src/components/{{ componentName }}/index.vue</code></li>
              <li><strong>Test URL:</strong> <a :href="testUrl" target="_blank">{{ testUrl }}</a></li>
            </ul>
          </div>
          
          <div class="detail-card">
            <h4>Image Specifications</h4>
            <ul>
              <li><strong>Image Size:</strong> {{ imageDimensions }}</li>
              <li><strong>Scale Factor:</strong> 3x (snapDOM)</li>
              <li><strong>Comparison Threshold:</strong> {{ threshold }}%</li>
              <li><strong>Quality Assessment:</strong> {{ qualityLevel }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Next Steps Section -->
      <div class="next-steps-section" v-if="reportData.summary?.nextSteps">
        <h3>Recommended Next Steps</h3>
        <div class="steps-list">
          <div v-for="(step, index) in reportData.summary.nextSteps" :key="index" class="step-item">
            <span class="step-number">{{ index + 1 }}</span>
            <span class="step-text">{{ step }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading">
      <p>Loading comparison report...</p>
    </div>

    <div v-else class="error-state">
      <h3>Report Not Found</h3>
      <p>No comparison report found for component "{{ componentName }}".</p>
      <p>Please run the figma_compare tool first:</p>
      <code>figma_compare --componentName {{ componentName }}</code>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComparisonReport',
  data() {
    return {
      reportData: null,
      expectedImage: null,
      actualImage: null,
      diffImage: null,
      loading: true,
      error: null
    }
  },
  computed: {
    componentName() {
      return this.$route.params.component
    },
    matchPercentage() {
      return this.reportData?.comparison?.matchPercentage?.toFixed(2) || 0
    },
    pixelDifferences() {
      const diffPixels = this.reportData?.comparison?.diffPixels || 0
      const totalPixels = this.reportData?.comparison?.totalPixels || 0
      return totalPixels > 0 ? `${diffPixels.toLocaleString()}/${totalPixels.toLocaleString()}` : 'N/A'
    },
    qualityLevel() {
      return this.reportData?.comparison?.qualityLevel?.text || 
             this.reportData?.summary?.qualityLevel?.text || 
             this.reportData?.regionAnalysis?.summary?.qualityLevel?.text || 
             'Unknown'
    },
    imageDimensions() {
      const dims = this.reportData?.comparison?.dimensions
      return dims ? `${dims.width} × ${dims.height}` : 'N/A'
    },
    regionAnalysis() {
      return this.reportData?.comparison?.regionAnalysis || this.reportData?.regionAnalysis
    },
    statusClass() {
      const percentage = parseFloat(this.matchPercentage)
      if (percentage >= 99) return 'status-excellent'
      if (percentage >= 95) return 'status-good'
      if (percentage >= 90) return 'status-fair'
      return 'status-poor'
    },
    matchClass() {
      return this.statusClass
    },
    summaryStatus() {
      return this.statusClass
    },
    testUrl() {
      return `http://localhost:1932/component/${this.componentName}`
    },
    threshold() {
      return 2 // Default threshold is 0.02, display as 2%
    }
  },
  async mounted() {
    await this.loadReportData()
    await this.loadImages()
    this.loading = false
  },
  methods: {
    async loadReportData() {
      try {
        // 尝试从组件的results目录加载报告数据
        const response = await fetch(`/src/components/${this.componentName}/results/figma-analysis-report.json`)
        if (response.ok) {
          this.reportData = await response.json()
          console.log('Loaded report data:', this.reportData)
          return
        }

        // 如果直接路径不可用，尝试相对路径
        const altResponse = await fetch(`/components/${this.componentName}/results/figma-analysis-report.json`)
        if (altResponse.ok) {
          this.reportData = await altResponse.json()
          return
        }

        throw new Error('Report file not found')
      } catch (error) {
        console.error('Failed to load report data:', error)
        this.error = error.message
        // 使用模拟数据作为fallback
        this.reportData = this.createFallbackReport()
      }
    },

    createFallbackReport() {
      return {
        componentName: this.componentName,
        timestamp: new Date().toISOString(),
        comparison: {
          matchPercentage: 0,
          diffPixels: 0,
          totalPixels: 0,
          dimensions: { width: 0, height: 0 },
          qualityLevel: { text: 'No Data', level: 'unknown' }
        },
        summary: {
          nextSteps: [
            '1. Run snapdom_screenshot tool to capture component',
            '2. Export expected.png from Figma',
            '3. Run figma_compare tool for analysis'
          ]
        }
      }
    },

    async loadImages() {
      try {
        // 构建基础路径
        const basePath = `/src/components/${this.componentName}/results`
        
        // 设置图像路径
        this.expectedImage = `${basePath}/expected.png`
        this.actualImage = `${basePath}/actual.png`
        this.diffImage = `${basePath}/diff.png`

        // 验证图像是否存在
        await this.validateImages()
      } catch (error) {
        console.error('Failed to load images:', error)
      }
    },

    async validateImages() {
      // 检查actual.png
      const actualExists = await this.checkImageExists(this.actualImage)
      if (!actualExists) {
        this.actualImage = null
      }

      // 检查expected.png
      const expectedExists = await this.checkImageExists(this.expectedImage)
      if (!expectedExists) {
        this.expectedImage = null
      }

      // 检查diff.png
      const diffExists = await this.checkImageExists(this.diffImage)
      if (!diffExists) {
        this.diffImage = null
      }
    },

    async checkImageExists(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok
      } catch (error) {
        return false
      }
    },

    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.comparison-report {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.nav-bar {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.nav-bar h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 20px;
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.back-link, .view-component {
  color: #3b82f6;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 14px;
}

.back-link:hover, .view-component:hover {
  background-color: #3b82f6;
  color: white;
}

.report-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.summary-section {
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
  transition: all 0.2s;
}

.summary-card.status-excellent {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.summary-card.status-good {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
}

.summary-card.status-fair {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.summary-card.status-poor {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
}

.summary-card h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.stat .label {
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.stat .value {
  font-weight: 700;
  font-size: 16px;
}

.value.status-excellent {
  color: #10b981;
}

.value.status-good {
  color: #3b82f6;
}

.value.status-fair {
  color: #f59e0b;
}

.value.status-poor {
  color: #ef4444;
}

.comparison-section, .region-section, .details-section, .next-steps-section {
  margin-bottom: 32px;
}

.comparison-section h3, .region-section h3, .details-section h3, .next-steps-section h3 {
  margin-bottom: 16px;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.image-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.image-item:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.image-item h4 {
  margin: 0 0 16px 0;
  color: #374151;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
  transition: all 0.2s;
}

.image-container:hover {
  border-color: #d1d5db;
}

.image-container img {
  max-width: 100%;
  max-height: 350px;
  object-fit: contain;
  border-radius: 4px;
}

.no-image {
  color: #9ca3af;
  text-align: center;
  padding: 20px;
}

.no-image p {
  margin: 0 0 8px 0;
  font-weight: 500;
}

.no-image small {
  font-size: 12px;
  color: #6b7280;
}

.region-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.region-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.recommendations h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
}

.priority {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.priority-high {
  background: #fef2f2;
  color: #dc2626;
}

.priority-medium {
  background: #fffbeb;
  color: #d97706;
}

.priority-low {
  background: #f0fdf4;
  color: #16a34a;
}

.rec-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.detail-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.detail-card h4 {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.detail-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-card li {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  line-height: 1.5;
}

.detail-card li:last-child {
  border-bottom: none;
}

.detail-card a {
  color: #3b82f6;
  text-decoration: none;
}

.detail-card a:hover {
  text-decoration: underline;
}

.detail-card code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.next-steps-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.step-number {
  background: #3b82f6;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-text {
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.loading, .error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #6b7280;
  text-align: center;
  padding: 40px;
}

.error-state h3 {
  color: #ef4444;
  margin-bottom: 16px;
}

.error-state code {
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  margin-top: 16px;
  display: inline-block;
}
</style>
